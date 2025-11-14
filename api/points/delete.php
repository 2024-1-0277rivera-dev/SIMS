<?php
// api/points/delete.php?id=POINTID
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }

$db = get_db();
$stmt = $db->prepare("SELECT team_id FROM points WHERE id = :id LIMIT 1");
$stmt->execute([':id'=>$id]);
$r = $stmt->fetch();
$teamId = $r['team_id'] ?? null;

$db->prepare("DELETE FROM points WHERE id = :id")->execute([':id'=>$id]);

if ($teamId) {
    $stmtSum = $db->prepare("SELECT 
        COALESCE((SELECT SUM(competition_points) FROM team_event_scores WHERE team_id = :team),0) +
        COALESCE((SELECT SUM(points) FROM points WHERE team_id = :team AND type='merit'),0) -
        COALESCE((SELECT SUM(points) FROM points WHERE team_id = :team AND type='demerit'),0) AS total_score");
    $stmtSum->execute([':team'=>$teamId]);
    $row = $stmtSum->fetch();
    $totalScore = $row ? intval($row['total_score']) : 0;
    $db->prepare("UPDATE teams SET score = :score WHERE id = :team")->execute([':score'=>$totalScore, ':team'=>$teamId]);
}

echo json_encode(['message'=>'Point log deleted']);
