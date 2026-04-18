<?php
session_start();
require_once '../config/db.php';
require_once '../includes/auth.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['seats']) && count($_POST['seats']) > 0) {
    $user_id = $_SESSION['user_id'];
    $movie_title = trim($_POST['movie_title']);
    $show_time = trim($_POST['show_time']);
    
    $seats_array = $_POST['seats'];
    $seats_formatted = implode(", ", $seats_array);
    $count = count($seats_array);
    $total_price = $count * 250.00; // Fake fixed price logic
    
    // Generate Random PNR format (e.g. AKLPO92)
    $pnr = "AK" . strtoupper(substr(md5(uniqid(rand(), true)), 0, 5));
    
    try {
        $stmt = $pdo->prepare("INSERT INTO bookings (user_id, movie_title, pnr, total_price, seats, show_date, show_time) VALUES (?, ?, ?, ?, ?, CURDATE(), ?)");
        $stmt->execute([$user_id, $movie_title, $pnr, $total_price, $seats_formatted, $show_time]);
        
        echo "<script>alert('Mission Success!\\nYour Ticket PNR: $pnr'); window.location.href='../index.php?page=profile';</script>";
    } catch(PDOException $e) {
        echo "<script>alert('Failed to execute booking. Error: " . $e->getMessage() . "'); window.history.back();</script>";
    }
} else {
    echo "<script>alert('Error: You must select at least one seat before confirming.'); window.history.back();</script>";
}
?>
