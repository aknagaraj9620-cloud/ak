<?php
/**
 * AK THEATERS - Backend API Logic for XAMPP
 * Handles Auth, Movies, Bookings, and Admin Panel data.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database Configuration
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'ak_theaters';

// Connect to Database
$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
}

// Request Handling
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api'; // Adjust based on your local folder structure

// Get query params
$query = parse_url($request_uri, PHP_URL_QUERY);
parse_str($query, $params);

// Path extraction
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace($base_path, '', $path);

// Simple Router
switch ($path) {
    case '/movies':
        handleMovies($conn, $params);
        break;
    
    case '/movies/details':
        handleMovieDetails($conn, $params);
        break;

    case '/shows':
        handleShows($conn, $params);
        break;

    case '/auth/login':
        handleLogin($conn);
        break;

    case '/auth/signup':
        handleSignup($conn);
        break;

    case '/bookings':
        handleBookings($conn, $params);
        break;

    case '/admin/stats':
        handleAdminStats($conn);
        break;

    default:
        echo json_encode(['status' => 'online', 'message' => 'AK Theaters API is ready.']);
        break;
}

$conn->close();

// --- Handler Functions ---

function handleMovies($conn, $params) {
    $status = isset($params['status']) ? $params['status'] : 'now_showing';
    $limit = isset($params['limit']) ? (int)$params['limit'] : 20;
    
    $sql = "SELECT * FROM movies WHERE status = '$status' LIMIT $limit";
    $result = $conn->query($sql);
    
    $movies = [];
    while($row = $result->fetch_assoc()) {
        $movies[] = $row;
    }
    echo json_encode($movies);
}

function handleMovieDetails($conn, $params) {
    $id = (int)$params['id'];
    $sql = "SELECT * FROM movies WHERE id = $id";
    $result = $conn->query($sql);
    $movie = $result->fetch_assoc();
    
    if ($movie) {
        // Fetch Cast
        $cast_sql = "SELECT p.*, mc.character_name FROM persons p 
                     JOIN movie_crew mc ON p.id = mc.person_id 
                     WHERE mc.movie_id = $id AND mc.type = 'cast'";
        $cast_res = $conn->query($cast_sql);
        $movie['cast'] = [];
        while($c = $cast_res->fetch_assoc()) $movie['cast'][] = $c;

        // Fetch Crew
        $crew_sql = "SELECT p.*, mc.role FROM persons p 
                     JOIN movie_crew mc ON p.id = mc.person_id 
                     WHERE mc.movie_id = $id AND mc.type = 'crew'";
        $crew_res = $conn->query($crew_sql);
        $movie['crew'] = [];
        while($cr = $crew_res->fetch_assoc()) $movie['crew'][] = $cr;
    }
    
    echo json_encode($movie);
}

function handleShows($conn, $params) {
    $movie_id = (int)$params['movie_id'];
    $date = isset($params['date']) ? $params['date'] : date('Y-m-d');
    
    $sql = "SELECT s.*, t.name as theater_name, t.location FROM shows s 
            JOIN theaters t ON s.theater_id = t.id 
            WHERE s.movie_id = $movie_id AND s.show_date = '$date'";
    $result = $conn->query($sql);
    
    $shows = [];
    while($row = $result->fetch_assoc()) {
        $shows[] = $row;
    }
    echo json_encode($shows);
}

function handleLogin($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $conn->real_escape_string($data['email']);
    $password = $data['password'];

    $sql = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($sql);
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
}

function handleSignup($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $conn->real_escape_string($data['name']);
    $email = $conn->real_escape_string($data['email']);
    $phone = $conn->real_escape_string($data['phone']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (name, email, phone, password) VALUES ('$name', '$email', '$phone', '$password')";
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
    }
}

function handleBookings($conn, $params) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = (int)$params['user_id'];
        $sql = "SELECT b.*, m.title, s.show_time, s.show_date FROM bookings b 
                JOIN shows s ON b.show_id = s.id 
                JOIN movies m ON s.movie_id = m.id 
                WHERE b.user_id = $user_id";
        $result = $conn->query($sql);
        $bookings = [];
        while($row = $result->fetch_assoc()) $bookings[] = $row;
        echo json_encode($bookings);
    } else {
        // Create Booking
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = (int)$data['user_id'];
        $show_id = (int)$data['show_id'];
        $total = (float)$data['total'];
        $seats = $data['seats']; // Array of seat labels
        $pnr = 'AK' . strtoupper(substr(md5(time()), 0, 6));

        $sql = "INSERT INTO bookings (user_id, show_id, pnr, total_price, status) 
                VALUES ($user_id, $show_id, '$pnr', $total, 'confirmed')";
        
        if ($conn->query($sql)) {
            $booking_id = $conn->insert_id;
            foreach ($seats as $seat) {
                $conn->query("INSERT INTO booked_seats (booking_id, seat_label) VALUES ($booking_id, '$seat')");
            }
            echo json_encode(['success' => true, 'booking_id' => $booking_id, 'pnr' => $pnr]);
        }
    }
}

function handleAdminStats($conn) {
    $stats = [];
    $stats['bookings'] = $conn->query("SELECT COUNT(*) as count FROM bookings")->fetch_assoc()['count'];
    $stats['revenue'] = $conn->query("SELECT SUM(total_price) as sum FROM bookings WHERE status='confirmed'")->fetch_assoc()['sum'];
    $stats['movies'] = $conn->query("SELECT COUNT(*) as count FROM movies")->fetch_assoc()['count'];
    echo json_encode($stats);
}
?>
