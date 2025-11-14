<?php
// api/users/get_by_id.php?id=USERID
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../models/User.php';

$auth = require_auth();
$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

// Anyone authenticated can view - but sensitive fields omitted
$user = User::findById($id);
if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

// Map snake_case to camelCase
$mapped = [
    'id' => (string)$user['id'],
    'firstName' => $user['first_name'],
    'lastName' => $user['last_name'],
    'email' => $user['email'],
    'role' => $user['role'],
    'avatar' => $user['avatar'],
    'studentId' => $user['student_id'],
    'teamId' => $user['team_id'] ? (string)$user['team_id'] : null,
    'bio' => $user['bio'],
    'contactInfo' => $user['contact_info'],
    'yearLevel' => $user['year_level'],
    'section' => $user['section'],
    'gender' => $user['gender'],
    'birthdate' => $user['birthdate'],
    'name' => $user['first_name'] . ' ' . $user['last_name']
];

echo json_encode($mapped);
