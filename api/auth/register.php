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

// Convert camelCase to snake_case for consistency
$input['first_name'] = $input['first_name'] ?? $input['firstName'] ?? null;
$input['last_name'] = $input['last_name'] ?? $input['lastName'] ?? null;
$input['student_id'] = $input['student_id'] ?? $input['studentId'] ?? null;
$input['year_level'] = $input['year_level'] ?? $input['yearLevel'] ?? null;
$input['contact_info'] = $input['contact_info'] ?? $input['contactInfo'] ?? null;

if (empty($input['email']) || empty($input['password']) || empty($input['first_name']) || empty($input['last_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: email, password, firstName, lastName']);
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
    'bio' => $input['bio'] ?? null,
    'contact_info' => $input['contact_info'] ?? null,
    'year_level' => $input['year_level'] ?? null,
    'section' => $input['section'] ?? null,
    'gender' => $input['gender'] ?? null,
    'birthdate' => $input['birthdate'] ?? null,
]);

$user = User::findById($userId);

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

$token = jwt_encode(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);

http_response_code(201);
echo json_encode(['token' => $token, 'user' => $mapped]);
