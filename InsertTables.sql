INSERT INTO Payment (reservation_id, user_id, amount, payment_status, payment_method)VALUES
(1, 1, 100, 'completed', 'CreditCard'),
(4, 4, 80, 'completed', 'Online'),
(6, 6, 120, 'completed', 'CreditCard'),
(7, 7, 60, 'completed', 'Online'),
(9, 9, 45, 'completed', 'CreditCard'),
(2, 2, 50, 'pending', 'None'),
(3, 3, 30, 'failed', 'None'),
(5, 5, 40, 'pending', 'None'),
(8, 8, 90, 'pending', 'None'),
(10, 10, 35, 'failed', 'None');

INSERT INTO Report (user_id, ticket_id, subject, description, status) VALUES
(1, 1, 'Quality', 'Good', 'closed'),
(2, 2, 'Delay', 'Slow', 'open'),
(3, 3, 'UI', 'Bug', 'open'),
(4, 4, 'Price', 'High', 'closed'),
(5, 5, 'Other', 'None', 'open');

INSERT INTO CancellationRequest (reservation_id, user_id, penalty_percent, refund_amount, status) VALUES
(1, 1, 0, 100, 'approved'),
(4, 4, 10, 72, 'pending'),
(6, 6, 0, 120, 'approved'),
(7, 7, 20, 48, 'processed'),
(9, 9, 0, 45, 'pending');

INSERT INTO FootballDetail (ticket_id, league_name, stadium_name, seat_section, seat_row, seat_number, ticket_type) VALUES
(1, 'IPL', 'Azadi', 'A1', '1', 1, 'Standard'),
(2, 'IPL', 'Azadi', 'A2', '2', 2, 'Standard'),
(3, 'IPL', 'Azadi', 'A3', '3', 3, 'Standard'),
(4, 'IPL', 'Naghsh', 'B1', '1', 1, 'Standard'),
(5, 'IPL', 'Naghsh', 'B2', '2', 2, 'Standard'),
(6, 'IPL', 'Azadi', 'A1', '1', 2, 'Standard'),
(7, 'IPL', 'Azadi', 'A2', '2', 3, 'Standard'),
(8, 'IPL', 'Naghsh', 'B1', '1', 2, 'Standard'),
(9, 'IPL', 'Naghsh', 'B2', '2', 3, 'Standard'),
(10, 'IPL', 'Azadi', 'A3', '3', 4, 'Standard');

INSERT INTO VolleyballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(1, 'Super League', 'Azadi Hall', 'A1', '1', 1, 'Standard', 'Parking, Wi-Fi'),
(2, 'Super League', 'Azadi Hall', 'A2', '2', 2, 'VIP', 'Lounge, Free Drinks'),
(3, 'Super League', 'Ghadir Hall', 'B1', '1', 1, 'Standard', 'Wi-Fi'),
(4, 'Super League', 'Ghadir Hall', 'B2', '2', 2, 'Standard', 'Parking'),
(5, 'Super League', 'Azadi Hall', 'A1', '1', 2, 'VIP', 'Lounge, Free Food');

INSERT INTO BasketballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
(1, 'NBA', 'Madison Square', 'C1', '5', 1, 'Courtside', 'VIP Lounge, Parking'),
(2, 'NBA', 'Staples Center', 'C2', '6', 2, 'Premium', 'Free Drinks, Wi-Fi'),
(3, 'EuroLeague', 'OAKA Hall', 'D1', '3', 1, 'Standard', 'Wi-Fi'),
(4, 'EuroLeague', 'OAKA Hall', 'D2', '4', 2, 'Standard', 'Parking'),
(5, 'NBA', 'Madison Square', 'C1', '5', 2, 'Courtside', 'VIP Lounge, Free Food');