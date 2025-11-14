<?php
// api/events/results.php?id=EVENTID  (PUT)
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) {
    http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit;
}

$eventId = $_GET['id'] ?? null;
if (!$eventId) { http_response_code(400); echo json_encode(['error'=>'Missing event id']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['results'])) { http_response_code(400); echo json_encode(['error'=>'Missing results']); exit; }

$db = get_db();
$results = $input['results']; // array of EventResult objects as in spec

// 1. Store raw results JSON on the event
$stmt = $db->prepare("UPDATE events SET results = :results WHERE id = :id");
$stmt->execute([':results' => json_encode($results), ':id' => $eventId]);

// 2. For each team, calculate raw total score based on criteria
// We'll assume EventResult object contains teamId and criteriaScores {criterionKey: number}
$teamScores = [];
foreach ($results as $r) {
    $teamId = $r['teamId'] ?? null;
    if (!$teamId) continue;
    $raw = 0;
    if (!empty($r['criteriaScores']) && is_array($r['criteriaScores'])) {
        foreach ($r['criteriaScores'] as $score) $raw += floatval($score);
    } elseif (isset($r['score'])) {
        $raw = floatval($r['score']);
    }
    $teamScores[$teamId] = $raw;
}

// 3. Sort teams by raw score desc to determine placements
arsort($teamScores);
$placements = array_keys($teamScores); // ordered teamIds

// 4. Calculate competition points based on placement and event's competitionPoints
// We'll fetch event record to read competitionPoints per placement (expect event row to have competition_points JSON)
$stmtEv = $db->prepare("SELECT * FROM events WHERE id = :id");
$stmtEv->execute([':id' => $eventId]);
$event = $stmtEv->fetch();
$competitionPointsMap = [];
if ($event && !empty($event['competition_points'])) {
    $competitionPointsMap = json_decode($event['competition_points'], true); // e.g. { "1": 500, "2": 400 }
}

// default fallback: 1st 500, 2nd 400, 3rd 300
$defaultPoints = [1=>500,2=>400,3=>300];

$rank = 1;
foreach ($placements as $tid) {
    $compPoints = $competitionPointsMap[$rank] ?? ($defaultPoints[$rank] ?? max(0, 100 - ($rank-1)*10));
    // 5. Update each team's eventScores array with the new results
    // Append event score record into team_event_scores table (or into team.event_scores JSON column)
    // For normalized DB we store into team_event_scores
    $stmtIns = $db->prepare("INSERT INTO team_event_scores (team_id, event_id, raw_score, placement, competition_points, created_at) VALUES (:team,:event,:raw,:placement,:pts,NOW())");
    $stmtIns->execute([':team'=>$tid, ':event'=>$eventId, ':raw'=>$teamScores[$tid], ':placement'=>$rank, ':pts'=>$compPoints]);

    // 6. Recalculate each team's total score (sum of event competition_points + merits - demerits)
    // Here we recompute: team.score = SUM(team_event_scores.competition_points) + SUM(merits.points) - SUM(demerits.points)
    $stmtSum = $db->prepare("SELECT 
            COALESCE((SELECT SUM(competition_points) FROM team_event_scores WHERE team_id = :team),0) +
            COALESCE((SELECT SUM(points) FROM points WHERE team_id = :team AND type='merit'),0) -
            COALESCE((SELECT SUM(points) FROM points WHERE team_id = :team AND type='demerit'),0) AS total_score");
    $stmtSum->execute([':team'=>$tid]);
    $row = $stmtSum->fetch();
    $totalScore = $row ? intval($row['total_score']) : 0;
    $stmtUpdateTeam = $db->prepare("UPDATE teams SET score = :score WHERE id = :team");
    $stmtUpdateTeam->execute([':score'=>$totalScore, ':team'=>$tid]);

    // 8. Add progress history entry
    $historyStmt = $db->prepare("INSERT INTO team_progress_history (team_id, event_id, raw_score, placement, competition_points, created_at) VALUES (:team,:event,:raw,:placement,:pts,NOW())");
    $historyStmt->execute([':team'=>$tid, ':event'=>$eventId, ':raw'=>$teamScores[$tid], ':placement'=>$rank, ':pts'=>$compPoints]);

    $rank++;
}

// 7. Recalculate placementStats for all teams (e.g., count of 1st/2nd/3rd), implementation left for full spec
// You may compute placementStats by querying team_event_scores grouped by placement.

echo json_encode(['message'=>'Results processed']);
