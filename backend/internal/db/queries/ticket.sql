-- name: CreateTicketType :one
INSERT INTO ticket_types (event_id, name, description, price, quantity_available, is_active)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetTicketTypesByEvent :many
SELECT * FROM ticket_types WHERE event_id = $1 ORDER BY price ASC;

-- name: GetTicketTypeByID :one
SELECT * FROM ticket_types WHERE id = $1;
