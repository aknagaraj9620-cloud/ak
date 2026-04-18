<?php
require_once '../config/db.php';
header('Content-Type: application/json');

try {
    $status = $_GET['status'] ?? 'now_showing';
    $stmt = $pdo->prepare("SELECT * FROM movies WHERE status = ?");
    $stmt->execute([$status]);
    $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $movies]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
