-- name: CreateUser :one
INSERT INTO "users" (email, phone, password_hash, full_name, role, is_email_verified)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM "users" WHERE email = $1; 

-- name: GetUserByID :one
SELECT * FROM "users" WHERE id = $1;
