# 📅 Scheduling Platform — Calendly Clone

A full-stack scheduling/booking web application replicating Calendly's design and UX, built as an SDE Intern assignment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite, React Router v7, date-fns, Axios |
| **Backend** | Node.js 22 + Express.js |
| **Database** | PostgreSQL via Prisma ORM v5 |
| **Email** | Nodemailer (Mailtrap / Gmail / any SMTP) |
| **Styling** | Vanilla CSS (Calendly design system) |

---

## Features

### ✅ Core (All Complete)
- **Event Types** — Create, edit, soft-delete. Each has a unique public booking URL.
- **Availability Settings** — Set working days (Mon–Fri toggle), time range, and timezone.
- **Public Booking Page** — Live calendar (respects your availability), time slot picker, booking form with double-booking prevention.
- **Booking Confirmation** — Success page with full meeting details.
- **Meetings Page** — View upcoming/past meetings, cancel meetings.

### ⭐ Bonus (All Complete)
- **Responsive Design** — Mobile, tablet, and desktop layouts via CSS media queries.
- **Buffer Time** — `bufferBefore` and `bufferAfter` reduce available slots on booking calendar.
- **Custom Invitee Questions** — Add short or long text questions per event type; collected on the booking form.
- **Date-Specific Hours** — Override any date with custom hours or mark it as fully unavailable.
- **Rescheduling Flow** — Each booking has a unique reschedule link; allows picking a new slot (with conflict check).
- **Email Notifications** — Nodemailer sends styled HTML emails on booking confirmation, cancellation, and rescheduling.

---

## Database Schema

```
User
  id, name, username (unique), email, timezone

EventType
  id, userId (→User), title, slug, duration, description,
  bufferBefore, bufferAfter, active
  UNIQUE(userId, slug)

Booking
  id, eventTypeId (→EventType), inviteeName, inviteeEmail,
  notes, guestEmails, startTime, endTime,
  status (SCHEDULED|CANCELED), rescheduleToken (unique)

Availability
  id, userId (→User), dayOfWeek (0=Sun…6=Sat), startTime, endTime

DateOverride
  id, userId (→User), date (YYYY-MM-DD), isUnavailable,
  startTime?, endTime?
  UNIQUE(userId, date)

Question
  id, eventTypeId (→EventType), label, type (TEXT|TEXTAREA),
  required, order

BookingAnswer
  id, bookingId (→Booking), questionId (→Question), answer
```

---

## Project Structure

```
scalerai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── seed.js               # Sample data seeder
│   │   └── migrations/           # Auto-generated SQL migrations
│   ├── src/
│   │   ├── app.js                # Express app + route registration
│   │   ├── routes/
│   │   │   ├── eventTypes.js     # CRUD for event types
│   │   │   ├── availability.js   # Weekly schedule CRUD
│   │   │   ├── bookings.js       # Booking + slots + reschedule
│   │   │   ├── questions.js      # Custom questions CRUD
│   │   │   └── dateOverrides.js  # Date-specific override CRUD
│   │   ├── services/
│   │   │   └── email.js          # Nodemailer email templates
│   │   └── middleware/
│   │       └── errorHandler.js   # Global error handler
│   ├── .env                      # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx               # Router configuration
    │   ├── pages/
    │   │   ├── Events.jsx        # Admin: Event types dashboard
    │   │   ├── CreateEvent.jsx   # Admin: Create event + questions
    │   │   ├── EditEvent.jsx     # Admin: Edit event + questions
    │   │   ├── Availability.jsx  # Admin: Weekly schedule
    │   │   ├── DateOverrides.jsx # Admin: Date-specific overrides
    │   │   ├── Meetings.jsx      # Admin: View/cancel/reschedule
    │   │   ├── BookingPage.jsx   # Public: Book a meeting
    │   │   ├── Reschedule.jsx    # Public: Rescheduling flow
    │   │   └── Success.jsx       # Public: Confirmation page
    │   ├── components/
    │   │   ├── Navbar.jsx        # Sidebar navigation
    │   │   ├── CalendarView.jsx  # Interactive month calendar
    │   │   ├── TimeSlots.jsx     # Available time picker
    │   │   ├── BookingForm.jsx   # Invitee form + custom questions
    │   │   ├── EventCard.jsx     # Event type card
    │   │   └── EventInfo.jsx     # Booking sidebar details
    │   ├── services/
    │   │   └── api.js            # Axios API client
    │   └── styles/
    │       ├── variables.css     # CSS design tokens
    │       ├── components.css    # Component styles
    │       └── layout.css        # Page layout styles
    └── package.json
```

---

## Setup & Run Locally

### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

Create `backend/.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/calendly_clone"
PORT=5001
FRONTEND_URL=http://localhost:5173

# Email — sign up free at https://mailtrap.io for a test inbox
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@calendly-clone.com
```

> **Email is optional.** If `SMTP_USER` is left blank, emails are silently skipped and everything else works normally.

### 3. Initialize the database

```bash
cd backend

# Create tables
npx prisma db push

# Seed sample data (user, event types, availability, meetings)
node prisma/seed.js
```

### 4. Start servers

```bash
# Terminal 1 — Backend API
cd backend && npm run dev      # http://localhost:5001

# Terminal 2 — Frontend
cd frontend && npm run dev     # http://localhost:5173
```

---

## Application URLs

| URL | Description |
|---|---|
| `http://localhost:5173/` | Admin: Event types dashboard |
| `http://localhost:5173/availability` | Admin: Set working hours |
| `http://localhost:5173/date-overrides` | Admin: Date-specific overrides |
| `http://localhost:5173/meetings` | Admin: View & manage bookings |
| `http://localhost:5173/aitanish/15-min` | Public: Book 15-min meeting |
| `http://localhost:5173/aitanish/30-min` | Public: Book 30-min meeting |
| `http://localhost:5173/reschedule/:token` | Public: Reschedule via email link |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/event-types` | List event types |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Soft-delete event type |
| GET | `/api/event-types/:username/:slug` | Public lookup |
| GET | `/api/availability` | Get weekly schedule |
| PUT | `/api/availability` | Update weekly schedule |
| GET | `/api/date-overrides` | Get date overrides |
| POST | `/api/date-overrides` | Create/update date override |
| DELETE | `/api/date-overrides/:id` | Remove date override |
| GET | `/api/questions?eventTypeId=` | Get custom questions |
| POST | `/api/questions` | Create question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |
| GET | `/api/bookings` | List bookings (filter=upcoming\|past) |
| GET | `/api/bookings/slots?eventTypeId=&date=` | Available time slots |
| GET | `/api/bookings/reschedule/:token` | Get booking by reschedule token |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/:id/reschedule` | Reschedule booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

---

## Assumptions

1. **Single admin user (no auth):** A default `aitanish` user is pre-seeded. All admin operations target this user without authentication — as per assignment spec.
2. **Email is optional:** Without SMTP credentials, the app works fully; emails are silently skipped.
3. **Soft deletes:** Deleting an event type sets `active = false`, preserving all historical bookings.
4. **Timezone storage:** Availability times are plain `HH:mm` strings. Timezone labels are displayed on the booking page but UTC conversion is not enforced (single-user simplification).
5. **Reschedule token:** Each booking is created with a unique UUID token. The reschedule link can be embedded in the confirmation email or shared directly.
