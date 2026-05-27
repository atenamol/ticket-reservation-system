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