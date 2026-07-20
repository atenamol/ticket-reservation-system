USE TicketSystem;

-- QUERY 1: Users who have never reserved any ticket
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone
FROM User u
LEFT JOIN Reservation r ON u.user_id = r.user_id
WHERE r.reservation_id IS NULL;

-- QUERY 2: Users who have purchased at least one ticket
SELECT DISTINCT
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone
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
