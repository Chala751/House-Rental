# StayScape House Rental Platform

StayScape is a full-stack house rental platform built with Next.js (App Router), MongoDB, and JWT cookie authentication.

The app supports three user roles:
- `renter`: browse homes, book stays, review completed stays
- `host`: create listings, see upcoming guests, manage listings
- `both` (admin-style): platform dashboard, user management, global stats

## What This Project Does

### Public/Home Experience
- Dynamic hero and stats section on homepage
- Live platform metrics:
  - verified stays
  - cities covered
  - average rating
- Featured listings grid
- Renter testimonials with star ratings and profile images
- Contact footer section

### Authentication & Profiles
- Signup/login/logout with cookie-based JWT auth
- Role-based dashboard routing
- Profile image upload (ImageKit) from dashboard header
- Shared authenticated header across dashboards

### Renter Features
- Browse and book properties
- View upcoming stays and booking history
- Rate and review completed stays
- One review per completed booking

### Host Features
- Create property listings with images
- View host reputation (ratings + recent reviews)
- View upcoming guests/events for owned properties
- Delete owned property with confirmation modal
- Property delete is blocked if active bookings exist

### Admin (`both`) Features
- Platform control dashboard
- View all users/properties/bookings
- User management with profile avatars
- Delete user with confirmation modal

## Tech Stack
- `Next.js 16` (App Router)
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `MongoDB + Mongoose`
- `ImageKit` (image uploads)
- `JWT + httpOnly cookies` (custom auth)

## Environment Variables

Create `.env` with:

```env
MONGODB_URI=...
JWT_SECRET=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Folder Structure

```txt
app/
  api/
    auth/                  # login, signup, me, logout, profile-image, nextauth
    admin/                 # admin user APIs
    bookings/              # renter booking APIs
    properties/            # create/list/get/delete property APIs
    reviews/               # create review API
  auth/
    login/
    signup/
  dashboard/
    admin/                 # admin-only dashboard route
    page.tsx               # role-based dashboard entry
  properties/
    [id]/                  # property details page
  layout.tsx               # shared app shell/header/footer
  page.tsx                 # homepage

components/
  dashboard/               # renter/host/admin dashboards + managers
  layout/                  # header controls, avatar, logout
  properties/              # property grid, booking panel, create form

hooks/
  useAuth.ts               # client auth helper

lib/
  auth.ts                  # JWT create/verify
  mongodb.ts               # DB connection
  imagekit.ts              # ImageKit client

models/
  User.ts
  Property.ts
  Booking.ts
  Review.ts

middleware.ts              # route protection for /dashboard
```

## Notes
- Favicon and header branding use project logo assets.
- Authenticated routes are protected by cookie checks and role checks.
- Property/review/admin actions are validated server-side.
