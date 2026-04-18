CREATE DATABASE IF NOT EXISTS ak_theaters;
USE ak_theaters;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    description TEXT,
    poster VARCHAR(255),
    banner VARCHAR(255),
    rating DECIMAL(3,1),
    language VARCHAR(50),
    genre VARCHAR(100),
    duration INT,
    status ENUM('now_showing', 'coming_soon', 'archived')
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    movie_title VARCHAR(150),
    pnr VARCHAR(20) UNIQUE,
    total_price DECIMAL(10,2),
    seats TEXT,
    show_date VARCHAR(50),
    show_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed some movies
INSERT IGNORE INTO movies (title, description, poster, banner, rating, language, genre, duration, status) VALUES 
('Kalki 2898 AD', 'Bhairava crosses paths with a modern avatar.', 'https://image.tmdb.org/t/p/original/mKOBd8SlqQHNvPoZkI0Z1sjeoie.jpg', 'https://image.tmdb.org/t/p/original/21pXfE40X0uT8QExdclXv7d9pZ3.jpg', 8.5, 'Telugu', 'Sci-Fi', 180, 'now_showing'),
('Devara', 'Epic saga of power', 'https://image.tmdb.org/t/p/original/A1ENw1zTq41wEn3P5oEq302Sntp.jpg', 'https://image.tmdb.org/t/p/original/j1zH1QY8O2b7bVf45PEn8uM3p7q.jpg', 8.2, 'Telugu', 'Action', 175, 'now_showing'),
('Leo', 'A mild-mannered cafe owner.', 'https://image.tmdb.org/t/p/original/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'https://image.tmdb.org/t/p/original/ts1ZjoBw2r7E1h4ZeqiZpQ2Yn3h.jpg', 8.6, 'Tamil', 'Action', 164, 'now_showing');
