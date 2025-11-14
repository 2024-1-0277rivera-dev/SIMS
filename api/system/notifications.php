<?php
// api/system/notifications.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();

// Return notifications targeted to user's role/team or direct user id
$stmt = $db->prepare("SELECT * FROM notifications WHERE 
    JSON_CONTAINS(target_roles, JSON_QUOTE(:role)) OR
    (target_team_id IS NOT NULL AND target_team_id = :team) OR
    (target_user_id IS NOT NULL AND target_user_id = :uid)
    ORDER BY created_at DESC LIMIT 100");
$stmt->execute([':role'=>$auth['role'], ':team'=>$auth['team_id'] ?? null, ':uid'=>$auth['id']]);
$rows = $stmt->fetchAll();
echo json_encode($rows);
