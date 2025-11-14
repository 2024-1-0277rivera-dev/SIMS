<?php
// api/system/settings.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();

// Only admin can change global settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM system_settings LIMIT 1");
    $row = $stmt->fetch();
    echo json_encode($row ? json_decode($row['value'], true) : (object)[]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($auth['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) { http_response_code(400); echo json_encode(['error'=>'Missing JSON']); exit; }
    $val = json_encode($input);
    // upsert into system_settings
    $db->prepare("INSERT INTO system_settings (`key`, `value`, updated_at) VALUES ('global', :val, NOW())
        ON DUPLICATE KEY UPDATE value = :val, updated_at = NOW()")->execute([':val'=>$val]);
    echo json_encode(['message'=>'Settings saved']);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
