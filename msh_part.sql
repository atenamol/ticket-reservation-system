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
    FOREIGN KEY (city_id)
        REFERENCES City (city_id)
        ON DELETE SET NULL
);
