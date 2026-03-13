
---

# README 2 — AuraHealth Patient Portal

```md
# AuraHealth Patient Portal

AuraHealth Patient Portal is the patient-facing side of the AuraHealth system. It allows patients to log in, view their upcoming appointments, review prescriptions, monitor refill timelines, access profile information, and download printable care summaries.

## Overview

This application is designed to give patients a simple, trustworthy, healthcare-focused interface for viewing their own data.

The portal includes:

- secure patient login
- a dashboard with next-7-day summaries
- a full appointments view
- a prescriptions view with refill indicators
- a profile page with logout
- PDF export support

It is built as a separate app from the admin EMR, while sharing the same Supabase backend and many reusable UI/util files.

## Tech Stack

- **Expo**
- **React Native Web**
- **Expo Router**
- **TypeScript**
- **Supabase**
- **Expo Font**
- **Nunito**
- **Reusable shared components from the EMR**
- **Printable HTML-to-PDF export utilities**

## Portal Routes

- `/` — patient login page
- `/portal` — patient dashboard
- `/portal/appointments` — all upcoming appointments
- `/portal/prescriptions` — full prescriptions page
- `/portal/profile` — profile and logout

## Main Features

### Authentication
- email/password login
- Supabase session-based authentication
- protected `/portal/*` routes
- unauthenticated users redirected back to login

### Dashboard
- personalized greeting
- patient information summary
- appointments in the next 7 days
- refill items due in the next 7 days
- visual summary/stat cards

### Appointments
- view upcoming appointments
- filter by status
- see provider, date/time, repeat schedule, and status
- export appointments PDF

### Prescriptions
- view all prescriptions
- filter by active/inactive state
- see dosage, quantity, refill date, refill schedule, and doctor’s notes
- highlight refill urgency
- export prescriptions PDF

### Profile
- view patient info
- logout
- export patient summary PDF

## Intended User Experience

The portal was designed to feel:

- calm
- clean
- trustworthy
- easy to understand
- patient-friendly

Compared with the admin EMR, the portal shifts to a cleaner healthcare-style presentation with blue/teal accents and simplified information hierarchy.

## App Structure

### Suggested File Structure

```bash
app/
  _layout.tsx
  index.tsx
  portal/
    _layout.tsx
    index.tsx
    appointments.tsx
    prescriptions.tsx
    profile.tsx

components/
  Avatar.tsx
  Badge.tsx
  Button.tsx
  Card.tsx
  EmptyState.tsx
  Input.tsx
  LoadingSpinner.tsx

lib/
  supabase.ts
  webUtils.ts
  pdf/
    exportAppointmentsPdf.ts
    exportPrescriptionsPdf.ts
    exportPatientSummaryPdf.ts

theme.ts
