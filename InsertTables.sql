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