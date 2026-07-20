DROP DATABASE IF EXISTS TicketSystem;
CREATE DATABASE IF NOT EXISTS TicketSystem;
USE TicketSystem;

-- Creating tables
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
    sport_type ENUM('Volleyball', 'Basketball', 'Football', 'others'),
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
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE
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
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE
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
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE
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


-- Filling the tables

INSERT INTO City (city_id, name, province)
VALUES
(1, 'Tehran', 'Tehran'),
(2, 'Mashhad', 'Razavi Khorasan'),
(3, 'Isfahan', 'Isfahan'),
(4, 'Shiraz', 'Fars'),
(5, 'Rasht', 'Gilan'),
(6, 'Kerman', 'Kerman'),
(7, 'Yazd', 'Yazd'),
(8, 'Sari', 'Mazandaran'),
(9, 'Gorgan', 'Golestan'),
(10, 'Ahvaz', 'Khuzestan');

INSERT INTO Team (team_id, name)
VALUES
(1, 'Perspolis'),
(2, 'Esteghlal'),
(3, 'Sepahan'),
(4, 'Tractor'),
(5, 'Foolad'),
(6, 'Malavan'),
(7, 'Gol Gohar'),
(8, 'Zob Ahan'),
(9, 'Peykan'),
(10, 'Nassaji');

INSERT INTO User
(user_id, first_name, last_name, email, phone, role, city_id, password_hash, account_status)
VALUES

(1, 'Ali', 'Ahmadi', 'ali@gmail.com', '09126412825', 'spectator', 1, 'hashed_pass_1', 'active'),
(2, 'Aynaz', 'Hosseini', 'aynaz@gmail.com', '09151270125', 'admin', 2, 'hashed_pass_2', 'active'),
(3, 'Reza', 'Karimi', Null , '09012379854', 'spectator', 3, 'hashed_pass_3', 'inactive'),
(4, 'Nika', 'Jafari', 'nika@gmail.com', '09010105123', 'spectator', 4, 'hashed_pass_4', 'active'),
(5, 'Parsa', 'Hosseini', 'parsa@gmail.com', Null, 'admin', 5, 'hashed_pass_5', 'active'),
(6, 'Yasamin', 'Adib', 'yasamin@gmail.com', '09052456630', 'spectator', 1, 'hashed_pass_6', 'active'),
(7, 'Atiyeh', 'Saadatzadeh', 'atysaa@gmail.com', '09050125679', 'spectator', 6, 'hashed_pass_7', 'active'),
(8, 'Sahar', 'Amini', 'saharamini@gmail.com', Null, 'spectator', 9, 'hashed_pass_8', 'active'),
(9, 'Nima', 'Naseri', 'nimanaseri@gmail.com', Null, 'spectator', 7, 'hashed_pass_9', 'active'),
(10, 'Milad', 'Karimi', 'miladkarimi@gmail.com', '09017531595', 'admin', 10, 'hashed_pass_10', 'active'),
(11, 'Paria', 'Raad', 'pariraad@gmail.com', Null, 'spectator', 8, 'hashed_pass_11', 'inactive'),
(12, 'Saman', 'Taheri', Null, '09034718629', 'spectator', 7, 'hashed_pass_12', 'active');

INSERT INTO Venue (venue_id, name, city_id, capacity, address, refund_policy_rules) VALUES
(1, 'Azadi Stadium', 1, 78000, 'Tehran, Azadi Sport Complex', 'Full refund 48h before'),
(2, 'Imam Reza Stadium', 2, 27000, 'Mashhad, Basij Blvd', 'No refund for group tickets'),
(3, 'Naghsh-e-Jahan Stadium', 3, 75000, 'Isfahan, Enghelab Sq', 'Refund with 10% fee'),
(4, 'Hafezieh Stadium', 4, 20000, 'Shiraz, Hafezieh area', 'Only transferable'),
(5, 'Sardar Jangal Stadium', 5, 15000, 'Rasht, Shohada Sq', 'Refund within 7 days'),
(6, 'Shahid Bahonar Stadium', 6, 18000, 'Kerman, Bahonar Blvd', 'Refund with 5% fee'),
(7, 'Nasiri Stadium', 7, 12000, 'Yazd, Imam St', 'No refund after purchase'),
(8, 'Mottaqi Stadium', 8, 22000, 'Sari, Pasdaran Blvd', 'Refund within 72h'),
(9, 'Takhti Stadium', 9, 16000, 'Gorgan, Shahid Beheshti St', 'Transferable ticket only'),
(10, 'Ghadir Stadium', 10, 30000, 'Ahvaz, Golestan Blvd', 'Refund with 10% penalty');

