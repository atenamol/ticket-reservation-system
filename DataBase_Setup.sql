DROP DATABASE IF EXISTS TicketSystem;
CREATE DATABASE IF NOT EXISTS TicketSystem;
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

(1, 'Ali', 'Ahmadi', 'ali@gmail.com', '09126412825', 'spectator', 1, '$2b$12$CVm5D9NR.jl.W5KNm/44F.y7AjaT7JyRsUOuxbS4TipzPND0H6rLG', 'active'),
(2, 'Aynaz', 'Hosseini', 'aynaz@gmail.com', '09151270125', 'admin', 2, '$2b$12$f.Jb/1pNcjAaCSvoVlyofujBDon99poitqy9.vFcKpacEu.QizxTm', 'active'),
(3, 'Reza', 'Karimi', Null , '09012379854', 'spectator', 3, '$2b$12$myBJfBr5B4MqJNuFsqOdZuKnOp2CiNZmoUL4NwCDC.V5I8/jzpJNi', 'inactive'),
(4, 'Nika', 'Jafari', 'nika@gmail.com', '09010105123', 'spectator', 4, '$2b$12$YDTUw48rXAiv2yhw3jy3pesubS.kpOtarMZImMxiMT.jMxXZCsWJ6', 'active'),
(5, 'Parsa', 'Hosseini', 'parsa@gmail.com', Null, 'admin', 5, '$2b$12$WNY4Tac/zzfimSZlIdUjqe.Q7/haMRyGDrJdfFolhTrbjqq8FMEv6', 'active'),
(6, 'Yasamin', 'Adib', 'yasamin@gmail.com', '09052456630', 'spectator', 1, '$2b$12$zYl7f8A42Gn4D2MZ/K1npOtUSTvvtLqkOkyrD2y8mjMgnszX/TVPa', 'active'),
(7, 'Atiyeh', 'Saadatzadeh', 'atysaa@gmail.com', '09050125679', 'spectator', 6, '$2b$12$M.4rVrMprt5nZHN56nFeyOWw3xgJUY7iyXs8u2aGIVdXafjLNKETu', 'active'),
(8, 'Sahar', 'Amini', 'saharamini@gmail.com', Null, 'spectator', 9, '$2b$12$xFhwMQGJttF.7nt2W6qpG.lHhORRaYFm0QlYS4MXgbb9Jvonak7rW', 'active'),
(9, 'Nima', 'Naseri', 'nimanaseri@gmail.com', Null, 'spectator', 7, '$2b$12$U5HkTT72wsknydvU7m8i8OugVRJMPfSmFqxK9UKFjQdL8axCFmjnW', 'active'),
(10, 'Milad', 'Karimi', 'miladkarimi@gmail.com', '09017531595', 'admin', 10, '$2b$12$whv.H67D1KxVCu5l80OLquHpKFIOyE89yWIjW0wi1HWcgUT874YjS', 'active'),
(11, 'Paria', 'Raad', 'pariraad@gmail.com', Null, 'spectator', 8, '$2b$12$pHo98m3Z21JxxNkgLZsFK.8.gu7T2TckJIPOQ4fJIpFbteedJbZa2', 'inactive'),
(12, 'Saman', 'Taheri', Null, '09034718629', 'spectator', 7, '$2b$12$HGsoTCOIzotpLoHMOBKWVe9yZHcSPLTmfHttuVkfin1jtf6.VIHnG', 'active');

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

-- phase 2

-- QUERY 1: Users who have never reserved any ticket
SELECT
    u.user_id,
    u.first_name,
    u.last_name
FROM User u
LEFT JOIN Reservation r ON u.user_id = r.user_id
WHERE r.reservation_id IS NULL;

-- QUERY 2: Users who have purchased at least one ticket
SELECT DISTINCT
    u.user_id,
    u.first_name,
    u.last_name
FROM User u
JOIN Reservation r ON u.user_id = r.user_id
WHERE r.status = 'paid';

-- QUERY 3: Total payment amount per user per month
SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    YEAR(p.transaction_date) AS year,
    MONTH(p.transaction_date) AS month,
    SUM(p.amount) AS total_paid
FROM User u
JOIN Payment p ON u.user_id = p.user_id
WHERE p.payment_status = 'completed'
GROUP BY
	u.user_id,
    u.first_name,
    u.last_name,
    YEAR(p.transaction_date),
    MONTH(p.transaction_date)
