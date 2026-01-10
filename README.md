# StreetPulse

StreetPulse is a standalone local-business discovery app built for the FBLA 2025–2026 Coding & Programming event theme, “Byte-Sized Business Boost.” It helps community members find trusted local businesses, see real reviews, and unlock active deals.

## Core Features
- Local business directory with category, keyword, and open-now filters
- Sort by highest rated, most reviewed, or newest
- Business detail pages with photo galleries, deals, and reviews
- Favorites/bookmarks for signed-in users
- Deals hub with category and expiring-soon filters
- Human verification challenge for sign-up and review submission
- Admin dashboard for CRUD + moderation + reports
- Exportable analytics reports (CSV)

## Tech Stack
- Frontend: React + Vite + Tailwind + React Query
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Auth: JWT + bcrypt password hashing

## Local Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Copy environment variables:
   ```
   cp .env.example .env
   ```
3. Seed the database:
   ```
   npm run seed
   ```
4. Start the backend and frontend:
   ```
   npm run dev:full
   ```
5. Open the app:
   - `http://localhost:5173`

## Admin Login
Default admin credentials (from seed script):
- Email: `admin@streetpulse.local`
- Password: `StreetPulseAdmin!`

Update admin credentials in `.env` and re-run `npm run seed` to regenerate.

## Seed Data
- 25+ businesses across 9 categories
- 40+ active deals
- Sample reviews for rating distribution

## Reports & Analytics
Admin-only analytics include:
- Top businesses by average rating (min review threshold)
- Most reviewed businesses
- Favorites leaderboard
- Most redeemed/clicked deals
- Category distribution
- Weekly activity (users, reviews, favorites, deal interactions)

Each report is viewable in-app and exportable via CSV download.

## Verification / Bot Prevention
StreetPulse requires a lightweight human verification challenge:
- During account creation
- During review submission

Challenges are validated server-side and expire after 10 minutes.

## Environment Variables
- `PORT` — backend port (default `5174`)
- `JWT_SECRET` — JWT signing secret
- `ADMIN_EMAIL` — seed admin email
- `ADMIN_PASSWORD` — seed admin password
- `CORS_ORIGIN` — allowed frontend origin
- `VITE_API_URL` — frontend API base URL

## Assets & Licensing
Business images use royalty-free Unsplash URLs (see `server/seed.js`). Replace with your own assets as needed.

## Demo Script (7 minutes)
1. Open home page, show categories and active deals.
2. Search for “coffee,” filter to Food, toggle Open Now.
3. Open a business detail page, show gallery + reviews.
4. Sign up with verification challenge and submit a review.
5. Save a business to Favorites and show Favorites list.
6. Visit Deals Hub, filter by category and expiring soon, copy a coupon.
7. Admin login, open Admin Dashboard, add/edit a business and deal.
8. Open Reports, show charts and export CSV.

## Folder Structure
```
server/            Express + SQLite backend
src/               React frontend
src/Pages/          Route pages
src/Components/     UI and feature components
```

## Notes
- The app runs locally without external services.
- “Powered by AI” is intentionally omitted from the UI.
