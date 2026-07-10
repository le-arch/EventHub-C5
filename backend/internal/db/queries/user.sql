-- name: CreateUser :one
INSERT INTO "users" (email, phone, password_hash, full_name, role, is_email_verified)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users 
WHERE email = $1; 

-- name: GetUserByPhone :one
SELECT * FROM users 
WHERE phone = $1; 

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

-- name: UpdateUserVerification :exec
UPDATE users 
SET is_email_verified = $2 
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
