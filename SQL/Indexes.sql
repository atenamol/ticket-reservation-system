-- For finding matches by date and venue
CREATE INDEX idx_match_date ON Matchh(match_date);
CREATE INDEX idx_match_venue ON Matchh(venue_id);

-- Composite index for common queries like "football matches in a venue on a date"
CREATE INDEX idx_match_sport_venue_date ON Matchh(sport_type, venue_id, match_date);

-- For finding tickets for a match, by category, price range
CREATE INDEX idx_ticket_match ON Ticket(match_id);
CREATE INDEX idx_ticket_category ON Ticket(category);
CREATE INDEX idx_ticket_price ON Ticket(price);

-- Composite index for "available VIP tickets under X price for match Y"
CREATE INDEX idx_ticket_match_category_price ON Ticket(match_id, category, price);

-- For user's reservations, status filtering, expiry checks
CREATE INDEX idx_reservation_user ON Reservation(user_id);
CREATE INDEX idx_reservation_status ON Reservation(status);
CREATE INDEX idx_reservation_expires ON Reservation(expires_at);

-- Composite index for "user's active reservations"
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

-- For seat lookup queries
CREATE INDEX idx_football_seat ON FootballDetail(seat_section, seat_row, seat_number);
CREATE INDEX idx_volleyball_seat ON VolleyballDetail(seat_section, seat_row, seat_number);
CREATE INDEX idx_basketball_seat ON BasketballDetail(seat_section, seat_row, seat_number);