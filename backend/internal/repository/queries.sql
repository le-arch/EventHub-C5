-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByIdentifier :one
SELECT * FROM users WHERE email = $1 OR phone = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: CreateUser :one
INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: UpdateUserVerified :one
UPDATE users SET is_email_verified = true, updated_at = now() WHERE email = $1 RETURNING *;

-- name: UpdateUserProfile :exec
UPDATE users SET full_name = $2, email = $3, phone = $4, updated_at = now() WHERE id = $1;

-- name: UpdateUserPassword :exec
UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1;

-- name: ListUsers :many
SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: VerifyUser :exec
UPDATE users SET is_email_verified = true, updated_at = now() WHERE id = $1;

-- name: SuspendUser :exec
UPDATE users SET is_active = false, updated_at = now() WHERE id = $1;

-- name: UnsuspendUser :exec
UPDATE users SET is_active = true, updated_at = now() WHERE id = $1;

-- Events
-- name: CreateEvent :one
INSERT INTO events (organizer_id, title, description, venue_name, venue_address, city, start_date, end_date, start_time, end_time, cover_image_url, status, sales_start_date, sales_end_date)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;

-- name: GetEvent :one
SELECT * FROM events WHERE id = $1;

-- name: GetPublicEvent :one
SELECT * FROM events WHERE id = $1 AND status = 'published';

-- name: ListEventsByOrganizer :many
SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: ListAllEvents :many
SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: CountEvents :one
SELECT COUNT(*) FROM events;

-- name: UpdateEvent :exec
UPDATE events SET title = $2, description = $3, venue_name = $4, venue_address = $5, city = $6, start_date = $7, end_date = $8, start_time = $9, end_time = $10, cover_image_url = $11, status = $12, sales_start_date = $13, sales_end_date = $14, updated_at = now() WHERE id = $1;

-- name: DeleteEvent :exec
DELETE FROM events WHERE id = $1;

-- name: PublishEvent :exec
UPDATE events SET status = 'published', updated_at = now() WHERE id = $1;

-- name: UnpublishEvent :exec
UPDATE events SET status = 'draft', updated_at = now() WHERE id = $1;

-- name: CancelEvent :exec
UPDATE events SET status = 'cancelled', updated_at = now() WHERE id = $1;

-- Ticket Types
-- name: CreateTicketType :one
INSERT INTO ticket_types (event_id, name, description, price, quantity_available)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: GetTicketTypesByEvent :many
SELECT * FROM ticket_types WHERE event_id = $1 AND is_active = true;

-- name: UpdateTicketType :exec
UPDATE ticket_types SET name = $2, description = $3, price = $4, quantity_available = $5, updated_at = now() WHERE id = $1;

-- name: DeleteTicketType :exec
DELETE FROM ticket_types WHERE id = $1;

-- Orders
-- name: CreateOrder :one
INSERT INTO orders (event_id, ticket_type_id, attendee_name, attendee_phone, attendee_email, quantity, unit_price, total_amount, payment_status, payment_method)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;

-- name: GetOrder :one
SELECT * FROM orders WHERE id = $1;

-- name: GetOrderByTransactionID :one
SELECT * FROM orders WHERE transaction_id = $1;

-- name: UpdateOrderPaymentStatus :exec
UPDATE orders SET payment_status = $2, payment_received_at = now(), updated_at = now() WHERE id = $1;

-- name: UpdateOrderTransaction :exec
UPDATE orders SET transaction_id = $2, updated_at = now() WHERE id = $1;

-- name: UpdateOrderQR :exec
UPDATE orders SET qr_code_hash = $2, qr_code_image_url = $3, updated_at = now() WHERE id = $1;

-- name: MarkOrderUsed :exec
UPDATE orders SET is_used = $2, used_at = $3, checked_in_by = $4, updated_at = now() WHERE id = $1;

-- name: ListAllOrders :many
SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: CountOrders :one
SELECT COUNT(*) FROM orders;

-- Check-in Logs
-- name: CreateCheckInLog :exec
INSERT INTO check_in_logs (order_id, attendee_name, event_id, scanned_by, ip_address, user_agent)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetCheckInHistoryByEvent :many
SELECT * FROM check_in_logs WHERE event_id = $1 ORDER BY scanned_at DESC LIMIT $2;