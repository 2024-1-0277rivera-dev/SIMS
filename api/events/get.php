<?php
// api/events/get.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();
$stmt = $db->query("SELECT * FROM events ORDER BY date DESC");
$events = $stmt->fetchAll();

$mapped = array_map(function($e) {
    return [
        'id' => (string)$e['id'],
        'name' => $e['name'],
        'description' => $e['description'],
        'date' => $e['date'],
        'category' => 'other',
        'status' => 'pending',
        'venue' => '',
        'mechanics' => '',
        'officerInCharge' => '',
        'participantsInfo' => '',
        'criteria' => $e['criteria'] ? json_decode($e['criteria'], true) : [],
        'results' => $e['results'] ? json_decode($e['results'], true) : []
    ];
}, $events);

echo json_encode($mapped);
