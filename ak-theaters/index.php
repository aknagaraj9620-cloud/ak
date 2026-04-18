<?php
session_start();
require_once 'config/db.php';

$page = isset($_GET['page']) ? $_GET['page'] : 'home';
$allowed_pages = ['home', 'movies', 'movie-details', 'booking', 'profile', 'login', 'signup', 'reset-password'];

if (!in_array($page, $allowed_pages)) {
    $page = 'home';
}

require_once 'includes/header.php';
require_once "pages/$page.php";
require_once 'includes/footer.php';
?>
