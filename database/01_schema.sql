DROP DATABASE IF EXISTS TicketSystem;
CREATE DATABASE TicketSystem;
USE TicketSystem;

-- Creating tables
CREATE TABLE City (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL
);

CREATE TABLE Team (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
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

CREATE TABLE Venue (
    venue_id INT(10) PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    city_id INT(11) NOT NULL,
    capacity INT(11) CHECK (capacity > 0),
    address TEXT NOT NULL,
    refund_policy_rules TEXT,
    FOREIGN KEY (city_id) REFERENCES City(city_id)
);

CREATE TABLE Matchh (
    match_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    sport_type ENUM('Volleyball', 'Basketball', 'Football'),
    home_team_id INT(11),
    away_team_id INT(11),
    venue_id INT(11) NOT NULL,
    match_date DATETIME,
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id) ON DELETE CASCADE,
    FOREIGN KEY (home_team_id) REFERENCES Team(team_id),
    FOREIGN KEY (away_team_id) REFERENCES Team(team_id)
);

CREATE TABLE Ticket (
    ticket_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    match_id INT(11) NOT NULL,
    price DECIMAL(10, 2) CHECK (price >= 0),
    remaining_capacity INT(11) CHECK (remaining_capacity >= 0),
    category ENUM('VIP', 'normal', 'special') NOT NULL,
    organizer_venue_id INT(11),
    FOREIGN KEY (match_id) REFERENCES Matchh(match_id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_venue_id) REFERENCES Venue(venue_id)
);

CREATE TABLE Reservation (
    reservation_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    status ENUM('reserved', 'paid', 'cancelled') DEFAULT 'reserved',
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Payment (
    payment_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT(11),
    user_id INT(11),
    amount DECIMAL(10, 2) CHECK (amount >= 0),
    payment_status ENUM('completed', 'pending', 'failed'),
    payment_method VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Report (
    report_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11),
    ticket_id INT(11),
    subject VARCHAR(200),
    description TEXT,
    status ENUM('open', 'closed', 'in_progress'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_response TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id)
);

CREATE TABLE CancellationRequest (
    cancel_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT(11),
    user_id INT(11),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    penalty_percent DECIMAL(5, 2) CHECK (penalty_percent >= 0),
    refund_amount DECIMAL(10, 2),
    status ENUM('pending', 'approved', 'rejected'),
    processed_at TIMESTAMP,
    admin_id INT(11),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (admin_id) REFERENCES User(user_id)
);

CREATE TABLE FootballDetail (
                                football_detail_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                                ticket_id INT(11),
                                league_name VARCHAR(100),
                                stadium_name VARCHAR(100),
                                seat_section VARCHAR(10),
                                seat_row VARCHAR(10),
                                seat_number INT(11) CHECK (seat_number > 0),
                                ticket_type ENUM('VIP', 'normal', 'special'),
                                amenities TEXT,
                                FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE,
                                CONSTRAINT unique_seat UNIQUE (league_name, stadium_name, seat_section, seat_row, seat_number)
);

CREATE TABLE VolleyballDetail (
                                  volleyball_detail_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                                  ticket_id INT(11),
                                  league_name VARCHAR(100),
                                  hall_name VARCHAR(100),
                                  seat_section VARCHAR(10),
                                  seat_row VARCHAR(10),
                                  seat_number INT(11) CHECK (seat_number > 0),
                                  ticket_type ENUM('VIP', 'normal', 'special'),
                                  amenities TEXT,
                                  FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE,
                                  CONSTRAINT unique_seat UNIQUE (league_name, hall_name, seat_section, seat_row, seat_number)
);

CREATE TABLE BasketballDetail (
                                  basketball_detail_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                                  ticket_id INT(11),
                                  league_name VARCHAR(100),
                                  hall_name VARCHAR(100),
                                  seat_section VARCHAR(10),
                                  seat_row VARCHAR(10),
                                  seat_number INT(11) CHECK (seat_number > 0),
                                  ticket_type ENUM('VIP', 'normal', 'special'),
                                  amenities TEXT,
                                  FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE,
                                  CONSTRAINT unique_seat UNIQUE (league_name, hall_name, seat_section, seat_row, seat_number)
);


-- Indexing

CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_phone ON User(phone);

CREATE INDEX idx_match_date ON Matchh(match_date);
CREATE INDEX idx_match_venue ON Matchh(venue_id);
CREATE INDEX idx_match_sport_venue_date ON Matchh(sport_type, venue_id, match_date);

CREATE INDEX idx_ticket_category ON Ticket(category);
CREATE INDEX idx_ticket_price ON Ticket(price);

CREATE INDEX idx_ticket_match_category_price ON Ticket(match_id, category, price);

CREATE INDEX idx_reservation_status ON Reservation(status);
CREATE INDEX idx_reservation_expires ON Reservation(expires_at);

CREATE INDEX idx_reservation_user_status ON Reservation(user_id, status);

CREATE INDEX idx_payment_user ON Payment(user_id);
CREATE INDEX idx_payment_status ON Payment(payment_status);
CREATE INDEX idx_payment_date ON Payment(transaction_date);
CREATE INDEX idx_payment_status_date ON Payment(payment_status, transaction_date);


CREATE INDEX idx_report_user ON Report(user_id);
CREATE INDEX idx_report_status ON Report(status);

CREATE INDEX idx_cancel_user ON CancellationRequest(user_id);
CREATE INDEX idx_cancel_status ON CancellationRequest(status);
CREATE INDEX idx_cancel_reservation ON CancellationRequest(reservation_id);

CREATE INDEX idx_football_ticket ON FootballDetail(ticket_id);
CREATE INDEX idx_volleyball_ticket ON VolleyballDetail(ticket_id);
CREATE INDEX idx_basketball_ticket ON BasketballDetail(ticket_id);

CREATE INDEX idx_football_seat ON FootballDetail(seat_section, seat_row, seat_number);
CREATE INDEX idx_volleyball_seat ON VolleyballDetail(seat_section, seat_row, seat_number);
CREATE INDEX idx_basketball_seat ON BasketballDetail(seat_section, seat_row, seat_number);

