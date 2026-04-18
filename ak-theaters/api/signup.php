<?php
session_start();
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $password]);
        
        // Auto login
        $_SESSION['user_id'] = $pdo->lastInsertId();
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        
        header("Location: ../index.php?page=home");
    } catch(PDOException $e) {
        if($e->getCode() == 23000) { // Duplicate entry
            echo "<script>alert('Email already exists.'); window.location.href='../index.php?page=signup';</script>";
        } else {
            die("Signup Failed: " . $e->getMessage());
        }
    }
}
?>
