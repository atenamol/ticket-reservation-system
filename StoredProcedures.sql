USE ticketsystem;

DELIMITER $$

CREATE PROCEDURE GetUserTicketsByContact(IN p_contact VARCHAR(100))
BEGIN
    SELECT
        t.ticket_id,
        m.sport_type,
        m.match_date,
        t.category,
        t.price,
        p.transaction_date
    FROM User u
    JOIN Payment p ON p.user_id = u.user_id
    JOIN Reservation r ON p.reservation_id = r.reservation_id
    JOIN Ticket t ON r.ticket_id = t.ticket_id
    JOIN Matchh m ON t.match_id = m.match_id
    WHERE (u.email = p_contact OR u.phone = p_contact)
      AND p.payment_status = 'completed'
    ORDER BY p.transaction_date;
END$$

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