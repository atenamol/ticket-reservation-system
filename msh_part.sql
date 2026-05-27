CREATE DATABASE IF NOT EXISTS TicketSystem;
USE TicketSystem;

CREATE TABLE City (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(100)
);

CREATE TABLE Team (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    role ENUM('spectator', 'admin') NOT NULL,
    city_id INT,
    password_hash VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    profile_picture VARCHAR(255),
    CHECK ((email IS NOT NULL AND email LIKE '%@%.%')
        OR (phone IS NOT NULL AND phone LIKE '09%'
        AND LENGTH(phone) = 11
        AND phone REGEXP '^[0-9]+$')),
    FOREIGN KEY (city_id)
        REFERENCES City (city_id)
        ON DELETE SET NULL
);

INSERT INTO City (city_id, name, province)
VALUES
(1, 'Tehran', 'Tehran'),
(2, 'Mashhad', 'Razavi Khorasan'),
(3, 'Isfahan', 'Isfahan'),
(4, 'Shiraz', 'Fars'),
(5, 'Rasht', 'Gilan');

INSERT INTO Team (team_id, name)
VALUES
(1, 'Perspolis'),
(2, 'Esteghlal'),
(3, 'Sepahan'),
(4, 'Tractor'),
(5, 'Foolad');

INSERT INTO User
(user_id, first_name, last_name, email, phone, role, city_id, password_hash, account_status)
VALUES

(1, 'Ali', 'Ahmadi', 'ali@gmail.com', '09126412825', 'spectator', 1, 'hashed_pass_1', 'active'),

(2, 'Aynaz', 'Hosseini', 'aynaz@gmail.com', '09151270125', 'admin', 2, 'hashed_pass_2', 'active'),

(3, 'Reza', 'Karimi', 'NULL', '09012379854', 'spectator', 3, 'hashed_pass_3', 'inactive'),

(4, 'Nika', 'Jafari', 'nika@gmail.com', '09010105123', 'spectator', 4, 'hashed_pass_4', 'active'),

(5, 'Parsa', 'Hosseini', 'parsa@gmail.com', 'NULL', 'admin', 5, 'hashed_pass_5', 'active'),

(6, 'Yasamin', 'adib', 'yasamin@gmail.com', '09052456630', 'spectator', 1, 'hashed_pass_6', 'active');