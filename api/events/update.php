<?php
// api/events/update.php?id=EVENTID
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }

$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
$input = json_decode(file_get_contents('php://input'), true);
$db = get_db();

$fields = [];
$params = [':id'=>$id];
$allowed = ['name','date','description','criteria','competition_points'];
foreach ($allowed as $k) {
    if (isset($input[$k])) {
        $fields[] = "`$k` = :$k";
        $params[":$k"] = in_array($k,['criteria','competition_points']) ? json_encode($input[$k]) : $input[$k];
    }
}
if (empty($fields)) { http_response_code(400); echo json_encode(['error'=>'No fields to update']); exit; }

$sql = "UPDATE events SET " . implode(',', $fields) . " WHERE id = :id";
$stmt = $db->prepare($sql);
$stmt->execute($params);
echo json_encode(['message'=>'Event updated']);
