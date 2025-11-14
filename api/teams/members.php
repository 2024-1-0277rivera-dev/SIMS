<?php
// api/teams/members.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();

// GET ?teamId= -> list members
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $teamId = $_GET['teamId'] ?? null;
    if (!$teamId) { http_response_code(400); echo json_encode(['error'=>'Missing teamId']); exit; }
    $stmt = $db->prepare("SELECT id, first_name, last_name, email, student_id, year_level, section FROM users WHERE team_id = :team ORDER BY first_name, last_name");
    $stmt->execute([':team'=>$teamId]);
    $users = $stmt->fetchAll();
    
    // Map to camelCase
    $mapped = array_map(function($user) {
        return [
            'id' => (string)$user['id'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'email' => $user['email'],
            'studentId' => $user['student_id'],
            'yearLevel' => $user['year_level'],
            'section' => $user['section'],
            'name' => $user['first_name'] . ' ' . $user['last_name']
        ];
    }, $users);
    
    echo json_encode($mapped);
    exit;
}

// POST -> add member (admin/officer). body: { teamId, userId }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['teamId']) || empty($input['userId'])) { http_response_code(400); echo json_encode(['error'=>'Missing teamId or userId']); exit; }
    $stmt = $db->prepare("UPDATE users SET team_id = :team WHERE id = :user");
    $stmt->execute([':team'=>$input['teamId'], ':user'=>$input['userId']]);
    echo json_encode(['message'=>'Member added']);
    exit;
}

// DELETE -> remove member ?userId=
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!in_array($auth['role'], ['admin','officer'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
    parse_str(file_get_contents("php://input"), $delInput);
    $userId = $delInput['userId'] ?? null;
    if (!$userId) { http_response_code(400); echo json_encode(['error'=>'Missing userId']); exit; }
    $stmt = $db->prepare("UPDATE users SET team_id = NULL WHERE id = :user");
    $stmt->execute([':user'=>$userId]);
    echo json_encode(['message'=>'Member removed']);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
