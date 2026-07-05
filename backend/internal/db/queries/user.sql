-- name: CreateUser :one
INSERT INTO "users" (email, phone, password_hash, full_name, role, is_email_verified, is_organizer_verified)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users 
WHERE email = $1; 

-- name: GetUserByID :one
SELECT * FROM users 
WHERE id = $1;

-- name: UpdateUserPassword :exec
UPDATE "users" 
SET password_hash = $1 
WHERE email = $2;

-- name: GetAllUsers :many
SELECT * FROM users
WHERE role = $1
ORDER BY created_at DESC;

-- name: GetAllUsersForAdmin :many
SELECT u.id, u.email, u.phone, u.full_name, u.role, u.is_email_verified, u.is_active, u.is_organizer_verified, u.created_at,
       COALESCE((SELECT COUNT(*) FROM events e WHERE e.organizer_id = u.id), 0)::int AS events_count
FROM users u
ORDER BY u.created_at DESC;

-- name: UpdateUserVerification :exec
UPDATE users 
SET is_email_verified = $2 
WHERE id = $1;

-- name: UpdateOrganizerVerification :exec
UPDATE users
SET is_organizer_verified = $2
WHERE id = $1;

-- name: UpdateUserActiveStatus :exec
UPDATE users 
SET is_active = $2 
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users 
WHERE id = $1;

-- name: GetUserByIDForAdmin :one
SELECT id, email, full_name, role, is_email_verified, is_active, created_at
FROM users WHERE id = $1;
