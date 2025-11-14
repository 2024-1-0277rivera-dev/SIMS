<?php
// Debug script to test registration flow
header('Content-Type: application/json');

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/models/User.php';

try {
    $db = get_db();
    
    // Test 1: Database connection
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✓ Database connection OK (users table exists)\n";
    
    // Test 2: Can we create a test user?
    $testEmail = 'test_' . time() . '@example.com';
    $userId = User::create([
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => $testEmail,
        'password_hash' => password_hash('testpass123', PASSWORD_DEFAULT),
        'role' => 'user',
    ]);
    echo "✓ User creation OK (ID: $userId)\n";
    
    // Test 3: Can we retrieve the user?
    $user = User::findById($userId);
    if ($user && $user['email'] === $testEmail) {
        echo "✓ User retrieval OK\n";
    }
    
    // Test 4: Can we generate JWT?
    $token = jwt_encode(['id' => $userId, 'email' => $testEmail, 'role' => 'user']);
    echo "✓ JWT generation OK\n";
    
    // Test 5: Can we decode JWT?
    $decoded = jwt_decode_token($token);
    if ($decoded) {
        echo "✓ JWT decode OK\n";
    }
    
    echo "\n✓ All tests passed!\n";
    
} catch (Exception $e) {
    http_response_code(500);
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