ORDER BY year DESC, month DESC, total_paid DESC;

-- QUERY 4: Users who have purchased exactly once in each city
SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    c.name AS city_name,
    COUNT(r.reservation_id) AS purchase_count
FROM User u
JOIN Reservation r ON u.user_id = r.user_id
JOIN Ticket t ON r.ticket_id = t.ticket_id
JOIN Matchh m ON t.match_id = m.match_id
JOIN Venue v ON m.venue_id = v.venue_id
JOIN City c ON v.city_id = c.city_id
WHERE r.status = 'paid'
GROUP BY
	u.user_id,
    u.first_name,
    u.last_name,
    c.city_id,
    c.name
HAVING COUNT(r.reservation_id) = 1
ORDER BY u.user_id, c.name;

-- QUERY 5: User who purchased the most recent ticket
SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    t.ticket_id,
    t.price,
    r.reserved_at AS purchase_time
FROM User u
JOIN Reservation r ON u.user_id = r.user_id
JOIN Ticket t ON r.ticket_id = t.ticket_id
WHERE r.status = 'paid'
	AND r.reserved_at = (
		  SELECT MAX(reserved_at)
		  FROM Reservation
		  WHERE status = 'paid'
	  )
ORDER BY r.reserved_at DESC;

-- QUERY 6: Users whose total payments exceed the overall average
SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    SUM(p.amount) AS total_paid,
    (
        SELECT AVG(total)
        FROM (
            SELECT SUM(amount) AS total
            FROM Payment
            WHERE payment_status = 'completed'
            GROUP BY user_id
        ) AS avg_table
    ) AS average_payment
FROM User u
JOIN Payment p ON u.user_id = p.user_id
WHERE p.payment_status = 'completed'
GROUP BY
	u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone
HAVING SUM(p.amount) > (
    SELECT AVG(total) FROM (
        SELECT SUM(amount) AS total
        FROM Payment
        WHERE payment_status = 'completed'
        GROUP BY user_id
    ) AS avg_table
)
ORDER BY total_paid DESC;

-- QUERY 7: Number of tickets sold per sport type
SELECT
    m.sport_type,
    COUNT(r.reservation_id) AS tickets_sold
FROM Matchh m
LEFT JOIN Ticket t
    ON m.match_id = t.match_id
LEFT JOIN Reservation r
    ON t.ticket_id = r.ticket_id
    AND r.status = 'paid'
GROUP BY m.sport_type
ORDER BY tickets_sold DESC;

-- Query 8: Top 3 users by recent purchases.

SELECT
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    COUNT(*) AS total_tickets
FROM User u
JOIN Reservation r
    ON u.user_id = r.user_id
WHERE r.status = 'paid'
AND r.reserved_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY total_tickets DESC
LIMIT 3;

-- Query 9: Sold tickets by city in Tehran province.

SELECT
    c.name AS city,
    m.venue_id,
    CONCAT(m.home_team_id, '--', m.away_team_id) AS teams_id,
    COUNT(r.reservation_id) AS sold_tickets
FROM Reservation r
JOIN Ticket t
    ON r.ticket_id = t.ticket_id
JOIN Matchh m
    ON t.match_id = m.match_id
JOIN Venue v
    ON m.venue_id = v.venue_id
JOIN City c
    ON v.city_id = c.city_id
WHERE
    r.status = 'paid'
    AND c.province = 'Tehran'
GROUP BY c.city_id, c.name;

-- Query 10: City of the oldest purchasing user.

SELECT DISTINCT
    c.name AS city_name,
	u.first_name,
    u.last_name,
    u.registered_at
FROM User u
JOIN City c
    ON u.city_id = c.city_id
JOIN Reservation r
    ON u.user_id = r.user_id
WHERE
    r.status = 'paid'
    AND u.registered_at =
    (
        SELECT MIN(registered_at)
        FROM User
    );


-- Query 11: List all administrators.

SELECT
    first_name,
    last_name
FROM User
WHERE role = 'admin';

-- Query 12: Users with at least two purchases.

SELECT
    CONCAT(u.first_name,' ',u.last_name) AS full_name,
    COUNT(*) AS total_tickets
FROM User u
JOIN Reservation r
    ON u.user_id = r.user_id
WHERE r.status='paid'
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name
HAVING COUNT(*)>=2
ORDER BY
    COUNT(*);

