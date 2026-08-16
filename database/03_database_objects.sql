USE TicketSystem;

-- Stored Procedure 2: Given an admin's email or phone, list
-- the names of users who've had a reservation cancelled by them

DROP PROCEDURE IF EXISTS GetUsersCancelledByAdmin;
DELIMITER $$

CREATE PROCEDURE GetUsersCancelledByAdmin(IN p_admin_contact VARCHAR(100))
BEGIN
SELECT DISTINCT
    u.user_id,
    u.first_name,
    u.last_name
FROM CancellationRequest cr
         JOIN User admin_u ON cr.admin_id = admin_u.user_id
         JOIN User u ON cr.user_id = u.user_id
WHERE (admin_u.email = p_admin_contact OR admin_u.phone = p_admin_contact)
  AND cr.status = 'approved';
END$$

DELIMITER ;


-- Test calls:
-- CALL GetUserTicketsByContact('ali@gmail.com');
-- CALL GetUsersCancelledByAdmin('aynaz@gmail.com');


-- STORED PROCEDURE 3: Get tickets purchased in a specific city
DROP PROCEDURE IF EXISTS GetTicketsByCity;
DELIMITER //

CREATE PROCEDURE GetTicketsByCity(IN city_name VARCHAR(100))
BEGIN
SELECT
    t.ticket_id,
    t.price,
    t.category,
    m.match_date,
    m.sport_type,
    v.name AS venue_name,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    r.reserved_at AS purchase_time
FROM Ticket t
         JOIN Matchh m ON t.match_id = m.match_id
         JOIN Venue v ON m.venue_id = v.venue_id
         JOIN City c ON v.city_id = c.city_id
         JOIN Reservation r ON t.ticket_id = r.ticket_id
         JOIN User u ON r.user_id = u.user_id
WHERE c.name = city_name
  AND r.status = 'paid'
ORDER BY r.reserved_at DESC;
END //

DELIMITER ;


-- STORED PROCEDURE 4: Search tickets by text
DROP PROCEDURE IF EXISTS SearchTickets;
DELIMITER //

CREATE PROCEDURE SearchTickets(IN search_term VARCHAR(200))
BEGIN
SELECT
    t.ticket_id,
    t.price,
    t.category,
    m.match_date,
    m.sport_type,
    v.name AS venue_name,
    ht.name AS home_team,
    at.name AS away_team,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    COALESCE(r.status, 'available') AS ticket_status
FROM Ticket t
         JOIN Matchh m
              ON t.match_id = m.match_id
         JOIN Venue v
              ON m.venue_id = v.venue_id
         JOIN Team ht
              ON m.home_team_id = ht.team_id
         JOIN Team at
ON m.away_team_id = at.team_id
    LEFT JOIN Reservation r
    ON t.ticket_id = r.ticket_id
    LEFT JOIN User u
    ON r.user_id = u.user_id
WHERE
    t.category LIKE CONCAT('%', search_term, '%')
   OR v.name LIKE CONCAT('%', search_term, '%')
   OR ht.name LIKE CONCAT('%', search_term, '%')
   OR at.name LIKE CONCAT('%', search_term, '%')
   OR u.first_name LIKE CONCAT('%', search_term, '%')
   OR u.last_name LIKE CONCAT('%', search_term, '%')
   OR CONCAT(u.first_name, ' ', u.last_name)
    LIKE CONCAT('%', search_term, '%')
ORDER BY
    m.match_date DESC,
    t.ticket_id;
END //

DELIMITER ;


-- STORED PROCEDURE 5: Get other users from the same city
DROP PROCEDURE IF EXISTS GetUsersFromSameCity;
DELIMITER //

CREATE PROCEDURE GetUsersFromSameCity(IN user_contact VARCHAR(100))
BEGIN
SELECT
    u2.user_id,
    u2.first_name,
    u2.last_name,
    u2.email,
    u2.phone,
    u2.role,
    c.name AS city_name
FROM User u1
         JOIN City c ON u1.city_id = c.city_id
         JOIN User u2 ON u2.city_id = c.city_id
WHERE (u1.email = user_contact OR u1.phone = user_contact)
  AND u2.user_id != u1.user_id
ORDER BY u2.first_name;
END //

DELIMITER ;

-- SP6: Top N users after a given date.

DROP PROCEDURE IF EXISTS GetTopUsersAfterDate;
DELIMITER $$
CREATE PROCEDURE GetTopUsersAfterDate(
    IN given_date DATETIME,
    IN user_limit INT
)
BEGIN

SELECT
    u.user_id,
    CONCAT(u.first_name,' ',u.last_name) AS full_name,
    COALESCE(u.email,u.phone) AS contact,
    COUNT(*) AS total_ticket
FROM User u
         JOIN Reservation r
              ON u.user_id=r.user_id
WHERE
    r.status='paid'
  AND r.reserved_at>=given_date
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone
ORDER BY total_ticket DESC
    LIMIT user_limit;

END $$

DELIMITER ;


-- SP7: Cancelled reservations by sport.

DROP PROCEDURE IF EXISTS GetCancelledReservationsBySport;
DELIMITER $$
CREATE PROCEDURE GetCancelledReservationsBySport(
    IN sport_type ENUM('Football','Basketball','Volleyball')
)
BEGIN

SELECT
    r.reservation_id,
    t.ticket_id,
    m.match_id,
    t.organizer_venue_id,
    m.sport_type,
    r.reserved_at,
    CONCAT(u.first_name,' ',u.last_name) AS full_name,
    t.category,
    t.price

FROM Reservation r
         JOIN Ticket t
              ON r.ticket_id=t.ticket_id
         JOIN Matchh m
              ON t.match_id=m.match_id
         JOIN User u
              ON r.user_id=u.user_id
WHERE
    r.status='cancelled'
  AND m.sport_type=sport_type
ORDER BY r.reserved_at DESC;

END $$

DELIMITER ;


-- SP8: Users with the most reports by subject.

DROP PROCEDURE IF EXISTS GetTopReportersBySubject;
DELIMITER $$
CREATE PROCEDURE GetTopReportUsers(IN p_report_subject VARCHAR(200))
BEGIN
SELECT
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    COUNT(*) AS total_reports
FROM Report rep
         JOIN User u
              ON rep.user_id = u.user_id
WHERE rep.subject = p_report_subject
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name
HAVING COUNT(*) = (
    SELECT MAX(report_count)
    FROM (
             SELECT COUNT(*) AS report_count
             FROM Report
             WHERE subject = p_report_subject
             GROUP BY user_id
         ) AS x
);
END;

DELIMITER ;

-- SAMPLE TEST CALLS
-- CALL GetTicketsByCity('Tehran');
-- CALL SearchTickets('VIP');
-- CALL GetUsersFromSameCity('ali@gmail.com');
-- CALL SearchTickets('azadi stadium');
-- CALL GetTopUsersAfterDate('2026-01-01 00:00:00', 3);
-- CALL GetCancelledReservationsBySport('Football');
-- CALL GetTopReportersBySubject('Refund');