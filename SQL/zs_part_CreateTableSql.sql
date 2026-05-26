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
    sport_type VARCHAR(50),
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
    category ENUM('VIP', 'normal', 'economy') NOT NULL,
    organizer_venue_id INT(11), 
    FOREIGN KEY (match_id) REFERENCES Matchh(match_id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_venue_id) REFERENCES Venue(venue_id)
);

