<?php
// api/points/update.php?id=POINTID  (PUT)
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }

$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
$input = json_decode(file_get_contents('php://input'), true);

$allowed = ['type','reason','points','team_id'];
$fields = [];
$params = [':id'=>$id];
foreach ($allowed as $k) {
    if (isset($input[$k])) { $fields[] = "`$k` = :$k"; $params[":$k"] = $input[$k]; }
}
if (empty($fields)) { http_response_code(400); echo json_encode(['error'=>'No fields to update']); exit; }
$sql = "UPDATE points SET " . implode(',', $fields) . " WHERE id = :id";
$db = get_db();
$stmt = $db->prepare($sql);
$stmt->execute($params);

// Recompute team score if team_id updated or exists
$teamId = $input['team_id'] ?? null;
if (!$teamId) {
    $row = $db->prepare("SELECT team_id FROM points WHERE id = :id LIMIT 1");
    $row->execute([':id'=>$id]);
    $res = $row->fetch();
    $teamId = $res['team_id'] ?? null;
}
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

echo json_encode(['message'=>'Point log updated']);
