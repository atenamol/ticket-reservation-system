USE TicketSystem;

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


-- SAMPLE TEST CALLS
CALL GetTicketsByCity('Tehran');
CALL SearchTickets('VIP');
CALL GetUsersFromSameCity('ali@gmail.com');
CALL SearchTickets('azadi stadium');