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
    COUNT(*) AS paid_orders,
    COALESCE(SUM(total_amount - platform_fee), 0) AS net_revenue,
    COALESCE(SUM(total_amount), 0) AS gross_revenue,
    COUNT(*) FILTER (WHERE is_used = TRUE) AS checked_in_count
FROM orders
WHERE event_id = $1 AND payment_status = 'paid';

-- name: ListCheckinHistoryByEvent :many
SELECT o.id AS order_id, o.attendee_name, o.attendee_phone, o.used_at, COALESCE(tt.name, '') AS ticket_type_name
FROM orders o
LEFT JOIN ticket_types tt ON o.ticket_type_id = tt.id
WHERE o.event_id = $1 AND o.is_used = TRUE
ORDER BY o.used_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAllTransactions :many
SELECT o.id AS order_id, e.title AS event_title, o.attendee_name, o.total_amount AS amount, o.payment_status, o.created_at
FROM orders o
JOIN events e ON o.event_id = e.id
WHERE ($1::text = '' OR o.payment_status = $1::payment_status)
  AND ($2::uuid = '00000000-0000-0000-0000-000000000000' OR o.event_id = $2::uuid)
ORDER BY o.created_at DESC
LIMIT $3 OFFSET $4;

-- name: GetEventTicketStats :one
SELECT
    COUNT(DISTINCT o.id)::int AS total_sold,
    COALESCE(SUM(o.total_amount), 0)::int AS total_revenue,
    COUNT(DISTINCT o.attendee_name)::int AS total_attendees,
    COALESCE((SELECT SUM(tt.quantity_available - COALESCE(tt.quantity_sold, 0)) FROM ticket_types tt WHERE tt.event_id = $1), 0)::int AS available_tickets
FROM orders o
WHERE o.event_id = $1 AND o.payment_status = 'paid';

-- name: GetEventDailySales :many
SELECT
    DATE(o.created_at)::text AS date,
    COUNT(*)::int AS sales,
    SUM(o.total_amount)::int AS revenue
FROM orders o
WHERE o.event_id = $1 AND o.payment_status = 'paid'
GROUP BY DATE(o.created_at)
ORDER BY date;

-- name: GetEventTicketBreakdown :many
SELECT
    tt.name,
    COALESCE(tt.quantity_sold, 0)::int AS sold,
    (COALESCE(tt.quantity_sold, 0) * tt.price)::int AS revenue,
    COALESCE(tt.quantity_available, 0)::int AS available
FROM ticket_types tt
WHERE tt.event_id = $1 AND (tt.is_active IS NULL OR tt.is_active = TRUE)
ORDER BY tt.name;

-- name: GetPlatformAnalytics :one
SELECT
    COUNT(DISTINCT u.id) AS total_users,
    COUNT(DISTINCT e.id) AS total_events,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS gross_revenue,
    COALESCE(SUM(o.platform_fee), 0) AS total_platform_fee,
    COALESCE(SUM(o.total_amount - o.platform_fee), 0) AS net_revenue,
    COUNT(o.id) FILTER (WHERE o.is_used = TRUE) AS total_checked_in
FROM users u
LEFT JOIN events e ON e.organizer_id = u.id
LEFT JOIN orders o ON o.event_id = e.id AND o.payment_status = 'paid';