-- name: CreateOrder :one
INSERT INTO orders (
    event_id, ticket_type_id, attendee_name, attendee_phone, attendee_email,
    quantity, unit_price, total_amount, payment_status, transaction_id, qr_code_hash
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING *;