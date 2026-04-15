# 📅 Scheduling Platform — Calendly Clone

A full-stack scheduling/booking web application replicating Calendly's design and UX.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite, React Router v7, date-fns, Axios |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL via Prisma ORM |
| **Styling** | Vanilla CSS (Calendly design system) |

---

## Features

### ✅ Core (Must Have)
- **Event Types Management** — Create, edit, soft-delete event types with name, duration, slug, description, and buffer times
- **Unique Public Booking Link** — e.g. `http://localhost:5173/aitanish/30-min`
- **Availability Settings** — Set per-day working hours, enable/disable weekdays, set timezone
- **Public Booking Page** — Month calendar (respects availability), time slot picker, double-booking prevention
- **Booking Form** — Collect name, email, optional guest emails, notes
- **Booking Confirmation** — Success page with full meeting details
- **Meetings Page** — View upcoming / past meetings, cancel a meeting

### ⭐ Bonus
- Responsive design (mobile, tablet, desktop)
- Buffer time before/after meetings
- Guest email field on booking form
- Notes field on booking form
- Skeleton loading states
- Calendar disables unavailable weekdays
- Soft-delete for event types (preserves bookings)

---

## Database Schema

```
User
  id, name, username (unique), email, timezone, createdAt

EventType
  id, userId (FK→User), title, slug, duration, description,
  bufferBefore, bufferAfter, active, createdAt, updatedAt
  UNIQUE(userId, slug)

Booking
  id, eventTypeId (FK→EventType), inviteeName, inviteeEmail,
  notes, guestEmails, startTime, endTime, status (SCHEDULED|CANCELED),
  createdAt, updatedAt

Availability
  id, userId (FK→User), dayOfWeek (0=Sun…6=Sat), startTime, endTime
```

---

## Setup & Run Locally

### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally

### 1. Clone & install

```bash
git clone <repo-url>
cd scalerai

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/calendly_clone"
PORT=5001
```

### 3. Set up the database

```bash
cd backend

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed sample data
node prisma/seed.js
```

This seeds:
- Default user: `aitanish` (Tanish Singh)
- 2 event types: 15-min, 30-min
- Availability: Mon–Fri, 9 AM–5 PM (IST)
- 2 sample bookings (1 past, 1 upcoming)

### 4. Start the servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # runs on http://localhost:5001

# Terminal 2 — Frontend
cd frontend
npm run dev      # runs on http://localhost:5173
```

### 5. Explore

| URL | Description |
|---|---|
| `http://localhost:5173/` | Admin dashboard (event types) |
| `http://localhost:5173/availability` | Set working hours |
| `http://localhost:5173/meetings` | View/cancel meetings |
| `http://localhost:5173/aitanish/30-min` | Public booking page |
| `http://localhost:5001/api/health` | API health check |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/event-types` | List all event types |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Soft-delete event type |
| GET | `/api/event-types/:username/:slug` | Public event type lookup |
| GET | `/api/availability` | Get weekly schedule |
| PUT | `/api/availability` | Update weekly schedule |
| GET | `/api/bookings?filter=upcoming\|past` | List bookings |
| GET | `/api/bookings/slots?eventTypeId=&date=` | Available time slots |
| POST | `/api/bookings` | Create booking (with double-booking prevention) |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

---

## Assumptions

1. **Single user (no auth)** — A default user `aitanish` is pre-seeded. The admin dashboard shows their data automatically without login.
2. **No email service** — Booking confirmation is displayed on-screen only.
3. **Timezone storage** — Availability times are stored as plain strings (HH:mm). The UI displays the user's configured timezone label.
4. **Soft delete** — Deleting an event type marks it `active: false`, preserving existing bookings.
5. **Buffer time** — `bufferAfter` is added to the slot step, shrinking the number of available slots for the day.
