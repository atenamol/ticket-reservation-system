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

