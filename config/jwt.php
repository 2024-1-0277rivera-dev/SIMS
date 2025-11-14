<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

define('JWT_SECRET', 'CHANGE_THIS_TO_A_RANDOM_SECRET_KEY');

function jwt_encode($payload, $exp = 3600) {
    $payload['iat'] = time();
    $payload['exp'] = time() + $exp;
    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

function jwt_decode_token($token) {
    try {
        return (array) JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
    } catch (Exception $e) {
        return null;
    }
}

function bearer_token() {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $h, $m)) return $m[1];
    return null;
}

function require_auth() {
    $token = bearer_token();
    $data = jwt_decode_token($token);
    if (!$data) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    return $data;
}