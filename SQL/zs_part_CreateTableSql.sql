CREATE DATABASE IF NOT EXISTS TicketSystem;
USE TicketSystem;

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

INSERT INTO Venue (venue_id, name, city_id, capacity, address, refund_policy_rules) VALUES
(1, 'Azadi Stadium', 1, 78000, 'Tehran, Azadi Sport Complex', 'Full refund 48h before'),
(2, 'Imam Reza Stadium', 2, 27000, 'Mashhad, Basij Blvd', 'No refund for group tickets'),
(3, 'Naghsh-e-Jahan Stadium', 3, 75000, 'Isfahan, Enghelab Sq', 'Refund with 10% fee'),
(4, 'Hafezieh Stadium', 4, 20000, 'Shiraz, Hafezieh area', 'Only transferable'),
(5, 'Sardar Jangal Stadium', 5, 15000, 'Rasht, Shohada Sq', 'Refund within 7 days');

INSERT INTO Matchh (match_id, sport_type, home_team_id, away_team_id, venue_id, match_date) VALUES
(1, 'Football', 1, 2, 1, '2025-06-15 18:30:00'), 
(2, 'Football', 3, 4, 3, '2025-06-16 20:00:00'),
(3, 'Football', 5, 1, 5, '2025-06-18 17:00:00'), 
(4, 'Basketball', 2, 3, 2, '2025-06-20 19:00:00'),
(5, 'Volleyball', 4, 5, 4, '2025-06-22 16:30:00'); 

INSERT INTO Ticket (ticket_id, match_id, price, remaining_capacity, category, organizer_venue_id) VALUES
(1, 1, 250000.00, 1200, 'VIP', 1),
(2, 1, 80000.00, 5000, 'normal', 1),
(3, 2, 200000.00, 800, 'special', 3),
(4, 3, 60000.00, 3000, 'normal', 5),
(5, 4, 150000.00, 600, 'VIP', 2);

INSERT INTO Reservation (reservation_id, ticket_id, user_id, status, reserved_at, expires_at) VALUES
(1, 1, 1, 'reserved', '2025-05-01 10:00:00', '2025-05-01 10:10:00'),
(2, 2, 4, 'paid',    '2025-05-02 14:30:00', '2025-05-03 14:40:00'),
(3, 3, 6, 'cancelled','2025-05-03 09:15:00', '2025-05-03 09:25:00'),
(4, 4, 2, 'reserved', '2025-05-04 18:00:00', '2025-05-05 18:10:00'),
(5, 5, 5, 'paid',     '2025-05-05 12:00:00', '2025-05-06 12:10:00');

