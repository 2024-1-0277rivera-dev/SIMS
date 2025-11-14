<?php
// api/auth/register.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../models/User.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

if (empty($input['email']) || empty($input['password']) || empty($input['first_name']) || empty($input['last_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// check email unique
if (User::findByEmail($input['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email already exists']);
    exit;
}

$password_hash = password_hash($input['password'], PASSWORD_DEFAULT);

$userId = User::create([
    'first_name' => $input['first_name'],
    'last_name' => $input['last_name'],
    'email' => $input['email'],
    'password_hash' => $password_hash,
    'role' => $input['role'] ?? 'user',
    'avatar' => $input['avatar'] ?? null,
    'student_id' => $input['student_id'] ?? null,
]);

$user = User::findById($userId);

$token = jwt_encode(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);

http_response_code(201);
echo json_encode(['token' => $token, 'user' => $user]);
