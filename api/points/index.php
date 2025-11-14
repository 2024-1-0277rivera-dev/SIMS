<?php
// api/points/index.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();

// POST: add merit/demerit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
    $input = json_decode(file_get_contents('php://input'), true);
    $required = ['teamId','type','points','reason'];
    foreach ($required as $r) if (!isset($input[$r])) { http_response_code(400); echo json_encode(['error'=>"Missing $r"]); exit; }

    $db = get_db();
    $stmt = $db->prepare("INSERT INTO points (team_id, type, reason, points, created_by, created_at) VALUES (:team,:type,:reason,:points,:by,NOW())");
    $stmt->execute([':team'=>$input['teamId'], ':type'=>$input['type'], ':reason'=>$input['reason'], ':points'=>$input['points'], ':by'=>$auth['id']]);

    // Recalculate team.score as in events/results (sum of event points + merits - demerits)
    // For simplicity, recompute:
    $stmtSum = $db->prepare("SELECT 
            COALESCE((SELECT SUM(competition_points) FROM team_event_scores WHERE team_id = :team),0) +
            COALESCE((SELECT SUM(points) FROM points WHERE team_id = :team AND type='merit'),0) -
            COALESCE((SELECT SUM(points) FROM points WHERE team_id = :team AND type='demerit'),0) AS total_score");
    $stmtSum->execute([':team'=>$input['teamId']]);
    $row = $stmtSum->fetch();
    $totalScore = $row ? intval($row['total_score']) : 0;
    $stmtUpdateTeam = $db->prepare("UPDATE teams SET score = :score WHERE id = :team");
    $stmtUpdateTeam->execute([':score'=>$totalScore, ':team'=>$input['teamId']]);

    http_response_code(201);
    echo json_encode(['message'=>'Log added']);
    exit;
}

// Implement PUT / DELETE similarly (use query param logId and method override)
http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
