-- name: CreateTicketType :one
INSERT INTO ticket_types (event_id, name, description, price, quantity_available, is_active)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;