# EventHub – Complete Platform Documentation

## All-in-One Event Management System for Cameroon

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Backend-Go_1.23-00ADD8)](https://go.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-4169E1)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-blue)](https://www.typescriptlang.org/)
[![Contributors](https://img.shields.io/badge/Contributors-3-green)](#-contributors)

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [Tech Stack](#-tech-stack)
5. [Prerequisites](#-prerequisites)
6. [Installation](#-installation)
7. [Configuration](#-configuration)
8. [Running the Application](#-running-the-application)
9. [API Documentation](#-api-documentation)
10. [Database Schema](#-database-schema)
11. [User Guide](#-user-guide)
12. [Deployment](#-deployment)
13. [Troubleshooting](#-troubleshooting)
14. [Contributing](#-contributing)
15. [Contributors](#-contributors)
16. [Contact](#-contact)

---

## 📌 Overview

**EventHub** is a complete event management platform designed specifically for the **Cameroonian market**. It allows verified organizers to create events, sell tickets via Mobile Money (MTN Momo and Orange Money), and manage check-ins using QR codes. Attendees can purchase tickets without creating an account – they simply enter their name, pay via mobile money, and download a QR code ticket.

### Why EventHub?

| Problem | EventHub Solution |
|---------|-------------------|
| Organizers don't know who bought tickets | **Required attendee name** before payment |
| Manual ticket sales via WhatsApp | **Integrated Mobile Money** + automatic QR |
| Fake tickets and ticket reuse | **HMAC-signed QR codes** that expire after first scan |
| Slow check-in at events | **QR scanner** – 2 seconds per person |
| No attendee list for follow-up | **Organizer dashboard** with complete attendee list |
| International platforms don't support local payments | **MTN Momo and Orange Money** built-in |

---

## ✨ Features

### For Organizers

| Feature | Description |
|---------|-------------|
| **Email Verification** | Secure registration with 6-digit OTP |
| **Event Creation** | Create events with title, description, date, venue, and cover image |
| **Ticket Types** | Multiple ticket types (Early Bird, VIP, Regular) with custom pricing |
| **WhatsApp Sharing** | Unique shareable links per event – copy and paste to WhatsApp |
| **Attendee List** | View all attendees with names, phone numbers, ticket types, and check-in status |
| **QR Scanner** | Webcam-based QR code scanner for check-in |
| **Sales Analytics** | Track tickets sold, revenue, and check-in rates |
| **Export Data** | Download attendee list as CSV (coming soon) |

### For Attendees

| Feature | Description |
|---------|-------------|
| **No Account Required** | Purchase tickets without creating an account |
| **Name Entry** | Enter full name (required) – appears on ticket |
| **Mobile Money Payment** | Pay with MTN Momo or Orange Money |
| **QR Code Ticket** | Download QR code as PNG image to phone gallery |
| **One-Time Use** | QR code expires immediately after first scan |
| **No App Needed** | Everything works in the browser |

### For Admin

| Feature | Description |
|---------|-------------|
| **User Management** | Verify, suspend, or delete organizer accounts |
| **Event Oversight** | View all events across the platform |
| **Transaction Monitoring** | Track all payments and handle disputes |
| **System Logs** | Audit trail of all actions |

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                               │
│                    Desktop | Tablet | Mobile (360px - 1280px+)              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS FRONTEND (Port 3000)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐  │
│  │ Public Pages │  │ Auth Pages   │  │ Organizer Dashboard               │  │
│  │ /e/[id]      │  │ /login       │  │ - Events                          │  │
│  │ /ticket/[id] │  │ /register    │  │ - Attendees                       │  │
│  │ /payment     │  │ /verify-otp  │  │ - Check-in Scanner                │  │
│  └──────────────┘  └──────────────┘  │ - Analytics                       │  │
│                                       └──────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GO BACKEND (Port 8080)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Auth Service │  │ Event Svc    │  │ Order Svc    │  │ Checkin Svc  │    │
│  │ - JWT        │  │ - CRUD       │  │ - Payment    │  │ - QR Validate│    │
│  │ - Password   │  │ - Publish    │  │ - QR Gen     │  │ - Expiry     │    │
│  │ - OTP        │  │ - Share link │  │ - Name store │  │ - Name return│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────┬─────────────────┬─────────────────┬───────────────────────────┘
              │                 │                 │
              ▼                 ▼                 ▼
┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐
│    POSTGRESQL 16    │ │  MOBILE MONEY   │ │        EMAIL SERVICE         │
│     (Database)      │ │     APIS        │ │        (Resend/SMTP)         │
│                     │ │  - MTN Momo     │ │                              │
│  - users            │ │  - Orange Money │ │  - OTP emails                │
│  - events           │ └─────────────────┘ │  - Password reset            │
│  - ticket_types     │                      └─────────────────────────────┘
│  - orders           │
│  - check_in_logs    │
│  - admin_logs       │
└─────────────────────┘
```

### Data Flow – Ticket Purchase

```
1. Attendee clicks WhatsApp link → /e/{event_id}
2. Frontend loads event details from Go backend
3. Attendee enters NAME (required) → stored in frontend state
4. Attendee selects ticket type + quantity
5. Attendee enters phone number → clicks "Pay"
6. Frontend sends {name, ticket_type, quantity, phone} to Go backend
7. Go backend creates order (status: pending) with attendee_name
8. Go backend calls Mobile Money API (MTN/Orange)
9. Attendee approves payment on phone
10. Mobile Money webhook confirms → Go backend updates order (paid)
11. Go backend generates QR code (includes name in HMAC)
12. Go backend returns QR code PNG to frontend
13. Attendee downloads QR code
14. At event: Organizer scans QR code
15. Backend validates signature + checks is_used flag
16. Returns attendee name, marks ticket as USED (expires)
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Nova preset | UI components |
| Radix UI | Latest | Accessible primitives |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Validation |
| Zustand | 4.5+ | State management |
| Axios | 1.6+ | HTTP client |
| qrcode.react | 3.1+ | QR code generation |
| react-qr-scanner | 1.0+ | Webcam QR scanning |
| Recharts | 2.10+ | Charts |
| Framer Motion | 10.16+ | Animations |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Go | 1.23+ | High-performance API |
| Gin | 1.9+ | HTTP router |
| PostgreSQL | 16.x | Relational database |
| pgx | 5.x | Database driver |
| sqlc | 1.27+ | Type-safe SQL generation |
| golang-jwt | v5 | JWT authentication |
| bcrypt | - | Password hashing |
| go-qrcode | v2 | QR code generation |

---

## 📋 Prerequisites

Before installing EventHub, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 20+ | `node --version` |
| npm | 9+ | `npm --version` |
| Go | 1.23+ | `go version` |
| PostgreSQL | 16+ | `psql --version` |
| Git | 2.x | `git --version` |
| Docker (optional) | 24+ | `docker --version` |

---

## 💻 Installation

### Clone the Repository

```bash
# Clone both frontend and backend
git clone https://github.com/eventhub/eventhub.git
cd eventhub
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Download Go dependencies
go mod download

# Create database
psql -U postgres -c "CREATE DATABASE eventhub"
psql -U postgres -c "CREATE USER eventhub WITH PASSWORD 'your_password'"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE eventhub TO eventhub"

# Run migrations
go run cmd/migrate/main.go up

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run the backend server
go run cmd/api/main.go
```

### Docker Setup (Alternative)

```bash
# Run both frontend and backend with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## ⚙️ Configuration

### Frontend Environment Variables (.env.local)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Frontend App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Redirect URLs
NEXT_PUBLIC_MTN_MOMO_REDIRECT_URL=http://localhost:3000/payment/callback
NEXT_PUBLIC_ORANGE_MONEY_REDIRECT_URL=http://localhost:3000/payment/callback

# QR Code Base URL
NEXT_PUBLIC_QR_BASE_URL=http://localhost:3000/ticket

# Feature Flags
NEXT_PUBLIC_ENABLE_ORANGE_MONEY=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Backend Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://eventhub:password@localhost:5432/eventhub
DATABASE_MAX_CONNECTIONS=25

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=168h

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@eventhub.com

# MTN Momo
MTN_MOMO_API_URL=https://sandbox.mtn.cm/momo/v1
MTN_MOMO_API_USER=your_api_user
MTN_MOMO_API_KEY=your_api_key
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key

# Orange Money
ORANGE_MONEY_API_URL=https://api.orange.com/money/v1
ORANGE_MONEY_CLIENT_ID=your_client_id
ORANGE_MONEY_CLIENT_SECRET=your_client_secret

# QR Secret (HMAC)
QR_SECRET_KEY=your-qr-hmac-secret-key

# Server
PORT=8080
ENVIRONMENT=development
```

---

## 🚀 Running the Application

### Development Mode

```bash
# Terminal 1: Backend
cd backend
go run cmd/api/main.go
# Backend running at http://localhost:8080

# Terminal 2: Frontend
cd frontend
npm run dev
# Frontend running at http://localhost:3000
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build
npm start

# Build backend
cd backend
go build -o eventhub-api ./cmd/api
./eventhub-api
```

### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: eventhub
      POSTGRES_USER: eventhub
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://eventhub:password@postgres:5432/eventhub
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1

volumes:
  postgres_data:
```

```bash
# Run with Docker Compose
docker-compose up -d
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new organizer |
| POST | `/api/v1/auth/verify-otp` | Verify email with OTP |
| POST | `/api/v1/auth/login` | Login with email/phone + password |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/logout` | Logout |

### Event Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/events/public/:id` | Public event details (no auth) |
| GET | `/api/v1/events` | Get all events for organizer |
| POST | `/api/v1/events` | Create new event |
| PUT | `/api/v1/events/:id` | Update event |
| DELETE | `/api/v1/events/:id` | Delete event |
| GET | `/api/v1/events/:id/attendees` | Get attendee list |
| GET | `/api/v1/events/:id/analytics` | Get event analytics |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders` | Create order (requires name) |
| GET | `/api/v1/orders/:id/status` | Check payment status |
| GET | `/api/v1/orders/:id/ticket` | Download QR code |

### Check-in Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/checkin` | Scan QR code (returns name) |

### Example API Calls

```bash
# Register a new organizer
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "237612345678",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "SecurePass123"
  }'

# Create an event (authenticated)
curl -X POST http://localhost:8080/api/v1/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Douala Music Fest",
    "venue_name": "Palais des Congrès",
    "city": "Douala",
    "start_date": "2025-12-01",
    "start_time": "18:00"
  }'
```

---

## 📊 Database Schema

### Core Tables

```sql
-- Users (organizers + admin)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'organizer',
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY,
    organizer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders (tickets with attendee names)
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    ticket_type_id UUID REFERENCES ticket_types(id),
    attendee_name VARCHAR(255) NOT NULL,  -- REQUIRED
    attendee_phone VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    total_amount INT NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    qr_code_hash VARCHAR(255) UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,  -- QR expires after scan
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Entity Relationship Diagram

```
users ───────< events
events ──────< ticket_types
ticket_types ─< orders
orders ───────< check_in_logs
```

---

## 👥 User Guide

### For Organizers

#### 1. Create an Account

1. Go to [EventHub](https://eventhub.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in your details (name, email, phone, password)
4. Check your email for the 6-digit verification code
5. Enter the code to verify your email

#### 2. Create an Event

1. Log in to your dashboard
2. Click **"Create New Event"**
3. Fill in event details:
   - Title (e.g., "Douala Music Fest 2025")
   - Description (optional)
   - Venue name and city
   - Date and time
   - Cover image (optional, 16:9 ratio)
4. Click **"Next"** to add ticket types
5. Add ticket types:
   - Name (e.g., "Early Bird", "VIP", "Regular")
   - Price (in XAF)
   - Quantity available
6. Click **"Create Event"**

#### 3. Share Your Event

1. From your dashboard, find your event
2. Click the **"Share"** button
3. Copy the unique event link
4. Paste the link in WhatsApp, Facebook, or email
5. Example link: `https://eventhub.com/e/550e8400-e29b-41d4-a716-446655440000`

#### 4. View Attendees

1. Click on your event in the dashboard
2. Select **"Attendees"** tab
3. See all attendees with:
   - Name
   - Phone number
   - Ticket type and quantity
   - Total paid
   - Check-in status
4. Search attendees by name using the search bar

#### 5. Scan Tickets at Event

1. Open your event in the dashboard
2. Click **"Check-in Scanner"**
3. Allow camera access when prompted
4. Position the attendee's QR code in the frame
5. System will display:
   - Attendee name
   - Ticket type
   - Check-in time
6. The QR code becomes invalid after first scan

#### 6. View Analytics

1. Click on your event
2. Select **"Analytics"** tab
3. View:
   - Total tickets sold
   - Total revenue
   - Check-in rate
   - Sales over time chart
   - Ticket type breakdown

### For Attendees

#### 1. Purchase a Ticket

1. Click the WhatsApp link shared by the organizer
2. View event details (date, venue, ticket prices)
3. **Enter your full name** (required – appears on ticket)
4. Select ticket type and quantity
5. Click **"Proceed to Payment"**
6. Enter your Mobile Money phone number
7. Select payment method (MTN Momo or Orange Money)
8. Approve the payment request on your phone
9. Wait for confirmation

#### 2. Download Your Ticket

1. After successful payment, you'll see a QR code
2. Click **"Download QR Code as PNG"**
3. Save the image to your phone gallery
4. The QR code contains your name and ticket information

#### 3. At the Event

1. Open the QR code image on your phone
2. Present it to the organizer at the entrance
3. Organizer will scan the QR code
4. The QR code becomes invalid after scanning (cannot be reused)

---

## 🚢 Deployment

### Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Deploy Backend to DigitalOcean

```bash
# Build binary for Linux
cd backend
GOOS=linux GOARCH=amd64 go build -o eventhub-api ./cmd/api

# Copy to server
scp eventhub-api root@your-server:/app/
scp .env root@your-server:/app/

# Run as systemd service
# Create /etc/systemd/system/eventhub.service
```

Example systemd service file:

```ini
[Unit]
Description=EventHub Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/app
ExecStart=/app/eventhub-api
Restart=always
EnvironmentFile=/app/.env

[Install]
WantedBy=multi-user.target
```

### Deploy Database to AWS RDS

```bash
# Create RDS instance (PostgreSQL 16)
# Use db.t4g.micro for development, db.t4g.small for production

# Set up backups (daily snapshots)
# Enable Multi-AZ for production
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| **Frontend can't connect to backend** | Check `NEXT_PUBLIC_API_URL` in .env.local |
| **Database connection failed** | Verify `DATABASE_URL` and PostgreSQL is running |
| **JWT token expired** | Refresh token should renew automatically; if not, logout and login |
| **QR code not scanning** | Ensure good lighting, hold phone steady, use 200x200px minimum |
| **Mobile Money payment fails** | Check phone number format (237XXXXXXXXX), ensure sufficient balance |
| **Email OTP not received** | Check spam folder; wait 30 seconds and resend |
| **Attendee name validation error** | Names must be 3+ characters, letters and spaces only (no numbers/symbols) |
| **QR code says "already used"** | Ticket was already scanned – cannot be used again |

### Logs

```bash
# Frontend logs
cd frontend
npm run dev -- --verbose

# Backend logs
cd backend
go run cmd/api/main.go 2>&1 | tee logs.txt

# Database logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- **Frontend**: Follow ESLint and Prettier configs
- **Backend**: Run `go fmt` and `go vet` before committing
- **Commits**: Use conventional commits format

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
go test ./...
```

---

## 👥 Contributors

We are grateful to the following contributors who made EventHub possible:

| Role | Name | GitHub | Email |
|------|------|--------|-------|
| **Frontend Lead** | **Leonie Basil** | [@leoniebasil](https://github.com/leoniebasil) | leonie.basil@eventhub.com |
| **Backend Lead** | **Fonyuy Verena** | [@fonyuyverena](https://github.com/fonyuyverena) | fonyuy.verena@eventhub.com |
| **Full Stack / QA** | **Rosine Achah** | [@rosineachah](https://github.com/rosineachah) | rosine.achah@eventhub.com |

### Meet the Team

**Leonie Basil – Frontend Lead**
- Expertise in React, Next.js, and TypeScript
- Responsible for all user interfaces, component library, and responsive design
- Ensures mobile-first experience for Cameroonian users

**Fonyuy Verena – Backend Lead**
- Expertise in Go, PostgreSQL, and API design
- Responsible for all backend services, database schema, and payment integrations
- Ensures high performance and security

**Rosine Achah – Full Stack / QA**
- Expertise in full-stack development and quality assurance
- Responsible for end-to-end testing, QR code system, and documentation
- Bridges frontend and backend integration

### Acknowledgments

Special thanks to:
- **MTN Cameroon** for Mobile Money API access
- **Orange Cameroon** for Mobile Money API access
- **University of Buea** for academic support
- All beta testers who provided valuable feedback

---

## 📞 Contact

| Purpose | Contact |
|---------|---------|
| **General Inquiries** | info@eventhub.com |
| **Technical Support** | support@eventhub.com |
| **Frontend Lead** | leonie.basil@eventhub.com |
| **Backend Lead** | fonyuy.verena@eventhub.com |
| **QA / Full Stack** | rosine.achah@eventhub.com |
| **WhatsApp Support** | +237 600 000 000 |
| **Website** | [https://eventhub.com](https://eventhub.com) |
| **GitHub** | [https://github.com/eventhub](https://github.com/eventhub) |

---

## 📊 Project Status

| Component | Status | Lead | Version |
|-----------|--------|------|---------|
| Frontend | ✅ Production Ready | Leonie Basil | 1.0.0 |
| Backend | ✅ Production Ready | Fonyuy Verena | 1.0.0 |
| Database | ✅ Production Ready | Fonyuy Verena | 1.0.0 |
| API Documentation | ✅ Complete | Rosine Achah | 1.0.0 |
| QA Testing | ✅ Complete | Rosine Achah | 1.0.0 |
| Mobile App | 🚧 In Development | Leonie Basil | 0.1.0 |
| French Language | 🚧 Planned | Team | - |

---

## 📈 Roadmap

| Feature | Lead | Target Release |
|---------|------|----------------|
| **Orange Money Integration** | Fonyuy Verena | Q3 2026 |
| **French Language Support** | Leonie Basil | Q3 2026 |
| **Export Attendee List to CSV** | Rosine Achah | Q3 2026 |
| **Email Receipts** | Fonyuy Verena | Q4 2026 |
| **Refund System** | Fonyuy Verena | Q4 2026 |
| **Mobile App (React Native)** | Leonie Basil | Q1 2026 |
| **Promo Codes / Discounts** | Rosine Achah | Q1 2026 |
| **Waitlist Feature** | Fonyuy Verena | Q2 2026 |

---

## 🎯 Quick Start Commands

```bash
# Clone repository
git clone https://github.com/eventhub/eventhub.git
cd eventhub

# Frontend (Leonie Basil - Lead)
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Backend (Fonyuy Verena - Lead) - new terminal
cd backend
go mod download
createdb eventhub
go run cmd/migrate/main.go up
cp .env.example .env
go run cmd/api/main.go

# QA Testing (Rosine Achah - Lead) - new terminal
cd frontend
npm run test
cd ../backend
go test ./...

# Open browser
open http://localhost:3000
```

---

## 🏆 Project Recognition

EventHub was developed as a professional internship project at Iknite Space under the supervision of Iknite space team. The project addresses real-world event management challenges in Cameroon and provides a complete solution for organizers and attendees.

**Project Duration:** 1 month (May 2026 - June 2026)  
**Team Size:** 3 developers  
**Lines of Code:** ~15,000  
**Git Commits:** 200+  

---

**Built with ❤️ for Cameroon's event organizers**
 
*Version: 1.0.0*  
*Maintained by: Leonie Basil, Fonyuy Verena, Rosine Achah*
