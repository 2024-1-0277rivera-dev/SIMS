<?php
// api/teams/join_requests.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();

// POST -> create join request { teamId, message }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['teamId'])) { http_response_code(400); echo json_encode(['error'=>'Missing teamId']); exit; }
    $stmt = $db->prepare("INSERT INTO team_join_requests (team_id, user_id, message, status, created_at) VALUES (:team,:user,:msg,'pending',NOW())");
    $stmt->execute([':team'=>$input['teamId'], ':user'=>$auth['id'], ':msg'=>$input['message'] ?? null]);
    http_response_code(201);
    echo json_encode(['message'=>'Request submitted']);
    exit;
}

// GET -> list requests: admin/officer or team lead for their team
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $teamId = $_GET['teamId'] ?? null;
    if (in_array($auth['role'], ['admin','officer'])) {
        $stmt = $db->query("SELECT r.*, u.first_name, u.last_name FROM team_join_requests r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC");
        $rows = $stmt->fetchAll();
        echo json_encode($rows); exit;
    }
    if ($teamId) {
        // allow team lead/officer to view requests for that team
        $stmt = $db->prepare("SELECT r.*, u.first_name, u.last_name FROM team_join_requests r LEFT JOIN users u ON u.id = r.user_id WHERE r.team_id = :team ORDER BY r.created_at DESC");
        $stmt->execute([':team'=>$teamId]);
        echo json_encode($stmt->fetchAll()); exit;
    }
    http_response_code(403); echo json_encode(['error'=>'Forbidden']);
    exit;
}

// PUT -> update request status (admin/officer/team lead)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!in_array($auth['role'], ['admin','officer','team_lead'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
    $input = json_decode(file_get_contents('php://input'), true);
    $status = $input['status'] ?? null; // accepted, rejected, pending
    if (!$status) { http_response_code(400); echo json_encode(['error'=>'Missing status']); exit; }

    $stmt = $db->prepare("UPDATE team_join_requests SET status = :s, reviewed_by = :by, reviewed_at = NOW() WHERE id = :id");
    $stmt->execute([':s'=>$status, ':by'=>$auth['id'], ':id'=>$id]);

    if ($status === 'accepted') {
        // add user to team
        $stmt2 = $db->prepare("SELECT team_id, user_id FROM team_join_requests WHERE id = :id LIMIT 1");
        $stmt2->execute([':id'=>$id]);
        $r = $stmt2->fetch();
        if ($r) {
            $db->prepare("UPDATE users SET team_id = :team WHERE id = :user")->execute([':team'=>$r['team_id'], ':user'=>$r['user_id']]);
        }
    }

    echo json_encode(['message'=>'Updated']);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
