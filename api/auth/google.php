<?php
// api/auth/google.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../models/User.php';

/*
This endpoint expects { idToken } from the client (Google ID token).
It verifies the token by calling Google's tokeninfo endpoint and ensures
the token's aud (client_id) matches your Google OAuth client ID.

IMPORTANT:
- Set GOOGLE_CLIENT_ID in config or environment and update below.
*/

define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_HERE'); // replace this

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['idToken'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing idToken']);
    exit;
}
$idToken = $input['idToken'];

// Verify token using Google's tokeninfo endpoint (HTTPS GET)
$verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($idToken);
$ctx = stream_context_create(['http' => ['timeout' => 5]]);
$response = @file_get_contents($verifyUrl, false, $ctx);
if ($response === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Unable to verify token with Google']);
    exit;
}
$payload = json_decode($response, true);
if (!$payload || empty($payload['aud'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid token payload']);
    exit;
}

// check audience (client id)
if ($payload['aud'] !== GOOGLE_CLIENT_ID) {
    http_response_code(401);
    echo json_encode(['error' => 'Token was not issued for this app (aud mismatch)']);
    exit;
}

// check exp
if (isset($payload['exp']) && time() > intval($payload['exp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Token expired']);
    exit;
}

// At this point token is valid. Extract email and profile info
$email = $payload['email'] ?? null;
$first = $payload['given_name'] ?? ($payload['name'] ?? null);
$last = $payload['family_name'] ?? null;
$avatar = $payload['picture'] ?? null;

if (!$email) { http_response_code(400); echo json_encode(['error'=>'Email missing in token']); exit; }

// find or create user
$user = User::findByEmail($email);
$db = get_db();
if (!$user) {
    // create user with random password
    $password_hash = password_hash(bin2hex(random_bytes(12)), PASSWORD_DEFAULT);
    $userId = User::create([
        'first_name' => $first ?? 'User',
        'last_name' => $last ?? '',
        'email' => $email,
        'password_hash' => $password_hash,
        'role' => 'user',
        'avatar' => $avatar ?? null
    ]);
    $user = User::findById($userId);
    $isNew = true;
} else {
    $isNew = false;
    // optionally update avatar/name if missing
    $updateFields = [];
    if (empty($user['avatar']) && $avatar) $updateFields['avatar'] = $avatar;
    if (empty($user['first_name']) && $first) $updateFields['first_name'] = $first;
    if (empty($user['last_name']) && $last) $updateFields['last_name'] = $last;
    if (!empty($updateFields)) User::update($user['id'], $updateFields);
}

$token = jwt_encode(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);
echo json_encode(['token'=>$token, 'user'=>$user, 'isNew'=>$isNew]);
