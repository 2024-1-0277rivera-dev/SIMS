<?php
// Quick test to verify database and API endpoints are working
header('Content-Type: application/json');

require_once __DIR__ . '/config/database.php';

try {
    $db = get_db();
    
    // Test 1: Can we connect to DB?
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    
    echo json_encode([
        'status' => 'success',
        'database' => 'connected',
        'user_count' => $result['count'],
        'test_message' => 'Database connection working'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'test_message' => 'Database connection failed'
    ]);
}
?>
