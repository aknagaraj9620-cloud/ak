<?php
$host = 'localhost';
$dbname = 'ak_theaters';
$user = 'root'; // Change if needed on your local XAMPP
$pass = '';     // Change if needed on your local XAMPP

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database Connection failed. Please make sure MySQL/XAMPP is running and database exists. Error: " . $e->getMessage());
}
?>
