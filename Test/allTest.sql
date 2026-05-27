SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.role,
    c.name AS city_name,
    u.account_status
FROM User u
JOIN City c ON u.city_id = c.city_id;

SELECT 
    m.match_id,
    m.sport_type,
    ht.name AS home_team,
    at.name AS away_team,
    v.name AS venue_name,
    m.match_date
FROM Matchh m
JOIN Team ht ON m.home_team_id = ht.team_id
JOIN Team at ON m.away_team_id = at.team_id
JOIN Venue v ON m.venue_id = v.venue_id;

SELECT 
    t.ticket_id,
    m.sport_type,
    m.match_date,
    t.price,
    t.category,
    t.remaining_capacity,
    v.name AS organizer_venue_id
FROM Ticket t
JOIN Matchh m ON t.match_id = m.match_id
JOIN Venue v ON t.organizer_venue_id = v.venue_id;

SELECT 
    r.reservation_id,
    u.first_name,
    u.last_name,
    t.category,
    r.status,
    r.reserved_at,
    r.expires_at
FROM Reservation r
JOIN User u ON r.user_id = u.user_id
JOIN Ticket t ON r.ticket_id = t.ticket_id;

SELECT 
    p.payment_id,
    p.amount,
    p.payment_status,
    p.payment_method,
    p.transaction_date,
    r.reservation_id,
    r.status AS reservation_status,
    u.first_name,
    u.last_name
FROM Payment p
JOIN Reservation r ON p.reservation_id = r.reservation_id
JOIN User u ON p.user_id = u.user_id;

SELECT 
    c.cancel_id,
    u.first_name,
    u.last_name,
    c.penalty_percent,
    c.refund_amount,
    c.status,
    c.requested_at,
    c.processed_at,
    r.reservation_id
FROM CancellationRequest c
JOIN Reservation r ON c.reservation_id = r.reservation_id
JOIN User u ON c.user_id = u.user_id;

SELECT 
    rp.report_id,
    u.email,
    rp.subject,
    rp.description,
    rp.status,
    rp.created_at,
    t.ticket_id
FROM Report rp
JOIN User u ON rp.user_id = u.user_id
JOIN Ticket t ON rp.ticket_id = t.ticket_id;


SELECT 
    v.name AS venue_name,
    c.name AS city_name,
    v.capacity,
    m.match_id,
    m.match_date,
    m.sport_type,
    v.address
FROM Venue v
JOIN City c ON v.city_id = c.city_id
JOIN Matchh m ON v.venue_id = m.venue_id;


SELECT 
    fd.football_detail_id,
    t.ticket_id,
    m.match_id,
    m.match_date,
    fd.league_name,
    fd.stadium_name,
    fd.seat_section,
    fd.seat_row,
    fd.seat_number
FROM FootballDetail fd
JOIN Ticket t ON fd.ticket_id = t.ticket_id
JOIN Matchh m ON t.match_id = m.match_id
WHERE m.sport_type = 'Football';

SELECT 
    vl.volleyball_detail_id,
    t.ticket_id,
    m.match_id,
    m.match_date,
    vl.league_name,
    vl.hall_name,
    vl.seat_section,
    vl.seat_row,
    vl.seat_number
FROM VolleyballDetail vl
JOIN Ticket t ON vl.ticket_id = t.ticket_id
JOIN Matchh m ON t.match_id = m.match_id
WHERE m.sport_type = 'Volleyball';

SELECT 
    bk.Basketball_detail_id,
    t.ticket_id,
    m.match_id,
    m.match_date,
    bk.league_name,
    bk.hall_name,
    bk.seat_section,
    bk.seat_row,
    bk.seat_number
FROM BasketballDetail bk
JOIN Ticket t ON bk.ticket_id = t.ticket_id
JOIN Matchh m ON t.match_id = m.match_id
WHERE m.sport_type = 'Basketball';
