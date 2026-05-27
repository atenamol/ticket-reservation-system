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
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id) ON DELETE SET NULL,
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
    payment_status VARCHAR(20),
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
    status VARCHAR(20),
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
    status VARCHAR(20),
    processed_at TIMESTAMP,
    admin_id INT(11),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
                                 );

CREATE TABLE FootballDetail (
    football_detail_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT(11),
    league_name VARCHAR(100),
    stadium_name VARCHAR(100),
    seat_section VARCHAR(10),
    seat_row VARCHAR(10),
    seat_number INT(11) CHECK (seat_number > 0),
    ticket_type VARCHAR(20),
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
    ticket_type VARCHAR(20),
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
    ticket_type VARCHAR(20),
    amenities TEXT,
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE
                              );

-- Indexing
CREATE INDEX idx_match_date ON Matchh(match_date);
CREATE INDEX idx_match_venue ON Matchh(venue_id);

CREATE INDEX idx_match_sport_venue_date ON Matchh(sport_type, venue_id, match_date);

CREATE INDEX idx_ticket_match ON Ticket(match_id);
CREATE INDEX idx_ticket_category ON Ticket(category);
CREATE INDEX idx_ticket_price ON Ticket(price);

CREATE INDEX idx_ticket_match_category_price ON Ticket(match_id, category, price);

CREATE INDEX idx_reservation_user ON Reservation(user_id);
CREATE INDEX idx_reservation_status ON Reservation(status);
CREATE INDEX idx_reservation_expires ON Reservation(expires_at);

CREATE INDEX idx_reservation_user_status ON Reservation(user_id, status);

CREATE INDEX idx_payment_user ON Payment(user_id);
CREATE INDEX idx_payment_reservation ON Payment(reservation_id);
CREATE INDEX idx_payment_status ON Payment(payment_status);
CREATE INDEX idx_payment_date ON Payment(transaction_date);

CREATE INDEX idx_report_user ON Report(user_id);
CREATE INDEX idx_report_status ON Report(status);

CREATE INDEX idx_cancel_user ON CancellationRequest(user_id);
CREATE INDEX idx_cancel_status ON CancellationRequest(status);

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

(3, 'Reza', 'Karimi', 'reza@gmail.com', '09012379854', 'spectator', 3, 'hashed_pass_3', 'inactive'),

(4, 'Nika', 'Jafari',
'nika@gmail.com',
'09010105123',
'spectator',
4,
'hashed_pass_4',
'active'),

(5, 'Parsa', 'Hosseini',
'parsa@gmail.com',
'09031348732',
'admin',
5,
'hashed_pass_5',
'active'),

(6, 'Yasamin', 'adib',
'yasamin@gmail.com',
'09052456630',
'spectator',
1,
'hashed_pass_6',
'active');

CREATE TABLE FootballDetail (
    football_detail_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT(11),
    league_name VARCHAR(100),
    stadium_name VARCHAR(100),
    seat_section VARCHAR(10),
    seat_row VARCHAR(10),
    seat_number INT(11) CHECK (seat_number > 0),
    ticket_type VARCHAR(20),
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
    ticket_type VARCHAR(20),
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
    ticket_type VARCHAR(20),
    amenities TEXT,
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE
                              );

INSERT INTO Payment (payment_id, reservation_id, user_id, amount, payment_status, payment_method, refund_amount) VALUES
(11, 11, 1, 150.00, 'completed', 'CreditCard', 0),
(12, 12, 3, 200.00, 'completed', 'Online', 0),
(13, 13, 5, 75.50, 'pending', 'CreditCard', 0),
(14, 14, 2, 90.00, 'completed', 'Online', 0),
(15, 15, 4, 110.00, 'failed', 'CreditCard', 0);

INSERT INTO Report (report_id, user_id, ticket_id, subject, description, status, admin_response) VALUES
(6, 6, 6, 'Seat Issue', 'Double booked', 'open', NULL),
(7, 1, 7, 'Refund', 'Not processed', 'in_progress', 'Investigating'),
(8, 3, 8, 'Quality', 'Poor view', 'closed', 'Apologies sent'),
(9, 5, 9, 'Payment', 'Charged twice', 'open', NULL),
(10, 2, 10, 'Other', 'Wrong ticket', 'in_progress', 'Checking records');

INSERT INTO CancellationRequest (cancel_id, reservation_id, user_id, penalty_percent, refund_amount, status, processed_at, admin_id) VALUES
(6, 11, 1, 5.00, 142.50, 'pending', NULL, NULL),
(7, 12, 3, 0, 200.00, 'approved', '2026-05-27 10:30:00', 2),
(8, 13, 5, 15.00, 64.18, 'pending', NULL, NULL),
(9, 14, 2, 0, 90.00, 'approved', '2026-05-27 11:00:00', 5),
(10, 15, 4, 10.00, 99.00, 'rejected', '2026-05-27 09:15:00', 2);

INSERT INTO FootballDetail (ticket_id, league_name, stadium_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(11, 'IPL', 'Azadi', 'A4', '4', 5, 'VIP', 'Lounge, Parking'),
(12, 'IPL', 'Naghsh', 'B3', '3', 4, 'Standard', 'Wi-Fi'),
(13, 'IPL', 'Azadi', 'A1', '1', 6, 'VIP', 'Free Food, Parking'),
(14, 'IPL', 'Naghsh', 'B1', '1', 5, 'Standard', 'Wi-Fi, Parking'),
(15, 'IPL', 'Azadi', 'A2', '2', 7, 'Premium', 'Lounge, Free Drinks');

INSERT INTO VolleyballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(1, 'Super League', 'Azadi Hall', 'A1', '1', 1, 'Standard', 'Parking, Wi-Fi'),
(2, 'Super League', 'Azadi Hall', 'A2', '2', 2, 'VIP', 'Lounge, Free Drinks'),
(3, 'Super League', 'Ghadir Hall', 'B1', '1', 1, 'Standard', 'Wi-Fi'),
(4, 'Super League', 'Ghadir Hall', 'B2', '2', 2, 'Standard', 'Parking'),
(5, 'Super League', 'Azadi Hall', 'A1', '1', 2, 'VIP', 'Lounge, Free Food');

INSERT INTO BasketballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(6, 'NBA', 'Madison Square', 'C3', '7', 3, 'Premium', 'Free Drinks, Parking'),
(7, 'NBA', 'Staples Center', 'C1', '5', 4, 'Courtside', 'VIP Lounge, Free Food'),
(8, 'EuroLeague', 'OAKA Hall', 'D3', '5', 3, 'Standard', 'Wi-Fi, Parking'),
(9, 'NBA', 'Madison Square', 'C2', '6', 5, 'Premium', 'VIP Lounge, Free Drinks'),
(10, 'EuroLeague', 'OAKA Hall', 'D1', '3', 4, 'Standard', 'Wi-Fi');