-- name: CreateUser :one
INSERT INTO "users" (email,phone, password_hash, full_name)
VALUES ($1, $2, $3, $4)
RETURNING *;