-- Query 13: Users with at most two ticket purchases for each sport.

SELECT
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    m.sport_type,
    COUNT(*) AS total_tickets
FROM User u
JOIN Reservation r
    ON u.user_id = r.user_id
JOIN Ticket t
    ON r.ticket_id = t.ticket_id
JOIN Matchh m
    ON t.match_id = m.match_id
WHERE r.status = 'paid'
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name,
    m.sport_type
HAVING COUNT(*) <= 2
ORDER BY
    COUNT(*);


-- Query 14: Users who purchased tickets for all sports.

SELECT
    COALESCE(u.email,u.phone) AS contact
FROM User u
JOIN Reservation r
    ON u.user_id=r.user_id
JOIN Ticket t
    ON r.ticket_id=t.ticket_id
JOIN Matchh m
    ON t.match_id=m.match_id
WHERE r.status='paid'
GROUP BY
    u.user_id,
    u.email,
    u.phone
HAVING COUNT(DISTINCT m.sport_type)=3;

-- Query 15: Tickets purchased today, ordered by purchase time
SELECT
    t.ticket_id,
    m.sport_type,
    m.match_date,
    u.first_name,
    u.last_name,
    p.amount,
    p.transaction_date
FROM Payment p
JOIN Reservation r ON p.reservation_id = r.reservation_id
JOIN Ticket t ON r.ticket_id = t.ticket_id
JOIN Matchh m ON t.match_id = m.match_id
JOIN User u ON p.user_id = u.user_id
WHERE p.payment_status = 'completed'
  AND DATE(p.transaction_date) = CURDATE()
ORDER BY p.transaction_date;


-- Query 16: Second best-selling ticket among all tickets
SELECT
    t.ticket_id,
    m.sport_type,
    COUNT(r.reservation_id) AS times_sold
FROM Ticket t
JOIN Reservation r ON t.ticket_id = r.ticket_id
JOIN Matchh m ON t.match_id = m.match_id
GROUP BY t.ticket_id, m.sport_type
ORDER BY times_sold DESC
LIMIT 1 OFFSET 1;

-- Query 17 (revised): Admin(s) with the highest approval percentage
-- among the cancellation requests assigned to them
SELECT
    u.user_id AS admin_id,
    u.first_name,
    u.last_name,
    SUM(cr.status = 'approved') AS approved_count,
    COUNT(*) AS total_handled,
    ROUND(SUM(cr.status = 'approved') * 100.0 / COUNT(*), 2) AS approval_percentage
FROM CancellationRequest cr
JOIN User u ON cr.admin_id = u.user_id
WHERE cr.admin_id IS NOT NULL
GROUP BY u.user_id, u.first_name, u.last_name
HAVING approval_percentage = (
    SELECT MAX(admin_pct) FROM (
        SELECT SUM(status = 'approved') * 100.0 / COUNT(*) AS admin_pct
        FROM CancellationRequest
        WHERE admin_id IS NOT NULL
        GROUP BY admin_id
    ) AS pct_table
)
ORDER BY u.user_id;


-- Query 18: Rename the user with the most cancelled reservations to 'Reddington'
UPDATE User
SET last_name = 'Reddington'
WHERE user_id = (
    SELECT user_id FROM (
        SELECT r.user_id, COUNT(*) AS cancel_count
        FROM Reservation r
        WHERE r.status = 'cancelled'
        GROUP BY r.user_id
        ORDER BY cancel_count DESC
        LIMIT 1
    ) AS top_canceler
);

-- Query 19: Delete all cancelled reservations belonging to the user now named 'Reddington' (run after Query 18)
DELETE r FROM Reservation r
JOIN User u ON r.user_id = u.user_id
WHERE u.last_name = 'Reddington'
  AND r.status = 'cancelled';


-- Query 20: Delete all cancelled reservations in the system
DELETE FROM Reservation
WHERE status = 'cancelled';


-- Query 21: Apply a 10% discount to tickets sold yesterday for matches held at Azadi Stadium
UPDATE Ticket t
SET t.price = t.price * 0.9
WHERE t.ticket_id IN (
    SELECT ticket_id FROM (
        SELECT DISTINCT t2.ticket_id
        FROM Ticket t2
        JOIN Matchh m ON t2.match_id = m.match_id
        JOIN Venue v ON m.venue_id = v.venue_id
        JOIN Reservation r ON r.ticket_id = t2.ticket_id
        WHERE v.name = 'Azadi Stadium'
          AND DATE(r.reserved_at) = CURDATE() - INTERVAL 1 DAY
    ) AS azadi_tickets
);

