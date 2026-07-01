<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:backend-api-rules -->
# Backend API (Gin) rules

## Base URL
`http://localhost:8085/api/v1` (configured via `NEXT_PUBLIC_API_URL`)

## Auth
- Login: `POST /auth/login` with `{ email, password }` → `{ access_token, refresh_token, user }`
- Register: `POST /auth/register` with `{ full_name, email, phone_number, password, role (organizer|admin) }`
- Logout: `POST /auth/logout` with `{ refresh_token }` in body
- Refresh: `POST /auth/refresh-token` with `{ refresh_token }`
- Forgot password: `POST /auth/forgot-password` with `{ email }`
- Reset password: `POST /auth/reset-password` with `{ email, otp, password_hash }`
- Resend OTP: `POST /auth/resend-otp` with `{ email }`
- Get current user: `GET /auth/me` (requires Bearer token)

## Events (Organizer)
- List: `GET /Organization/events` with query params `page`, `limit`, `search`, `status` — response is an **array** directly (NOT `{ events, total }`)
- Get one: `GET /Organization/:id` — response is the **object directly** (NOT `{ event: ... }`)
- Create: `POST /events` with JSON body `{ title, slug, description, venue, city, start_date, start_time, end_time, capacity_range }` — slug is required, generate from title
- Update: `PATCH /events/:id` with JSON body (snake_case keys, optional fields). NOT multipart/form-data
- Delete: `DELETE /events/:id`
- Publish: `PATCH /events/:id/publish`
- Unpublish: `PATCH /events/:id/unpublish`

## Ticket Types
- List: `GET /events/:id/ticket-types` — response is an **array** directly
- Create: `POST /events/:id/ticket-types` with JSON `{ name, price, quantity_available }`
- Update: `PATCH /events/:id/ticket-types/:ticket_id` with JSON `{ name, price, quantity_available }`
- Delete: `DELETE /events/:id/ticket-types/:ticket_id`

## Response patterns
- All event/ticket list endpoints return a **plain array** in `response.data`
- Single event endpoints return the **object directly** as `response.data`
- Errors come as `{ error: "message" }` in `response.data`
- Backend uses `ShouldBindJSON` — all requests must be JSON, NOT FormData
<!-- END:backend-api-rules -->
