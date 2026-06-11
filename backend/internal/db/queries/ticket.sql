-- name: CreateTicketType :one
INSERT INTO ticket_types (event_id, name, description, price, quantity_available, is_active)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetTicketTypesByEvent :many
SELECT * FROM ticket_types WHERE event_id = $1 ORDER BY price ASC;

-- name: GetTicketTypeByID :one
SELECT * FROM ticket_types WHERE id = $1;

-- name: UpdateTicketType :one
UPDATE ticket_types
SET
    name = COALESCE(sqlc.narg(name), name),
    description = COALESCE(sqlc.narg(description), description),
    price = COALESCE(sqlc.narg(price), price),
    quantity_available = COALESCE(sqlc.narg(quantity_available), quantity_available),
    is_active = COALESCE(sqlc.narg(is_active), is_active)
WHERE id = $1 AND event_id = $2
RETURNING *;