INSERT INTO Matchh (match_id, sport_type, home_team_id, away_team_id, venue_id, match_date) VALUES
(1, 'Football', 1, 2, 1, '2025-06-15 18:30:00'),
(2, 'Football', 3, 4, 3, '2025-06-16 20:00:00'),
(3, 'Football', 5, 1, 5, '2025-06-18 17:00:00'),
(4, 'Basketball', 2, 3, 2, '2025-06-20 19:00:00'),
(5, 'Volleyball', 4, 5, 4, '2025-06-22 16:30:00'),
(6, 'Football', 6, 7, 6, '2026-07-05 18:00:00'),
(7, 'Football', 8, 9, 7, '2026-07-08 20:00:00'),
(8, 'Basketball', 10, 2, 8, '2026-07-10 19:30:00'),
(9, 'Volleyball', 3, 5, 9, '2026-07-12 17:00:00'),
(10, 'Football', 4, 6, 10, '2026-07-15 21:00:00');


INSERT INTO Ticket (ticket_id, match_id, price, remaining_capacity, category, organizer_venue_id) VALUES
(1, 1, 250000.00, 1200, 'VIP', 1),
(2, 1, 80000.00, 5000, 'normal', 1),
(3, 2, 200000.00, 800, 'special', 3),
(4, 3, 60000.00, 3000, 'normal', 5),
(5, 4, 150000.00, 600, 'VIP', 2),
(6, 6, 90000.00, 2500, 'normal', 6),
(7, 7, 220000.00, 700, 'VIP', 7),
(8, 8, 180000.00, 500, 'special', 8),
(9, 9, 120000.00, 900, 'normal', 9),
(10, 10, 300000.00, 400, 'VIP', 10);

INSERT INTO Reservation (reservation_id, ticket_id, user_id, status, reserved_at, expires_at) VALUES
(1, 1, 1, 'paid', '2025-05-01 10:00:00', '2025-05-01 10:10:00'),
(2, 2, 4, 'cancelled',    '2025-05-02 14:30:00', '2025-05-03 14:40:00'),
(3, 3, 6, 'reserved','2025-05-03 09:15:00', '2025-05-03 09:25:00'),
(4, 4, 2, 'cancelled', '2025-05-04 18:00:00', '2025-05-05 18:10:00'),
(5, 5, 5, 'reserved',     '2025-05-05 12:00:00', '2025-05-06 12:10:00'),
(6, 6, 7, 'cancelled', '2026-06-01 10:00:00', '2026-06-01 10:15:00'),
(7, 7, 8, 'paid', '2026-06-02 11:30:00', '2026-06-03 11:45:00'),
(8, 8, 9, 'paid', '2026-06-03 14:00:00', '2026-06-03 14:15:00'),
(9, 9, 10, 'cancelled', '2026-06-04 16:20:00', '2026-06-04 16:35:00'),
(10, 10, 12, 'paid', '2026-06-05 18:10:00', '2026-06-06 18:25:00');

INSERT INTO Payment (payment_id, reservation_id, user_id, amount, payment_status, payment_method, refund_amount) VALUES
(1, 1, 1, 250000.00, 'completed', 'CreditCard', 0),
(2, 2, 4, 80000.00, 'completed', 'Online', 0),
(3, 3, 6, 200000.00,  'pending',   'CreditCard', 0),
(4, 4, 2, 60000.00,  'completed', 'Online', 0),
(5, 5, 5, 150000.00, 'failed',    'CreditCard', 0),
(6, 6, 7, 90000.00, 'completed', 'Online', 0),
(7, 7, 8, 220000.00, 'completed', 'CreditCard', 0),
(8, 8, 9, 180000.00, 'completed', 'Online', 0),
(9, 9, 10, 120000.00, 'completed', 'CreditCard', 0),
(10, 10, 12, 300000.00, 'completed', 'Online', 0);

