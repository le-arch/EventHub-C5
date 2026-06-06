-- name: CreateEvent :one
INSERT INTO events (organizer_id, title, slug, description, venue, city, start_date, end_date, start_time, end_time, cover_image_url, status, sales_start_date, sales_end_date,capacity_range)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
RETURNING *;

-- name: GetEventByID :one
SELECT * FROM events 
WHERE id = $1
LIMIT 1;

-- name: GetEventsBySlug :one
SELECT * FROM events 
WHERE slug = $1
LIMIT 1;

-- name: ListEventsByOrganizer :many
SELECT * FROM events 
WHERE organizer_id = $1
ORDER BY start_date DESC, start_time DESC;

-- name: ListEvents :many
SELECT e.*, u.role FROM events e, users u 
where u.role = $1
ORDER BY start_date ASC, start_time ASC;

-- name: ListEventsByCity :many
SELECT * FROM events 
WHERE city ILIKE $1
ORDER BY start_date ASC, start_time ASC;

-- name: ListEventsByStatus :many
SELECT * FROM events 
WHERE status = $1
ORDER BY start_date ASC, start_time ASC;

-- name: UpdateEvent :one
UPDATE events
SET title = $2, slug = $3, description = $4, venue = $5, city = $6, start_date = $7, end_date = $8, start_time = $9, end_time = $10, cover_image_url = $11, status = $12, sales_start_date = $13, sales_end_date = $14, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: UpdateEventStatus :one
UPDATE events
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: UpdateEventCoverImage :one
UPDATE events
SET cover_image_url = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: GetEventByIDPublic :one
SELECT 
    id, organizer_id, title, slug, description, venue, city,
    start_date, end_date, start_time, end_time, cover_image_url,
    status, sales_start_date, sales_end_date,capacity_range, created_at, updated_at
FROM events
WHERE id = $1 AND status = 'published';

-- name: GetEventBySlugPublic :one
SELECT 
    id, organizer_id, title, slug, description, venue, city,
    start_date, end_date, start_time, end_time, cover_image_url,
    status, sales_start_date, sales_end_date, created_at, updated_at
FROM events
WHERE slug = $1 AND status = 'published';

-- name: DeleteEvent :exec
DELETE FROM events
WHERE id = $1;

-- name: DeleteEventsByOrganizer :exec
DELETE FROM events
WHERE organizer_id = $1;

-- name: PartialEventUpdate :one
UPDATE events
SET
    title = COALESCE(sqlc.narg(title), title),
    slug = COALESCE(sqlc.narg(slug), slug),
    description = COALESCE(sqlc.narg(description), description),
    venue = COALESCE(sqlc.narg(venue), venue),
    city = COALESCE(sqlc.narg(city), city),
    start_date = COALESCE(sqlc.narg(start_date), start_date),
    end_date = COALESCE(sqlc.narg(end_date), end_date),
    start_time = COALESCE(sqlc.narg(start_time), start_time),
    end_time = COALESCE(sqlc.narg(end_time), end_time),
    cover_image_url = COALESCE(sqlc.narg(cover_image_url), cover_image_url),
    status = COALESCE(sqlc.narg(status), status),
    sales_start_date = COALESCE(sqlc.narg(sales_start_date), sales_start_date),
    sales_end_date = COALESCE(sqlc.narg(sales_end_date), sales_end_date),
    capacity_range = COALESCE(sqlc.narg(capacity_range), capacity_range),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND organizer_id = $2
RETURNING *;