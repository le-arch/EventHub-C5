<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:current-session-summary -->
## Current Session — Dark Mode & Payment Flow Fixes

### Completed
- **PaymentModal rewrite**: Full payment simulation flow — explicit method selection (no default), USSD dial code screen, PIN entry (4-digit MTN / 6-digit Orange), animated processing with progress messages, QR code on success. All hardcoded colors replaced with CSS variable classes. QR code rendered via `qrcode.react`.
- **Dark mode form fields**: EventForm native `<select>` now has `dark:bg-input/30 dark:border-input`. All `text-gray-500` → `text-muted-foreground` across EventForm, EventCard, EditEventPage, PublicEventPage. `bg-white` → `bg-card`, `border-slate-100` → `border-border`.
- **EventCard dark mode**: `text-gray-500` → `text-muted-foreground` (dates, venue, stats), `bg-white` → `bg-popover` on dropdown.
- **Edit event page dark mode**: TabsList uses `bg-card border-border`, triggers use `data-active:` with CSS variable colors. SelectTrigger/Content `bg-white` removed (defaults to component theme). Form containers use `bg-card border-border`.
- **Analytics tab fix**: Changed `data-[state=active]` to `data-active` to match Radix v4 attribute format.
- **Dashboard dropdown**: Added `sideOffset={8}` to fix positioning glitch during sidebar animation.
- **Public event page dark mode**: Replaced all hardcoded `bg-slate-50`, `text-slate-900`, `bg-white`, `border-purple-100` with theme-aware `bg-background`, `text-foreground`, `bg-card`, `border-border`.
- **Ticket sold count**: After payment success, refetch `/events/public/:id/ticket-types` to update remaining counts.
- **Auto-unpublish on edit save**: Published events auto-unpublish before saving changes (from prior session).

### Key Patterns
- Use `text-muted-foreground`, `bg-card`, `bg-popover`, `border-border`, `bg-background` — never hardcoded gray/white/slate/purple colors
- Radix v4 uses `data-active` not `data-[state=active]`
- Always use `bg-destructive/10 text-destructive` for error states (not `bg-red-50 text-red-900`)
- Payment flow: form → USSD → PIN → processing → success+QR
<!-- END:current-session-summary -->

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
