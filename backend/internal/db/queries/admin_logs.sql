-- name: ListAdminLogs :many
SELECT 
    al.id,
    al.admin_id,
    al.action,
    al.target_type,
    al.target_id,
    al.details,
    al.ip_address,
    al.created_at,
    u.full_name AS admin_name,
    u.email AS admin_email
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
WHERE ($1 = '' OR al.action ILIKE '%' || $1 || '%' OR u.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
  AND ($2 = '' OR al.action = $2)
  AND ($3 = '' OR al.target_type = $3)
ORDER BY al.created_at DESC
LIMIT $4 OFFSET $5;

-- name: CountAdminLogs :one
SELECT COUNT(*) FROM admin_logs al
JOIN users u ON al.admin_id = u.id
WHERE ($1 = '' OR al.action ILIKE '%' || $1 || '%' OR u.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
  AND ($2 = '' OR al.action = $2)
  AND ($3 = '' OR al.target_type = $3);