-- Query 22: Subject and report count for the most-reported ticket
SELECT
    rp.ticket_id,
    rp.subject,
    COUNT(*) AS report_count
FROM Report rp
WHERE rp.ticket_id = (
    SELECT ticket_id FROM Report
    GROUP BY ticket_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
GROUP BY rp.ticket_id, rp.subject;

-- Stored Procedure 1: Given a user's email or phone, list
-- the tickets they purchased, ordered by purchase time

DROP PROCEDURE IF EXISTS GetUserTicketsByContact;
DELIMITER $$

CREATE PROCEDURE GetUserTicketsByContact(IN p_contact VARCHAR(100))
BEGIN
    SELECT
        t.ticket_id,
        m.sport_type,
        m.match_date,
        t.category,
        t.price,
        p.transaction_date
    FROM User u
    JOIN Payment p ON p.user_id = u.user_id
    JOIN Reservation r ON p.reservation_id = r.reservation_id
    JOIN Ticket t ON r.ticket_id = t.ticket_id
    JOIN Matchh m ON t.match_id = m.match_id
    WHERE (u.email = p_contact OR u.phone = p_contact)
      AND p.payment_status = 'completed'
    ORDER BY p.transaction_date;
END$$


-- Stored Procedure 2: Given an admin's email or phone, list
-- the names of users who've had a reservation cancelled by them

DROP PROCEDURE IF EXISTS GetUsersCancelledByAdmin;
DELIMITER $$

CREATE PROCEDURE GetUsersCancelledByAdmin(IN p_admin_contact VARCHAR(100))
BEGIN
    SELECT DISTINCT
        u.user_id,
        u.first_name,
        u.last_name
    FROM CancellationRequest cr
    JOIN User admin_u ON cr.admin_id = admin_u.user_id
    JOIN User u ON cr.user_id = u.user_id
    WHERE (admin_u.email = p_admin_contact OR admin_u.phone = p_admin_contact)
      AND cr.status = 'approved';
END$$

DELIMITER ;


-- Test calls:
-- CALL GetUserTicketsByContact('ali@gmail.com');
-- CALL GetUsersCancelledByAdmin('aynaz@gmail.com');


-- STORED PROCEDURE 3: Get tickets purchased in a specific city
DROP PROCEDURE IF EXISTS GetTicketsByCity;
DELIMITER //

CREATE PROCEDURE GetTicketsByCity(IN city_name VARCHAR(100))
BEGIN
    SELECT
        t.ticket_id,
        t.price,
        t.category,
        m.match_date,
        m.sport_type,
        v.name AS venue_name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        r.reserved_at AS purchase_time
    FROM Ticket t
    JOIN Matchh m ON t.match_id = m.match_id
    JOIN Venue v ON m.venue_id = v.venue_id
    JOIN City c ON v.city_id = c.city_id
    JOIN Reservation r ON t.ticket_id = r.ticket_id
    JOIN User u ON r.user_id = u.user_id
    WHERE c.name = city_name
      AND r.status = 'paid'
    ORDER BY r.reserved_at DESC;
END //

DELIMITER ;


-- STORED PROCEDURE 4: Search tickets by text
DROP PROCEDURE IF EXISTS SearchTickets;
DELIMITER //

CREATE PROCEDURE SearchTickets(IN search_term VARCHAR(200))
BEGIN
    SELECT
        t.ticket_id,
        t.price,
        t.category,
        m.match_date,
        m.sport_type,
        v.name AS venue_name,
        ht.name AS home_team,
        at.name AS away_team,
        u.first_name,
        u.last_name,
        u.email,
		u.phone,
        COALESCE(r.status, 'available') AS ticket_status
    FROM Ticket t
    JOIN Matchh m
        ON t.match_id = m.match_id
    JOIN Venue v
        ON m.venue_id = v.venue_id
    JOIN Team ht
        ON m.home_team_id = ht.team_id
    JOIN Team at
        ON m.away_team_id = at.team_id
    LEFT JOIN Reservation r
        ON t.ticket_id = r.ticket_id
    LEFT JOIN User u
        ON r.user_id = u.user_id
    WHERE
        t.category LIKE CONCAT('%', search_term, '%')
        OR v.name LIKE CONCAT('%', search_term, '%')
        OR ht.name LIKE CONCAT('%', search_term, '%')
        OR at.name LIKE CONCAT('%', search_term, '%')
        OR u.first_name LIKE CONCAT('%', search_term, '%')
        OR u.last_name LIKE CONCAT('%', search_term, '%')
        OR CONCAT(u.first_name, ' ', u.last_name)
            LIKE CONCAT('%', search_term, '%')
    ORDER BY
        m.match_date DESC,
        t.ticket_id;
END //

DELIMITER ;


-- STORED PROCEDURE 5: Get other users from the same city
DROP PROCEDURE IF EXISTS GetUsersFromSameCity;
DELIMITER //

CREATE PROCEDURE GetUsersFromSameCity(IN user_contact VARCHAR(100))
BEGIN
    SELECT
        u2.user_id,
        u2.first_name,
        u2.last_name,
        u2.email,
        u2.phone,
        u2.role,
        c.name AS city_name
    FROM User u1
    JOIN City c ON u1.city_id = c.city_id
    JOIN User u2 ON u2.city_id = c.city_id
    WHERE (u1.email = user_contact OR u1.phone = user_contact)
      AND u2.user_id != u1.user_id
    ORDER BY u2.first_name;
END //

DELIMITER ;

-- SP6: Top N users after a given date.

DROP PROCEDURE IF EXISTS GetTopUsersAfterDate;
DELIMITER $$
CREATE PROCEDURE GetTopUsersAfterDate(
    IN given_date DATETIME,
    IN user_limit INT
)
BEGIN

SELECT
    u.user_id,
    CONCAT(u.first_name,' ',u.last_name) AS full_name,
    COALESCE(u.email,u.phone) AS contact,
    COUNT(*) AS total_ticket
FROM User u
JOIN Reservation r
    ON u.user_id=r.user_id
WHERE
    r.status='paid'
    AND r.reserved_at>=given_date
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone
ORDER BY total_ticket DESC
LIMIT user_limit;

END $$

DELIMITER ;


-- SP7: Cancelled reservations by sport.

DROP PROCEDURE IF EXISTS GetCancelledReservationsBySport;
DELIMITER $$
CREATE PROCEDURE GetCancelledReservationsBySport(
    IN sport_type ENUM('Football','Basketball','Volleyball')
)
BEGIN

SELECT
    r.reservation_id,
    t.ticket_id,
    m.match_id,
    t.organizer_venue_id,
    m.sport_type,
    r.reserved_at,
    CONCAT(u.first_name,' ',u.last_name) AS full_name,
    t.category,
    t.price

FROM Reservation r
JOIN Ticket t
    ON r.ticket_id=t.ticket_id
JOIN Matchh m
    ON t.match_id=m.match_id
JOIN User u
    ON r.user_id=u.user_id
WHERE
    r.status='cancelled'
    AND m.sport_type=sport_type
ORDER BY r.reserved_at DESC;

END $$

DELIMITER ;


-- SP8: Users with the most reports by subject.

DROP PROCEDURE IF EXISTS GetTopReportersBySubject;
DELIMITER $$
CREATE PROCEDURE GetTopReportUsers(IN p_report_subject VARCHAR(200))
BEGIN
    SELECT
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        COUNT(*) AS total_reports
    FROM Report rep
    JOIN User u
        ON rep.user_id = u.user_id
    WHERE rep.subject = p_report_subject
    GROUP BY
        u.user_id,
        u.first_name,
        u.last_name
    HAVING COUNT(*) = (
        SELECT MAX(report_count)
        FROM (
            SELECT COUNT(*) AS report_count
            FROM Report
            WHERE subject = p_report_subject
            GROUP BY user_id
        ) AS x
    );
END;

DELIMITER ;

-- SAMPLE TEST CALLS
-- CALL GetTicketsByCity('Tehran');
-- CALL SearchTickets('VIP');
-- CALL GetUsersFromSameCity('ali@gmail.com');
-- CALL SearchTickets('azadi stadium');
-- CALL GetTopUsersAfterDate('2026-01-01 00:00:00', 3);
-- CALL GetCancelledReservationsBySport('Football');
-- CALL GetTopReportersBySubject('Refund');
