<?php
// api/events/delete.php?id=EVENTID
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if ($auth['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Only admin can delete']); exit; }
$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }

$db = get_db();
$db->prepare("DELETE FROM events WHERE id = :id")->execute([':id'=>$id]);
echo json_encode(['message'=>'Event deleted']);
