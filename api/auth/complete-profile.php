<?php
// api/auth/complete-profile.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Only allow the user to update their own profile
$userId = $auth['id'];

// Map camelCase to snake_case
$camelToSnake = [
    'firstName' => 'first_name',
    'lastName' => 'last_name',
    'studentId' => 'student_id',
    'contactInfo' => 'contact_info',
    'yearLevel' => 'year_level',
];

$fields = [];
$allowed = ['first_name','last_name','avatar','student_id','bio','contact_info','year_level','section','gender','birthdate'];

foreach ($allowed as $k) {
    if (isset($input[$k])) {
        $fields[$k] = $input[$k];
    }
}

// Also check for camelCase versions
foreach ($camelToSnake as $camel => $snake) {
    if (isset($input[$camel]) && !isset($input[$snake])) {
        $fields[$snake] = $input[$camel];
    }
}

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(['error' => 'No updatable fields provided']);
    exit;
}

$ok = \User::update($userId, $fields);
if (!$ok) {
    http_response_code(500);
    echo json_encode(['error' => 'Update failed']);
    exit;
}

$user = \User::findById($userId);

// Map to camelCase
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

echo json_encode(['user' => $mapped]);
