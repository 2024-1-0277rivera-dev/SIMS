<?php
// api/auth/login.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../models/User.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing credentials']);
    exit;
}

$userRow = User::findByEmail($input['email']);
if (!$userRow) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

if (!isset($userRow['password_hash']) || !password_verify($input['password'], $userRow['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

// remove sensitive fields
$user = User::findById($userRow['id']);
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

$token = jwt_encode(['id' => $userRow['id'], 'email' => $userRow['email'], 'role' => $userRow['role']]);

echo json_encode(['token' => $token, 'user' => $mapped]);
