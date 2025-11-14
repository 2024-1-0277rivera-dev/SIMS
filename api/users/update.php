<?php
// api/users/update.php?id=USERID
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

// Only user themself or admin can update
if ($auth['id'] != $id && $auth['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Map camelCase to snake_case
$camelToSnake = [
    'firstName' => 'first_name',
    'lastName' => 'last_name',
    'studentId' => 'student_id',
    'contactInfo' => 'contact_info',
    'yearLevel' => 'year_level',
    'teamId' => 'team_id',
];

$allowed = ['first_name','last_name','avatar','student_id','bio','contact_info','year_level','section','gender','birthdate','team_id'];
$fields = [];

// Check for snake_case fields
foreach ($allowed as $k) if (array_key_exists($k, $input)) $fields[$k] = $input[$k];

// Check for camelCase fields
foreach ($camelToSnake as $camel => $snake) {
    if (array_key_exists($camel, $input) && !array_key_exists($snake, $fields)) {
        $fields[$snake] = $input[$camel];
    }
}

if (isset($input['password'])) {
    $fields['password_hash'] = password_hash($input['password'], PASSWORD_DEFAULT);
}

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update']);
    exit;
}

$ok = User::update($id, $fields);
if (!$ok) { http_response_code(500); echo json_encode(['error'=>'Update failed']); exit; }

$user = User::findById($id);

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

echo json_encode($mapped);
