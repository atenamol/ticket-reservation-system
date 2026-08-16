USE TicketSystem;

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
    (2, 'Aynaz', 'Hosseini', 'aynaz@gmail.com', '09151270125', 'spectator', 2, '$2b$12$f.Jb/1pNcjAaCSvoVlyofujBDon99poitqy9.vFcKpacEu.QizxTm', 'active'),
    (3, 'Reza', 'Karimi', Null , '09012379854', 'spectator', 3, '$2b$12$myBJfBr5B4MqJNuFsqOdZuKnOp2CiNZmoUL4NwCDC.V5I8/jzpJNi', 'inactive'),
    (4, 'Nika', 'Jafari', 'nika@gmail.com', '09010105123', 'spectator', 4, '$2b$12$YDTUw48rXAiv2yhw3jy3pesubS.kpOtarMZImMxiMT.jMxXZCsWJ6', 'active'),
    (5, 'Parsa', 'Hosseini', 'parsa@gmail.com', Null, 'spectator', 5, '$2b$12$WNY4Tac/zzfimSZlIdUjqe.Q7/haMRyGDrJdfFolhTrbjqq8FMEv6', 'active'),
    (6, 'Yasamin', 'Adib', 'yasamin@gmail.com', '09052456630', 'spectator', 1, '$2b$12$zYl7f8A42Gn4D2MZ/K1npOtUSTvvtLqkOkyrD2y8mjMgnszX/TVPa', 'active'),
    (7, 'Atiyeh', 'Saadatzadeh', 'atysaa@gmail.com', '09050125679', 'spectator', 6, '$2b$12$M.4rVrMprt5nZHN56nFeyOWw3xgJUY7iyXs8u2aGIVdXafjLNKETu', 'active'),
    (8, 'Sahar', 'Amini', 'saharamini@gmail.com', Null, 'spectator', 9, '$2b$12$xFhwMQGJttF.7nt2W6qpG.lHhORRaYFm0QlYS4MXgbb9Jvonak7rW', 'active'),
    (9, 'Nima', 'Naseri', 'nimanaseri@gmail.com', Null, 'spectator', 7, '$2b$12$U5HkTT72wsknydvU7m8i8OugVRJMPfSmFqxK9UKFjQdL8axCFmjnW', 'active'),
    (10, 'Milad', 'Karimi', 'miladkarimi@gmail.com', '09017531595', 'spectator', 10, '$2b$12$whv.H67D1KxVCu5l80OLquHpKFIOyE89yWIjW0wi1HWcgUT874YjS', 'active'),
    (11, 'Paria', 'Raad', 'pariraad@gmail.com', Null, 'spectator', 8, '$2b$12$pHo98m3Z21JxxNkgLZsFK.8.gu7T2TckJIPOQ4fJIpFbteedJbZa2', 'inactive'),
    (12, 'Saman', 'Taheri', Null, '09034718629', 'spectator', 7, '$2b$12$HGsoTCOIzotpLoHMOBKWVe9yZHcSPLTmfHttuVkfin1jtf6.VIHnG', 'active'),
    (13,'System','Adminstrator','admin@ticketsystem.com',NULL,'admin',1,'$2b$12$TF8zZcHJVCEdha5eJ7B5huUvlMNqGumEvfw6lh.QuWz9oHOd8j2yC', 'active');


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
    (1, 'Football', 1, 2, 1, '2026-08-20 18:30:00'),
    (2, 'Football', 3, 4, 3, '2026-08-22 20:00:00'),
    (3, 'Football', 5, 1, 5, '2026-08-24 17:00:00'),
    (4, 'Basketball', 2, 3, 2, '2026-08-26 19:00:00'),
    (5, 'Volleyball', 4, 5, 4, '2026-08-28 16:30:00'),
    (6, 'Football', 6, 7, 6, '2026-08-30 18:00:00'),
    (7, 'Football', 8, 9, 7, '2026-09-02 20:00:00'),
    (8, 'Basketball', 10, 2, 8, '2026-09-05 19:30:00'),
    (9, 'Volleyball', 3, 5, 9, '2026-09-08 17:00:00'),
    (10, 'Football', 4, 6, 10, '2026-09-12 21:00:00'),
    (11, 'Football',   1, 3, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (12, 'Basketball', 4, 6, 2, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
    (13, 'Volleyball', 7, 8, 4, DATE_ADD(NOW(), INTERVAL 6 HOUR)),
    (14, 'Football',   2, 5, 3, DATE_ADD(NOW(), INTERVAL 18 HOUR)),
    (15, 'Basketball', 9, 10, 8, DATE_ADD(NOW(), INTERVAL 36 HOUR)),
    (16, 'Volleyball', 3, 6, 9, DATE_ADD(NOW(), INTERVAL 72 HOUR)),
    (17, 'Football',   8, 10, 10, DATE_ADD(NOW(), INTERVAL 14 DAY));


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
    (10, 10, 300000.00, 400, 'VIP', 10),
    (11, 11, 180000.00, 0,    'VIP',     1),  -- sold out
    (12, 11, 70000.00, 0,    'normal',  1),  -- sold out
    (13, 12, 130000.00, 250,  'special', 2),
    (14, 12, 60000.00, 1,    'normal',  2),  -- almost sold out
    (15, 13, 210000.00, 500,  'VIP',     4),
    (16, 13, 90000.00, 50,   'normal',  4),
    (17, 14, 280000.00, 300,  'VIP',     3),
    (18, 14, 120000.00, 100, 'special', 3),
    (19, 15, 160000.00, 200,  'VIP',     8),
    (20, 15, 80000.00, 20,  'normal',  8),
    (21, 16, 140000.00, 400,  'normal',  9),
    (22, 16, 220000.00, 100, 'special', 9),
    (23, 17, 350000.00, 700,  'VIP',     10),
    (24, 17, 150000.00, 300, 'normal',  10);

INSERT INTO Reservation (reservation_id, ticket_id, user_id, status, reserved_at, expires_at) VALUES
    (1, 1, 1, 'paid', '2026-08-01 10:00:00', '2026-08-01 10:10:00'),
    (2, 2, 4, 'cancelled',    '2026-08-02 14:30:00', '2026-08-02 14:40:00'),
    (3, 3, 6, 'reserved','2026-08-16 07:15:00', '2026-08-16 07:25:00'),
    (4, 4, 2, 'cancelled', '2026-08-16 08:00:00', '2026-08-16 08:10:00'),
    (5, 5, 5, 'reserved',     '2026-08-16 09:00:00', '2026-08-16 09:10:00'),
    (6, 6, 7, 'cancelled', '2026-08-16 10:00:00', '2026-08-16 10:10:00'),
    (7, 7, 8, 'paid', '2026-08-16 11:30:00', '2026-08-16 11:40:00'),
    (8, 8, 9, 'paid', '2026-08-16 12:00:00', '2026-08-16 12:10:00'),
    (9, 9, 10, 'cancelled', '2026-08-16 13:20:00', '2026-08-16 13:30:00'),
    (10, 10, 12, 'paid', '2026-08-16 13:40:00', '2026-08-16 13:50:00'),
    (11, 11, 1, 'paid',DATE_SUB(NOW(), INTERVAL 10 DAY),DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 10 MINUTE),

    -- Past cancelled reservation
    (12, 12, 4, 'cancelled',DATE_SUB(NOW(), INTERVAL 8 DAY),DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 10 MINUTE),

    -- Today's finished match
    (13, 13, 1, 'paid',DATE_SUB(NOW(), INTERVAL 1 DAY),DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 MINUTE),

    -- Today's upcoming match
    (14, 15, 1, 'paid',NOW() - INTERVAL 30 MINUTE,NOW() + INTERVAL 9 MINUTE),

    -- Active reservation that has NOT expired
    (15, 16, 1, 'reserved',NOW() - INTERVAL 2 MINUTE,NOW() + INTERVAL 8 MINUTE),

    -- Expired reservation
    (16, 17, 6, 'reserved',DATE_SUB(NOW(), INTERVAL 20 MINUTE),DATE_SUB(NOW(), INTERVAL 10 MINUTE)),

    -- <24-hour cancellation scenario
    (17, 18, 7, 'paid',NOW() - INTERVAL 30 MINUTE,NOW() + INTERVAL 9 MINUTE),

    -- 24-48-hour cancellation scenario
    (18, 19, 8, 'paid',NOW() - INTERVAL 1 HOUR,NOW() + INTERVAL 9 MINUTE),

    -- >=48-hour cancellation scenario
    (19, 21, 9, 'paid',NOW() - INTERVAL 2 HOUR,NOW() + INTERVAL 9 MINUTE),

    -- Future paid reservation
    (20, 23, 12, 'paid',NOW() - INTERVAL 1 DAY,NOW() - INTERVAL 1 DAY + INTERVAL 10 MINUTE),

    -- Another active reservation
    (21, 14, 11, 'reserved',NOW() - INTERVAL 1 MINUTE,NOW() + INTERVAL 9 MINUTE),

    -- Another cancelled reservation
    (22, 20, 3, 'cancelled',DATE_SUB(NOW(), INTERVAL 5 DAY),DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 10 MINUTE);

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
    (10, 10, 12, 300000.00, 'completed', 'Online', 0),
    (11, 11, 1, 180000.00,'completed', 'CreditCard', 0),
    (12, 12, 4, 70000.00,'completed', 'Online', 70000.00),
    (13, 13, 1, 130000.00,'completed', 'CreditCard', 0),
    (14, 14, 1, 210000.00, 'completed', 'Online', 0),
    (15, 17, 7, 120000.00,'completed', 'CreditCard', 0),
    (16, 18, 8, 160000.00,'completed', 'Online', 0),
    (17, 19, 9, 140000.00,'completed', 'CreditCard', 0),
    (18, 20, 12, 350000.00,'completed', 'Online', 0),
    (19, 22, 3, 80000.00,'failed', 'CreditCard', 0);

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
    (10, 12, 10, 'Other', 'Match rescheduled, need refund', 'in_progress', 'Checking policy'),
    (11, 1, 13, 'Refund','Refund has not appeared in my account.','open', NULL),
    (12, 4, 13, 'Refund','I was charged but the refund is still pending.','in_progress', 'Reviewing the transaction.'),
    (13, 6, 13, 'Refund','Refund amount appears incorrect.','closed', 'Refund calculation was corrected.'),
    (14, 7, 17, 'Payment','Payment succeeded but reservation status is unexpected.','open', NULL),
    (15, 8, 18, 'Seat Issue','Selected seat is not available.','in_progress', 'Checking seat allocation.'),
    (16, 9, 21, 'Quality','View from the selected section is obstructed.','closed', 'Issue resolved.'),
    (17, 12, 23, 'Other','Need information about venue policy.','open', NULL);

INSERT INTO CancellationRequest (cancel_id, reservation_id, user_id, penalty_percent, refund_amount, status, processed_at, admin_id) VALUES
    (1, 1, 1, 5.00, 237500.00, 'pending', NULL, NULL),
    (2, 2, 4, 0, 80000.00, 'approved', '2026-08-03 10:30:00', 2),
    (3, 3, 6, 15.00, 170000.00, 'pending', NULL, NULL),
    (4, 4, 2, 0, 60000.00, 'approved', '2026-08-16 9:00:00', 5),
    (5, 5, 5, 10.00, 135000.00, 'rejected', '2026-08-16 09:15:00', 2),
    (6, 6, 7, 0, 90000.00, 'approved', '2026-08-16 11:00:00', 2),
    (7, 7, 8, 5.00, 209000.00, 'pending', NULL, NULL),
    (8, 8, 9, 10.00, 162000.00, 'rejected', '2026-08-16 12:50:00', 10),
    (9, 9, 10, 0, 120000.00, 'approved', '2026-08-16 13:30:00', 5),
    (10, 10, 12, 15.00, 255000.00, 'pending', NULL, NULL),
    -- <24 hours → 50%
    (11, 17, 7, 50.00,60000.00,'pending', NULL, NULL),

    -- 24-48 hours → 30%
    (12, 18, 8, 30.00,112000.00,'approved', NOW(), 2),

    -- >=48 hours → 10%
    (13, 19, 9, 10.00,126000.00,'approved', NOW(), 5),

    -- Rejected request
    (14, 20, 12, 10.00,315000.00,'rejected', NOW(), 2);


INSERT INTO FootballDetail (ticket_id, league_name, stadium_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
    (1, 'IPL', 'Azadi', 'A4', '4', 5, 'VIP', 'Lounge, Parking'),
    (2, 'IPL', 'Azadi', 'B3', '3', 4, 'normal', 'Wi-Fi'),
    (3, 'IPL', 'Naghsh-e-Jahan', 'A1', '1', 6, 'special', 'Free Food, Parking'),
    (4, 'IPL', 'Sardar Jangal', 'B1', '1', 5, 'normal', 'Wi-Fi, Parking'),
    (6, 'IPL', 'Shahid Bahonar', 'C2', '2', 3, 'normal', 'Parking'),
    (7, 'IPL', 'Nasiri', 'A3', '3', 7, 'VIP', 'Lounge, Free Drinks'),
    (10, 'IPL', 'Ghadir', 'A1', '1', 2, 'VIP', 'Lounge, Free Food, Parking'),
    (11, 'Iran Pro League', 'Azadi', 'A1', '1', 1,'VIP', 'Lounge, Parking, Wi-Fi'),
    (12, 'Iran Pro League', 'Azadi', 'B2', '2', 5,'normal', 'Parking'),
    (17, 'Iran Pro League', 'Naghsh-e-Jahan', 'A3', '3', 8,'VIP', 'Lounge, Free Food, Parking'),
    (18, 'Iran Pro League', 'Naghsh-e-Jahan', 'C2', '2', 12,'special', 'Free Food, Wi-Fi'),
    (23, 'Iran Pro League', 'Ghadir', 'A1', '1', 3,'VIP', 'Lounge, Parking'),
    (24, 'Iran Pro League', 'Ghadir', 'B4', '4', 10,'normal', 'Wi-Fi, Parking');

INSERT INTO BasketballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
    (5, 'IBL', 'Imam Reza Hall', 'C3', '7', 3, 'VIP', 'Free Drinks, Parking'),
    (8, 'IBL', 'Mottaqi Hall', 'C1', '5', 4, 'special', 'VIP Lounge, Free Food'),
    (13, 'IBL', 'Imam Reza Hall', 'A1', '1', 2,'special', 'Free Food, Parking'),
    (14, 'IBL', 'Imam Reza Hall', 'B2', '2', 6,'normal', 'Wi-Fi'),
    (19, 'IBL', 'Mottaqi Hall', 'C1', '1', 4,'VIP', 'VIP Lounge, Free Drinks'),
    (20, 'IBL', 'Mottaqi Hall', 'C3', '3', 9,'normal', 'Parking'),
    (21, 'IBL', 'Takhti Hall', 'A2', '2', 7,'normal', 'Wi-Fi, Parking'),
    (22, 'IBL', 'Takhti Hall', 'B1', '1', 11,'special', 'Free Drinks');

INSERT INTO VolleyballDetail (ticket_id, league_name, hall_name, seat_section, seat_row, seat_number, ticket_type, amenities) VALUES
    (9, 'Super League', 'Takhti Hall', 'A1', '1', 1, 'normal', 'Parking, Wi-Fi'),
    (15, 'Super League', 'Hafezieh Hall', 'A1', '1', 1,'VIP', 'Lounge, Parking'),
    (16, 'Super League', 'Hafezieh Hall', 'B2', '2', 5,'normal', 'Wi-Fi'),
    (21, 'Super League', 'Takhti Hall', 'A3', '3', 6,'normal', 'Parking, Wi-Fi'),
    (22, 'Super League', 'Takhti Hall', 'C1', '1', 8,'special', 'Free Food'),
    (23, 'National League', 'Ghadir Hall', 'A2', '2', 4,'VIP', 'Lounge, Free Drinks');
