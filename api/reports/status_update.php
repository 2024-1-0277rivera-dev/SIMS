<?php
// api/reports/status_update.php?id=REPORTID
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }

$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
$input = json_decode(file_get_contents('php://input'), true);
$status = $input['status'] ?? null; // pending, reviewed, resolved
if (!$status) { http_response_code(400); echo json_encode(['error'=>'Missing status']); exit; }

$db = get_db();
$db->prepare("UPDATE reports SET status = :status WHERE id = :id")->execute([':status'=>$status, ':id'=>$id]);
echo json_encode(['message'=>'Status updated']);
