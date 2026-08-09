# 🚗 RYDEX — Smart Vehicle Booking Platform

A production-grade, real-time vehicle booking platform inspired by Uber/Ola/Rapido — built from scratch with Next.js, MongoDB, Socket.io, and a full partner-onboarding + video-KYC pipeline.

**🔗 Live:** [rydex-eo9t.onrender.com](https://rydex-eo9t.onrender.com)

---

## ✨ Features

### For Riders
- Email/password signup with **OTP email verification**, Google login
- Book a ride — pick a vehicle type (Bike/Car/SUV/Van), search or click-to-pick pickup/drop on an interactive map
- Live fare estimate based on distance
- Real-time driver availability warning (no drivers of that type? get told before booking)
- Live driver-location tracking on a map once a ride is accepted
- **OTP-verified ride start** — share a 4-digit code with your driver, just like Rapido/Uber
- **Cash or online payment** (Razorpay), with driver-side cash confirmation
- Rate your driver (1–5 stars + comment) after a ride
- Full ride history ("My Bookings")

### For Drivers
- Multi-step **Partner Onboarding wizard**: Vehicle Details → Documents (Cloudinary upload) → Bank & Payout → Review
- **Live Video KYC** — admin-initiated video call (ZegoCloud) with in-call Approve/Reject
- **Pricing & Vehicle Image** submission, reviewed by admin before going live
- Driver dashboard with daily/weekly earnings
- Real-time ride request feed, accept/cancel/complete rides
- Live GPS location broadcast to the rider during an active ride
- Cash-payment confirmation

### For Admins
- Central dashboard: vendor stats, status breakdown (donut chart), platform-wide daily earnings (bar chart)
- **Vendor Reviews** — approve/reject partner applications with a rejection reason
- **Video KYC queue** — start a call with any driver awaiting verification
- **Pricing & Images** review — approve a driver's fare rates and vehicle photo before they go live
- Manually provisioned (no public signup) for security

### Platform-wide
- **Real-time everything** via Socket.io (ride status, live location, no polling)
- Auto-expiry for stale, unaccepted ride requests (10 min)
- Role-based navigation and dashboards (rider / driver / admin)
- Fully responsive (mobile hamburger nav, stacked layouts, touch-friendly targets)
- Smooth scroll (Lenis) + Framer Motion micro-interactions throughout

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript), custom Node server |
| Database | MongoDB Atlas + Mongoose |
| Auth | Auth.js v5 (Credentials + Google OAuth), custom OTP flow |
| Realtime | Socket.io (attached to the custom server) |
| Maps | Leaflet + OpenStreetMap (Nominatim for geocoding) — no API key needed |
| Payments | Razorpay (test mode) |
| File uploads | Cloudinary (unsigned upload preset) |
| Video KYC | ZegoCloud (UIKit Prebuilt) |
| Email | Nodemailer via Gmail App Password |
| Styling | Tailwind CSS |
| Animation | Framer Motion, Lenis (smooth scroll) |
| Charts | Recharts |
| Hosting | Render (Web Service, free tier) |

---

## 🚀 Getting Started

```bash
git clone https://github.com/rohit6522/vehicle-booking-app.git
cd vehicle-booking-app
npm install
cp .env.local.example .env.local   # fill in real values — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> ⚠️ This project uses a **custom Node server** (`server.js`) to support Socket.io — `npm run dev` and `npm run start` both run `node server.js`, not the standard `next dev`/`next start`. This means it can't be deployed to Vercel (serverless-only); Render/Railway/any VPS works fine.

### Required environment variables

```dotenv
# MongoDB
MONGODB_URI=

# Auth.js (generate with: npx auth secret)
AUTH_SECRET=
AUTH_TRUST_HOST=true          # required in production behind a reverse proxy (e.g. Render)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Gmail (OTP emails) — use a Google App Password, not your real password
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Cloudinary (unsigned upload preset)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# ZegoCloud (Video KYC)
NEXT_PUBLIC_ZEGO_APP_ID=
ZEGO_SERVER_SECRET=
NEXT_PUBLIC_ZEGO_SERVER_SECRET_TEST_ONLY=   # dev/testing only — see note below

# Razorpay (test mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

NODE_ENV=production   # set on the host; leave unset/"development" locally
```

> **Zego token note:** `generateKitTokenForTest` (used here) exposes the server secret to the client, which ZegoCloud explicitly allows for development/testing. Before a real production launch, replace this with server-side `token04` generation.

---

## 📁 Project Structure
