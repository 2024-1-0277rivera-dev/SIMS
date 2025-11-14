<?php
// api/teams/get.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/database.php';

$auth = require_auth();
$db = get_db();

// Leaderboard: return teams sorted by score with playersCount and rank
$stmt = $db->query("SELECT t.*, COALESCE(COUNT(u.id),0) AS playersCount
                    FROM teams t
                    LEFT JOIN users u ON u.team_id = t.id
                    GROUP BY t.id
                    ORDER BY t.score DESC, t.name ASC");
$teams = $stmt->fetchAll();

// compute rank (1-based, ties get same rank) and map to camelCase
$rank = 0;
$prevScore = null;
$mapped = [];
foreach ($teams as $i => $t) {
    if ($prevScore === null || $t['score'] < $prevScore) {
        $rank = $i + 1;
    }
    $prevScore = $t['score'];
    
    $mapped[] = [
        'id' => (string)$t['id'],
        'name' => $t['name'],
        'description' => $t['description'],
        'score' => (int)$t['score'],
        'rank' => $rank,
        'playersCount' => (int)$t['playersCount'],
        'wins' => 0,
        'losses' => 0,
        'merits' => $t['merits'] ? json_decode($t['merits'], true) : [],
        'demerits' => $t['demerits'] ? json_decode($t['demerits'], true) : [],
        'eventScores' => $t['event_scores'] ? json_decode($t['event_scores'], true) : [],
        'scoreHistory' => [],
        'progressHistory' => []
    ];
}
echo json_encode($mapped);
