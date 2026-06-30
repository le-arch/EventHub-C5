-- name: CreateOrder :one
INSERT INTO orders (
    event_id, ticket_type_id, attendee_name, attendee_phone, attendee_email,
    quantity, unit_price, total_amount, payment_status, transaction_id,
    qr_code_hash, qr_code_plaintext, qr_code_image_url,
    device_info, ip_address, platform_fee
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
)
RETURNING *;

-- name: GetOrderByID :one
SELECT * FROM orders WHERE id = $1;

-- name: UpdateOrderPayment :exec
UPDATE orders
SET
    payment_status = $2,
    transaction_id = $3,
    payment_received_at = CURRENT_TIMESTAMP,
    payment_webhook_received = TRUE
WHERE id = $1
RETURNING *;

-- name: DecrementTicketQuantity :execrows
UPDATE ticket_types
SET quantity_available = quantity_available - $2,
    quantity_sold = quantity_sold + $2
WHERE id = $1 AND quantity_available >= $2;

-- name: InsertWebhookLog :one
INSERT INTO webhook_logs (
    gateway, payload, headers, signature_valid, processed,error_message, received_at
) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
RETURNING *;

-- name: GetOrderByTransactionID :one
SELECT * FROM orders 
WHERE transaction_id = $1;

-- name: ListOrderByEvent :many
SELECT * FROM orders
WHERE event_id = $1
ORDER BY created_at DESC;

-- name: UpdateOrderQRCode :exec
UPDATE orders
SET qr_code_hash = $2, qr_code_image_url = $3
WHERE id = $1;

-- name: UpdateOrderQRImage :exec
UPDATE orders
SET qr_code_image_url = $2
WHERE id = $1;

-- name: GetOrderByQRHash :one
SELECT * FROM orders
WHERE qr_code_hash = $1;


-- name: MarkOrderUsed :exec
UPDATE orders 
SET is_used = TRUE, used_at = CURRENT_TIMESTAMP
WHERE id = $1 AND is_used = FALSE;

-- name: ListAttendeesByEvent :many
SELECT id, attendee_name, attendee_phone, attendee_email, is_used, used_at, created_at
FROM orders
WHERE event_id = $1 AND payment_status = 'paid'
ORDER BY created_at DESC;

-- name: GetEventAnalytics :one
SELECT
	COUNT(*) AS total_orders,
	SUM(total_amount) AS total_revenue,
	COUNT(*) FILTER (WHERE is_used = TRUE) AS checked_in_count,
	COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders
FROM orders
WHERE event_id = $1 AND payment_status = 'paid';

-- name: ListCheckinHistoryByEvent :many
SELECT id AS order_id, attendee_name, attendee_phone, used_at
FROM orders
WHERE event_id = $1 AND is_used = TRUE
ORDER BY used_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAllTransactions :many
SELECT o.id AS order_id, e.title AS event_title, o.attendee_name, o.total_amount AS amount, o.payment_status, o.created_at
FROM orders o
JOIN events e ON o.event_id = e.id
WHERE ($1::text = '' OR o.payment_status = $1::payment_status)
  AND ($2::uuid = '00000000-0000-0000-0000-000000000000' OR o.event_id = $2::uuid)
ORDER BY o.created_at DESC
LIMIT $3 OFFSET $4;