<?php
// api/reports/reply.php?id=REPORTID
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }

$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['reply'])) { http_response_code(400); echo json_encode(['error'=>'Missing reply']); exit; }

$db = get_db();
// append reply to replies JSON array
$stmt = $db->prepare("SELECT replies FROM reports WHERE id = :id LIMIT 1");
$stmt->execute([':id'=>$id]);
$row = $stmt->fetch();
$replies = $row['replies'] ? json_decode($row['replies'], true) : [];
$replies[] = ['by'=>$auth['id'], 'reply'=>$input['reply'], 'created_at'=>date('c')];

$db->prepare("UPDATE reports SET replies = :replies WHERE id = :id")->execute([':replies'=>json_encode($replies), ':id'=>$id]);

echo json_encode(['message'=>'Reply added']);
