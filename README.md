# RideFlow — Real-Time Vehicle Booking Platform

An Uber/Ola-style vehicle booking platform built to production-grade standards.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Database:** MongoDB + Mongoose
- **Auth:** Auth.js v5 (Credentials + Google OAuth)
- **Realtime:** Socket.io (live location, ride status)
- **Video KYC:** ZegoCloud
- **Payments:** Razorpay
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS

## Roadmap

- [x] **Phase 1 — Foundation:** Next.js setup, MongoDB connection, Auth.js (rider/driver/admin roles), role-protected routes
- [ ] **Phase 2 — Core booking flow:** ride request, fare estimate, driver matching (DB state machine, no realtime yet)
- [ ] **Phase 3 — Realtime layer:** Socket.io server, live location updates, ride status events
- [ ] **Phase 4 — Live map:** map integration showing driver movement
- [ ] **Phase 5 — Driver Video KYC:** ZegoCloud verification calls + admin approval flow
- [ ] **Phase 6 — Payments:** Razorpay order creation, verification, driver payouts
- [ ] **Phase 7 — Polish:** dashboards, notifications, motion design pass

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

Open http://localhost:3000

### Required environment variables

See `.env.local.example` for the full list. At minimum for Phase 1 you need:

- `MONGODB_URI` — a MongoDB Atlas (or local) connection string
- `AUTH_SECRET` — generate with `npx auth secret`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console (optional, only needed for Google login)

## Project Structure

```
src/
  app/
    (auth)/login/page.tsx        # login page
    (auth)/register/page.tsx     # register page (rider/driver role toggle)
    api/auth/[...nextauth]/      # Auth.js handler
    api/register/                # account creation endpoint
    page.tsx                     # landing page
  components/
    providers.tsx                # SessionProvider wrapper
  lib/
    auth.ts                      # Auth.js config
    db.ts                        # MongoDB connection helper
  models/
    User.ts                      # rider/driver/admin schema
  proxy.ts                       # route protection (formerly middleware.ts)
```

## Notes for future phases

- Socket.io needs a persistent Node process — it will NOT work on Vercel's serverless functions. Phase 3 will add a custom server (or a separate microservice) for this.
- The `User` model already has `currentLocation` with a `2dsphere` index, ready for "find nearby drivers" geo queries in Phase 2/3.
- `kycStatus` on the `User` model is ready for the Phase 5 ZegoCloud flow.
