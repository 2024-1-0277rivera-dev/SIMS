<?php
// api/reports/index.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Admin/officer: get all; else: only own
    if (in_array($auth['role'], ['admin','officer'])) {
        $stmt = $db->query("SELECT * FROM reports ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
    } else {
        $stmt = $db->prepare("SELECT * FROM reports WHERE submitted_by = :uid ORDER BY created_at DESC");
        $stmt->execute([':uid'=>$auth['id']]);
        $rows = $stmt->fetchAll();
    }
    echo json_encode($rows);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $required = ['type','description'];
    foreach ($required as $r) if (empty($input[$r])) { http_response_code(400); echo json_encode(['error'=>"Missing $r"]); exit; }

    $stmt = $db->prepare("INSERT INTO reports (type, description, submitted_by, status, created_at) VALUES (:type,:desc,:by,'pending',NOW())");
    $stmt->execute([':type'=>$input['type'], ':desc'=>$input['description'], ':by'=>$auth['id']]);

    http_response_code(201);
    echo json_encode(['message'=>'Report submitted']);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
