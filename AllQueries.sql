USE TicketSystem;

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
