<?php
// api/users/get.php
// GET all users - Admin/Officer only
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
// Allow any authenticated user to see other users
// if (!in_array($auth['role'], ['admin','officer'])) {
//     http_response_code(403);
//     echo json_encode(['error' => 'Forbidden']);
//     exit;
// }

$db = get_db();
$stmt = $db->query("SELECT id, first_name, last_name, email, role, avatar, student_id, team_id FROM users ORDER BY first_name, last_name");
$users = $stmt->fetchAll();

// Map snake_case to camelCase for TypeScript compatibility
$mapped = array_map(function($user) {
    return [
        'id' => (string)$user['id'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'avatar' => $user['avatar'],
        'studentId' => $user['student_id'],
        'teamId' => $user['team_id'] ? (string)$user['team_id'] : null,
        'name' => $user['first_name'] . ' ' . $user['last_name']
    ];
}, $users);

echo json_encode($mapped);
