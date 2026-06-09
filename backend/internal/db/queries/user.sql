-- name: CreateUser :one
INSERT INTO "users" (email, phone, password_hash, full_name, role, is_email_verified)
VALUES ($1, $2, $3, $4, $5, $6)
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
