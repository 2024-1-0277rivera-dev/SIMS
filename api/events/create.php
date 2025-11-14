<?php
// api/events/create.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$required = ['name','date'];
foreach ($required as $r) if (empty($input[$r])) { http_response_code(400); echo json_encode(['error'=>"Missing $r"]); exit; }

$db = get_db();
$stmt = $db->prepare("INSERT INTO events (name, date, description, criteria, competition_points, created_at) VALUES (:name,:date,:desc,:criteria,:comp,NOW())");
$stmt->execute([
    ':name'=>$input['name'],
    ':date'=>$input['date'],
    ':desc'=>$input['description'] ?? null,
    ':criteria'=>isset($input['criteria']) ? json_encode($input['criteria']) : null,
    ':comp'=>isset($input['competition_points']) ? json_encode($input['competition_points']) : null
]);
$eventId = $db->lastInsertId();
http_response_code(201);
echo json_encode(['message'=>'Event created','id'=>$eventId]);
