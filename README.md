# 🦷 DentalPro-Suite - Dental Hospital Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=flat\&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat\&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat\&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat\&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

WaveNet Care is a robust, production-grade dental management system engineered to tackle inefficiencies in clinical operations. Built using Next.js 15, React 19, and TypeScript 5, it delivers real-time patient queueing, telephony, appointment scheduling, and admin dashboards. The platform streamlines daily workflows, cuts wait times, and enhances patient experience.

## Key Features

### 🚦 Queue Management

* Live Kanban-style board with drag-and-drop ticket movement
* Intelligent ETA computation based on queue position, dentist availability, and procedure length
* SLA thresholds with visual alerts for urgent/emergency care
* Multi-lane routing and status-driven board (waiting, in-treatment, completed)
* Optimistic UI updates with automatic rollback on failure

### 📞 VoIP Telephony System

* WebRTC-based calling via SIP.js with full call lifecycle management
* 15+ telephony actions: dial, hold, transfer, DTMF, mute, etc.
* Device management (mic/speaker/ringer)
* Singleton pattern ensures one live session
* Zustand-driven global state store
* Development-ready with a mock provider

### 🏥 Patient Check-In

* Walk-in & appointment-based digital desk
* Kiosk-mode compliant with WCAG 2.1 AA
* Auto-ticket generation with priority tagging
* Visit-type based flow: consultation, treatment, emergency

### 📅 Appointment Scheduler

* FullCalendar integration with drag-and-drop rescheduling
* Dentist availability sync, conflict resolution, and duration-based scheduling
* Status flows: scheduled → in-progress → completed
* Email/SMS hooks ready for Twilio/SendGrid

### 🧠 Dentist & Procedure Admin

* Provider profiles with specializations
* Procedure catalog with CPT codes and duration tracking
* Room scheduling with availability management

### 📊 Admin Dashboard

* Metrics: Total Patients, Active Dentists, Daily Appointments
* Sections for Patients, Appointments, Procedures, Emergency
* Responsive UI with professional UX standards

## Stack Summary

### Frontend

* **Next.js 15** (App Router, Server Components, Streaming SSR)
* **React 19** with concurrent rendering
* **Tailwind CSS 4** for styling
* **Lucide React**, **ApexCharts**, **FullCalendar** for visuals

### State Management

* **TanStack React Query 5** for server state
* **Zustand** for UI & telephony
* **Context API** for global theme/auth/patient state

### Forms & Validation

* **React Hook Form** with **Zod** for schema validation

### Dev Experience

* **MSW 2.x** for API mocking
* **ESLint 9** & **Prettier**
* **Strict TypeScript** mode with 100+ interfaces

### Real-Time Features

* Queue and appointment polling
* Mock WebSocket for simulated events
* Optimistic updates for fluid interactions

## Architecture

The project adheres to a clean architecture model:

* **Presentation Layer**: Pages and components for UI
* **State Layer**: Zustand, React Query, Context
* **Logic Layer**: Domain hooks (e.g., useQueue, useWebphone)
* **Data Layer**: RESTful API routes and MSW handlers
* **Utility Layer**: ETA engine, analytics, validators

### Design Patterns

* **Provider Abstraction**: Swappable telephony backends
* **Singleton**: WebRTC provider instance
* **Optimistic UI**: With rollback using React Query

## File Structure Highlights

```
src/
├── app/ (Next.js App Router)
│   ├── (admin)/dashboard, queue, checkin
│   ├── (auth)/login
│   └── comms/phone
├── components/
│   ├── webphone/, ui/, common/
├── lib/
│   ├── hooks/, telephony/, domain.ts, eta.ts
├── context/
│   ├── AuthContext, ToastContext, ThemeContext
├── mocks/ (MSW handlers & data)
├── types/ (TS types)
```

## Setup Guide

### Prerequisites

* Node.js 18+
* npm 9+ or yarn 1.22+
* Git

### Getting Started

```bash
git clone https://github.com/yourusername/wavenet-care-admin.git
cd wavenet-care-admin
npm install
cp .env.production .env.local
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Vercel

```bash
npm i -g vercel
vercel
```

## Performance & Security

* Image optimization, code splitting, Brotli compression
* CSP, HSTS, and frame protection headers
* Secure auth context (recommend httpOnly cookies for prod)
* Zod schema validation to prevent malformed input

## Deployment Notes

Add these to `.env.local`:

```
NEXT_PUBLIC_APP_NAME=WaveNet Care
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MSW_ENABLED=true
NEXT_PUBLIC_API_URL=https://api.wavenetcare.com
```

## Contact

**GitHub**: [@yourusername](https://github.com/yourusername)
**Portfolio**: [your-portfolio.com](https://your-portfolio.com)
**LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

<div align="center">
  <strong>Built with precision, performance, and passion for production</strong>
</div>
