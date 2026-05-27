# EventHub – Frontend README

## Event Management Platform for Cameroon

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Nova-000000)](https://ui.shadcn.com/)

---

## 📖 Overview

**EventHub** is a complete event management platform designed specifically for the Cameroonian market. This repository contains the **frontend application** built with Next.js 15, TypeScript, and Tailwind CSS.

### Key Features

- ✅ **Organizer Dashboard** – Create, manage, and track events
- ✅ **Email Verification** – Secure organizer registration with OTP
- ✅ **WhatsApp Sharing** – Share unique event links directly to WhatsApp
- ✅ **Attendee Name Collection** – Required name input before payment
- ✅ **Mobile Money Payments** – MTN Momo and Orange Money integration
- ✅ **QR Code Tickets** – Generate and download QR codes as PNG
- ✅ **QR Scanner Check-in** – Scan tickets at event entrance
- ✅ **Attendee List** – View all attendees with names and check-in status
- ✅ **Analytics Dashboard** – Track sales and check-in rates
- ✅ **Mobile Responsive** – Works perfectly on phones, tablets, and desktops

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Backend API running (see backend documentation)

### Installation

```bash
# Clone the repository
git clone https://github.com/eventhub/eventhub-frontend.git
cd eventhub-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📦 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 15.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui (Nova preset) | Latest |
| **Component Primitives** | Radix UI | Latest |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **State Management** | Zustand | 4.5+ |
| **HTTP Client** | Axios | 1.6+ |
| **QR Code** | qrcode.react | 3.1+ |
| **QR Scanner** | react-qr-scanner | 1.0+ |
| **Charts** | Recharts | 2.10+ |
| **Animations** | Framer Motion | 10.16+ |
| **Date Handling** | date-fns | 3.x |
| **Icons** | Lucide React | 0.300+ |

---

## 📁 Project Structure

```
eventhub-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Login, register, verify-otp
│   │   ├── (dashboard)/       # Organizer and admin pages
│   │   ├── e/[eventId]/       # Public event page
│   │   └── ticket/[orderId]/  # QR code download page
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── events/            # Event-related components
│   │   ├── attendees/         # Attendee-related components
│   │   ├── analytics/         # Charts and metrics
│   │   └── layout/            # Header, sidebar, footer
│   │
│   ├── lib/                    # Utilities
│   │   ├── api.ts             # Axios API client
│   │   └── utils.ts           # Helper functions
│   │
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts       # Authentication state
│   │   └── eventStore.ts      # Events state
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   ├── constants/              # App constants
│   └── styles/                 # Global styles
│
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

---

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required - Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Required - Frontend App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - Payment Redirect URLs
NEXT_PUBLIC_MTN_MOMO_REDIRECT_URL=http://localhost:3000/payment/callback
NEXT_PUBLIC_ORANGE_MONEY_REDIRECT_URL=http://localhost:3000/payment/callback

# Optional - QR Code Base URL
NEXT_PUBLIC_QR_BASE_URL=http://localhost:3000/ticket

# Feature Flags
NEXT_PUBLIC_ENABLE_ORANGE_MONEY=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 🎨 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier

# Testing (coming soon)
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## 🧩 Key Components

### Public Event Flow (Attendee)

1. **Name Input** – Attendee enters their full name (required)
2. **Ticket Selection** – Choose ticket type and quantity
3. **Payment** – MTN Momo or Orange Money
4. **QR Code** – Download PNG ticket with QR code

### Organizer Dashboard

1. **Events List** – View all events with stats
2. **Create Event** – Multi-step form with ticket types
3. **Attendee List** – Search, filter, and view check-in status
4. **QR Scanner** – Webcam-based ticket validation
5. **Analytics** – Sales charts and check-in progress

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom navigation |
| Tablet | 640px - 1023px | 2-column grid, top navigation |
| Desktop | ≥ 1024px | 3-column grid, sidebar navigation |

---

## 🔐 Authentication Flow

```
1. User registers with email/phone/password
2. Receives 6-digit OTP via email
3. Verifies OTP on verify-otp page
4. Logs in with credentials
5. Receives JWT access + refresh tokens
6. Access token stored in localStorage
7. Refresh token automatically renews access
```

---

## 💳 Payment Integration

The frontend supports two mobile money providers:

| Provider | Color | Integration |
|----------|-------|-------------|
| MTN Momo | Yellow (#FFCC00) | REST API via backend |
| Orange Money | Orange (#FF6600) | REST API via backend |

Payment flow:
1. User enters phone number
2. Backend initiates payment request
3. User approves on phone
4. Webhook confirms payment
5. QR code generated and displayed

---

## 📄 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | User registration |
| `/auth/verify-otp` | POST | Email verification |
| `/auth/login` | POST | User login |
| `/auth/refresh` | POST | Refresh JWT token |
| `/events` | GET/POST | List/create events |
| `/events/public/:id` | GET | Public event details |
| `/events/:id/attendees` | GET | Attendee list |
| `/orders` | POST | Create order |
| `/orders/:id/ticket` | GET | Download QR ticket |
| `/checkin` | POST | Validate QR code |
| `/events/:id/analytics` | GET | Sales analytics |

---

## 🛠️ Development Tips

### Adding a New Page

```bash
# Create new route folder
mkdir src/app/(dashboard)/organizer/new-page

# Create page component
touch src/app/(dashboard)/organizer/new-page/page.tsx
```

### Adding a New Component

```bash
# Create component file
touch src/components/events/NewComponent.tsx
```

### Using shadcn/ui Components

```bash
# Add a new shadcn component
npx shadcn@latest add [component-name]

# Example: add a sheet component
npx shadcn@latest add sheet
```

### State Management with Zustand

```typescript
import { create } from 'zustand'

interface MyStore {
  data: any[]
  setData: (data: any[]) => void
}

export const useMyStore = create<MyStore>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}))
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"

```bash
# Clear Next.js cache and node_modules
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: Tailwind styles not applying

```bash
# Restart dev server and verify tailwind.config.ts
npm run dev
```

### Issue: API connection failed

```bash
# Verify backend is running
curl http://localhost:8080/api/v1/health

# Check .env.local has correct API_URL
cat .env.local
```

### Issue: QR scanner not working

```bash
# Ensure HTTPS for camera access (or use localhost)
# For production, deploy with HTTPS
```

---

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm start

# Deploy to Vercel (recommended)
vercel --prod
```

### Deployment Options

| Platform | Command | Notes |
|----------|---------|-------|
| Vercel | `vercel --prod` | Recommended, automatic HTTPS |
| Netlify | `netlify deploy --prod` | Connect GitHub repo |
| AWS Amplify | `amplify publish` | Full AWS integration |
| Self-hosted | `npm run build && npm start` | Requires Node.js server |

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 👥 Contributors

| Name | Role | Contact |
|------|------|---------|
| [Leonie Basil] | Lead Frontend Developer | [basilleonora@gmail.com] |

---

## 🔗 Related Repositories

- [EventHub Backend](https://github.com/eventhub/eventhub-backend) – Go + PostgreSQL API
- [EventHub Mobile](https://github.com/eventhub/eventhub-mobile) – React Native app (coming soon)

---

## 📞 Support

For issues, questions, or contributions:

- **Documentation**: [docs.eventhub.com](https://docs.eventhub.com)
- **Email**: support@eventhub.com
- **WhatsApp**: +237 600 000 000

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [Vercel](https://vercel.com) for hosting and deployment
- [Radix UI](https://www.radix-ui.com) for accessible primitives

---

**Built with ❤️ for Cameroon's event organizers**

---

## 📋 Quick Reference Card

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Build
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Check code style
npm run type-check   # Check TypeScript errors

# Dependencies
npm install          # Install all dependencies
npm update           # Update dependencies

# Environment
cp .env.example .env.local   # Setup environment variables
```

---
