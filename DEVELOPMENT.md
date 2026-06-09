# Development Setup Guide

## Quick Start

### Option 1: Local Development (Recommended for testing)

#### Backend Setup
```bash
cd backend
# Make sure .env is configured correctly
# LISTEN_PORT=8085
# FRONTEND_ORIGIN=http://localhost:3000

# Start the backend with Docker
make start
# or
docker-compose up
```

#### Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Make sure .env.local is configured
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8085/api/v1

# Start dev server (runs on http://localhost:3000)
npm run dev
```

### Option 2: GitHub Codespace Development

When running in GitHub Codespace, you need to use the Codespace public URLs.

#### Step 1: Expose Backend Port
1. In your Codespace terminal, the backend will be running
2. The port 8085 should be auto-exposed (you'll see a notification)
3. Copy the public URL (it will look like: `https://glorious-space-orbit-v6pjqpxpwwp3p5jg-8085.app.github.dev`)

#### Step 2: Update Frontend Configuration
Edit `frontend/.env.local` with the actual Codespace URLs:
```env
NEXT_PUBLIC_API_BASE_URL=https://<your-codespace>-8085.app.github.dev/api/v1
```

#### Step 3: Update Backend Configuration
Edit `backend/.env` with your frontend Codespace URL:
```env
LISTEN_PORT=8085
FRONTEND_ORIGIN=https://<your-codespace>-3001.app.github.dev
```

Then rebuild and restart the backend:
```bash
cd backend
go build -o bin/api ./cmd/api
# or use Docker
docker-compose up --build
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify email with OTP
- `POST /auth/login` - Login user
- `POST /auth/resend-otp` - Resend OTP to email
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info (requires auth token)

---

## Troubleshooting

### Connection Refused Error
- **Error**: `net::ERR_CONNECTION_REFUSED`
- **Cause**: Frontend is trying to connect to wrong backend URL
- **Solution**: Check `.env.local` in frontend, ensure `NEXT_PUBLIC_API_BASE_URL` is correct

### CORS Error
- **Error**: `has been blocked by CORS policy`
- **Cause**: Frontend origin not allowed by backend
- **Solution**: Update `FRONTEND_ORIGIN` in backend `.env` to match your frontend URL

### Port Already in Use
- **Error**: `bind: address already in use`
- **Solution**: 
  ```bash
  # Kill process on port 8085
  lsof -i :8085 | grep LISTEN | awk '{print $2}' | xargs kill -9
  # or change LISTEN_PORT in .env
  ```

---

## Environment Variables

### Backend (.env)
```env
LISTEN_PORT=8085
FRONTEND_ORIGIN=http://localhost:3000
DB_USER=eventhub
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=eventhub_db
DB_TLS_DISABLED=true
MIGRATIONS_PATH=./internal/db/migrations
JWT_SECRET=your_secret_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8085/api/v1
```

---

## Database Migrations

Migrations run automatically when the backend starts. To run migrations manually:

```bash
cd backend
sqlc generate  # Generate Go code from SQL queries
```

---

## Testing the Flow

1. **Register**: POST to `/auth/register`
   ```json
   {
     "full_name": "John Doe",
     "email": "john@example.com",
     "phone": "237612345678",
     "password_hash": "SecurePass123",
     "role": "organizer"
   }
   ```

2. **Verify OTP**: Check email for OTP, then POST to `/auth/verify-otp`
   ```json
   {
     "email": "john@example.com",
     "otp": "123456"
   }
   ```

3. **Login**: POST to `/auth/login`
   ```json
   {
     "email": "john@example.com",
     "password_hash": "SecurePass123"
   }
   ```

---

## Need Help?

Check the error messages carefully. Most issues are related to:
1. Wrong backend URL in frontend
2. Wrong frontend origin in backend
3. Backend not running
4. Port conflicts