INSERT INTO Report (report_id, user_id, ticket_id, subject, description, status, admin_response) VALUES
(1, 4, 1, 'Seat Issue', 'Double booked', 'open', NULL),
(2, 1, 2, 'Refund', 'Not processed', 'in_progress', 'Investigating'),
(3, 3, 3, 'Quality', 'Poor view', 'closed', 'Apologies sent'),
(4, 5, 4, 'Payment', 'Charged twice', 'open', NULL),
(5, 2, 5, 'Other', 'Wrong ticket', 'in_progress', 'Checking records'),
(6, 7, 6, 'Seat Issue', 'My seat was already occupied', 'open', NULL),
(7, 8, 7, 'Refund', 'Refund not received after cancellation', 'in_progress', 'Looking into it'),
(8, 9, 8, 'Payment', 'Paid but ticket not confirmed', 'open', NULL),
(9, 10, 9, 'Quality', 'Wrong seat section assigned', 'closed', 'Issue resolved'),
(10, 12, 10, 'Other', 'Match rescheduled, need refund', 'in_progress', 'Checking policy');

INSERT INTO CancellationRequest (cancel_id, reservation_id, user_id, penalty_percent, refund_amount, status, processed_at, admin_id) VALUES
(1, 1, 1, 5.00, 237500.00, 'pending', NULL, NULL),
(2, 2, 4, 0, 80000.00, 'approved', '2026-05-27 10:30:00', 2),
(3, 3, 6, 15.00, 170000.00, 'pending', NULL, NULL),
(4, 4, 2, 0, 60000.00, 'approved', '2026-05-27 11:00:00', 5),
(5, 5, 5, 10.00, 135000.00, 'rejected', '2026-05-27 09:15:00', 2),
(6, 6, 7, 0, 90000.00, 'approved', '2026-06-10 09:00:00', 2),
(7, 7, 8, 5.00, 209000.00, 'pending', NULL, NULL),
(8, 8, 9, 10.00, 162000.00, 'rejected', '2026-06-11 14:00:00', 10),
(9, 9, 10, 0, 120000.00, 'approved', '2026-06-12 11:30:00', 5),
(10, 10, 12, 15.00, 255000.00, 'pending', NULL, NULL);

INSERT INTO FootballDetail (ticket_id, league_name, stadium_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(1, 'IPL', 'Azadi', 'A4', '4', 5, 'VIP', 'Lounge, Parking'),
(2, 'IPL', 'Azadi', 'B3', '3', 4, 'normal', 'Wi-Fi'),
(3, 'IPL', 'Naghsh-e-Jahan', 'A1', '1', 6, 'special', 'Free Food, Parking'),
(4, 'IPL', 'Sardar Jangal', 'B1', '1', 5, 'normal', 'Wi-Fi, Parking'),
(6, 'IPL', 'Shahid Bahonar', 'C2', '2', 3, 'normal', 'Parking'),
(7, 'IPL', 'Nasiri', 'A3', '3', 7, 'VIP', 'Lounge, Free Drinks'),
(10, 'IPL', 'Ghadir', 'A1', '1', 2, 'VIP', 'Lounge, Free Food, Parking');

INSERT INTO BasketballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(5, 'IBL', 'Imam Reza Hall', 'C3', '7', 3, 'VIP', 'Free Drinks, Parking'),
(8, 'IBL', 'Mottaqi Hall', 'C1', '5', 4, 'special', 'VIP Lounge, Free Food');

INSERT INTO VolleyballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(9, 'Super League', 'Takhti Hall', 'A1', '1', 1, 'normal', 'Parking, Wi-Fi');