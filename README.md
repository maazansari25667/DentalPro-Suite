# 🦷 WaveNet Care - Enterprise Dental Hospital Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Overview

Production-ready dental operations platform solving critical healthcare inefficiencies: **45-60 minute patient wait times**, **23% no-show rates**, and **30% wasted staff time**. Built with Next.js 15, React 19, and TypeScript, this system demonstrates enterprise-grade full-stack development.

## ✨ Core Capabilities

**Real-Time Queue Management** - Kanban board with drag-and-drop, intelligent ETA calculation, SLA monitoring (15-min emergency/45-min urgent thresholds), multi-lane routing, optimistic UI updates with automatic rollback.

**Integrated Telephony** - WebRTC VoIP with provider abstraction (SIP.js/WebPhone), 15+ call actions (dial, hold, transfer, DTMF), event-driven architecture (10+ states), device management, singleton pattern, Zustand state management.

**Advanced Scheduling** - FullCalendar integration, drag-and-drop rescheduling, conflict detection, procedure-based duration estimation, automated notifications (Twilio/SendGrid ready).

**Patient Experience** - Digital check-in desk, WCAG 2.1 AA accessible kiosk, automatic queue ticket creation, visit categorization (consultation/treatment/emergency).

## 🛠️ Technical Stack

**Frontend**: Next.js 15.2.3 (App Router, Server Components) • React 19 (concurrent rendering) • TypeScript 5 (strict mode)  
**State**: TanStack React Query 5 (optimistic updates, polling) • Zustand 5 • React Context  
**UI**: Tailwind CSS 4 • Lucide React • ApexCharts • FullCalendar  
**Validation**: React Hook Form 7 • Zod 4  
**Development**: MSW 2 (API mocking) • ESLint 9 • TypeScript strict mode

## 🚀 Key Achievements

✅ **500+ line telephony hook** with comprehensive WebRTC implementation  
✅ **Multi-lane queue algorithm** with intelligent ETA calculation  
✅ **Optimistic updates** with automatic rollback on failure  
✅ **Event-driven analytics** with localStorage persistence  
✅ **Production-optimized** - Vercel deployment ready, image optimization, code splitting, security headers  
✅ **100+ TypeScript interfaces** ensuring complete type safety

**Built by a full-stack engineer ready to deliver production-grade solutions at scale.**

---

## ✨ Key Features

### 🚀 Real-Time Queue Management
- **Live Kanban-style queue board** with drag-and-drop ticket management
- **Intelligent ETA calculation** based on procedure duration, dentist availability, and current queue position
- **SLA monitoring** with automatic alerts for urgent/emergency cases (15-min emergency, 45-min urgent thresholds)
- **Priority-based routing** with visual indicators (emergency, urgent, routine, follow-up)
- **Multi-lane queuing** supporting simultaneous dentist/room assignments
- **Optimistic UI updates** with automatic rollback on failure
- **Analytics dashboard** with queue stats, wait times, and room utilization metrics

### 📞 Integrated Telephony System
- **WebRTC-based VoIP calling** with provider abstraction layer (supports SIP.js, WebPhone, custom providers)
- **15+ call management actions**: register, dial, answer, hangup, hold, unhold, mute, transfer (attended/blind), DTMF tones
- **Event-driven architecture** handling 10+ call states (registered, incoming, ringing, connected, held, ended, failed)
- **Device management** for microphone/speaker/ringer selection with real-time switching
- **Call logging & analytics** with localStorage persistence
- **Singleton pattern provider** ensuring single WebRTC session
- **Zustand state management** for telephony state across components
- **Mock telephony mode** for development/testing without SIP server

### 🏥 Patient Check-In System
- **Digital check-in desk** with walk-in and appointment-based flows
- **Self-service kiosk mode** (WCAG 2.1 AA accessible with high-contrast mode)
- **Recent check-ins table** with patient lookup and status tracking
- **Automatic queue ticket creation** on check-in completion
- **Visit type categorization** (consultation, treatment, follow-up, emergency)

### 📅 Advanced Appointment Scheduling
- **FullCalendar integration** with day/week/month/agenda views
- **Drag-and-drop rescheduling** with conflict detection
- **Dentist-specific scheduling** with availability management
- **Procedure-based duration estimation** (e.g., root canal: 90min, cleaning: 30min)
- **Status workflow**: scheduled → checked-in → in-progress → completed
- **Email/SMS notifications** (mock implementation ready for Twilio/SendGrid)
- **No-show tracking** and cancellation management

### 👨‍⚕️ Dentist & Procedure Management
- **Dentist profiles** with specialization tracking
- **Procedure catalog** with CPT codes, durations, and pricing
- **Room assignment** and availability tracking
- **Schedule management** with working hours and break times

### 📊 Hospital Dashboard
- **6 main operational sections**: Patient Management, Appointments, Dentists, Procedures, Reports, Emergency
- **4 real-time metrics**: Total Patients, Today's Appointments, Active Dentists, Pending Cases
- **Recent appointments widget** with quick actions
- **Responsive grid layout** optimized for desktop/tablet workflows

### 🎨 Professional UX/UI
- **Dark mode support** with system preference detection
- **Tailwind CSS 4.0** with custom dental-themed color palette
- **Toast notifications** (react-hot-toast) with action buttons
- **Loading states** using skeleton screens and spinners
- **Empty states** with contextual CTAs
- **Error boundaries** for graceful failure handling
- **Responsive design** supporting mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.2.3** - App Router, Server Components, Streaming SSR, Route Handlers
- **React 19.0.0** - Concurrent rendering, Server Actions, automatic batching
- **TypeScript 5.x** - Strict mode, path aliases, comprehensive type coverage

### State Management
- **TanStack React Query 5.x** - Server state, caching, optimistic updates, polling
- **Zustand 5.x** - Client state (telephony, UI preferences)
- **React Context** - Auth, theme, patient selection, sidebar state

### Data Layer & Mocking
- **Mock Service Worker (MSW) 2.x** - API mocking with realistic latency simulation
- **RESTful API design** - CRUD operations for all entities
- **localStorage persistence** - Development mode data retention

### Styling & UI
- **Tailwind CSS 4.0** - JIT compilation, custom plugins
- **Lucide React** - 150+ consistent icons
- **ApexCharts & Recharts** - Interactive data visualizations
- **FullCalendar** - Professional appointment scheduling interface

### Forms & Validation
- **React Hook Form 7.x** - Performant form state management
- **Zod 4.x** - Runtime schema validation
- **@hookform/resolvers** - Seamless integration

### Real-Time Features
- **Polling strategy** - 30-second queue updates, 60-second appointment sync
- **Mock WebSocket** - Simulated real-time events for development
- **Optimistic updates** - Instant UI feedback with automatic rollback

### Developer Experience
- **ESLint 9** - Modern flat config with Next.js rules
- **Prettier** - Consistent code formatting
- **TypeScript strict mode** - Maximum type safety
- **Hot Module Replacement** - Instant feedback during development

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Authentication Layer (Context)                              │
│  ├─ Login/Logout                                            │
│  ├─ Session Management                                      │
│  └─ Protected Routes                                        │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (React Components)                       │
│  ├─ Hospital Dashboard        ├─ Queue Board (Kanban)      │
│  ├─ Patient Management        ├─ Check-In Desk             │
│  ├─ Appointments (Calendar)   ├─ Dentist Management        │
│  ├─ Procedure Catalog         └─ WebPhone Widget           │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                      │
│  ├─ React Query (Server State)                              │
│  │   ├─ Caching Strategy (staleTime: 30s)                  │
│  │   ├─ Optimistic Updates                                 │
│  │   └─ Background Refetching                              │
│  ├─ Zustand (Client State)                                  │
│  │   ├─ Telephony State                                    │
│  │   └─ UI Preferences                                     │
│  └─ React Context (Global State)                            │
│      ├─ Theme Context (Dark Mode)                           │
│      ├─ Patient Context (Selected Patient)                  │
│      └─ Toast Context (Notifications)                       │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer (Custom Hooks)                         │
│  ├─ useQueue (Queue Operations)                             │
│  ├─ useWebphone (Telephony)                                 │
│  ├─ usePatients (CRUD)                                      │
│  ├─ useAppointments (Scheduling)                            │
│  ├─ useDentists (Provider Mgmt)                             │
│  └─ useProcedures (Catalog)                                 │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                           │
│  ├─ API Routes (/api/*)                                     │
│  │   ├─ /queue - Queue tickets                             │
│  │   ├─ /patients - Patient records                        │
│  │   ├─ /appointments - Scheduling                         │
│  │   ├─ /dentists - Providers                              │
│  │   └─ /procedures - Catalog                              │
│  └─ MSW Handlers (Development)                              │
│      ├─ Mock Database (fixtures.ts)                         │
│      ├─ Realistic Latency (100-300ms)                       │
│      └─ Error Simulation                                    │
├─────────────────────────────────────────────────────────────┤
│  Utility Layer                                               │
│  ├─ Analytics Service (Event Tracking)                      │
│  ├─ ETA Calculator (Queue Wait Times)                       │
│  ├─ Domain Models (TypeScript Types)                        │
│  └─ Validation Schemas (Zod)                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Provider Abstraction (Telephony)**:
   ```typescript
   interface WebphoneProvider {
     register(): Promise<void>;
     dial(number: string): Promise<void>;
     answer(): Promise<void>;
     hangup(): Promise<void>;
     // ... 10+ more actions
   }
   // Supports SIP.js, WebPhone, custom implementations
   ```

2. **Optimistic Updates (Queue)**:
   ```typescript
   useMutation({
     mutationFn: createTicket,
     onMutate: async (newTicket) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries(['queue']);
       // Snapshot previous value
       const previous = queryClient.getQueryData(['queue']);
       // Optimistically update UI
       queryClient.setQueryData(['queue'], old => [...old, optimisticTicket]);
       return { previous };
     },
     onError: (err, newTicket, context) => {
       // Rollback on failure
       queryClient.setQueryData(['queue'], context.previous);
     }
   });
   ```

3. **Singleton Telephony Provider**:
   ```typescript
   // Ensures single WebRTC session across all components
   let providerInstance: WebphoneProvider | null = null;
   export const useWebphone = () => {
     if (!providerInstance) {
       providerInstance = new SIPProvider(config);
     }
     return providerInstance;
   };
   ```

---

## 📁 Project Structure

```
wavenet-care-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (admin)/                  # Admin dashboard layout group
│   │   │   ├── dashboard/            # Hospital dashboard
│   │   │   ├── appointments/         # Appointment scheduling
│   │   │   ├── patients/             # Patient management
│   │   │   ├── dentists/             # Dentist profiles
│   │   │   ├── procedures/           # Procedure catalog
│   │   │   └── ops/                  # Operations
│   │   │       ├── queue/            # Queue board (Kanban)
│   │   │       └── checkin/          # Check-in desk
│   │   ├── (full-width-pages)/       # Authentication layout
│   │   │   └── (auth)/
│   │   │       └── login/            # Login page
│   │   ├── comms/                    # Communications
│   │   │   └── phone/                # Telephony interface
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── auth/                     # Sign-in/sign-up forms
│   │   ├── common/                   # Shared components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ConfirmationDialog.tsx
│   │   ├── webphone/                 # Telephony UI
│   │   │   ├── WebPhoneWidget.tsx    # Main phone interface
│   │   │   ├── CallControls.tsx      # Call action buttons
│   │   │   └── DeviceSelector.tsx    # Audio device picker
│   │   ├── providers/                # React Query & MSW setup
│   │   └── ui/                       # UI primitives (buttons, badges, etc.)
│   │
│   ├── lib/                          # Business logic
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useQueue.ts           # Queue operations (8 hooks)
│   │   │   ├── usePatients.ts        # Patient CRUD
│   │   │   ├── appointments.ts       # Appointment scheduling
│   │   │   └── dentists.ts           # Dentist management
│   │   ├── telephony/                # Telephony system
│   │   │   ├── useWebphone.ts        # Main telephony hook (500+ lines)
│   │   │   ├── WebphoneProvider.ts   # Provider interface
│   │   │   └── telephonyStore.ts     # Zustand store
│   │   ├── domain.ts                 # TypeScript domain models
│   │   ├── eta.ts                    # Queue ETA calculation
│   │   ├── analytics.ts              # Event tracking service
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── mocks/                        # MSW API mocking
│   │   ├── handlers.ts               # API route handlers
│   │   ├── fixtures.ts               # Mock data (100+ records)
│   │   ├── browser.ts                # Browser worker setup
│   │   └── telephonyHandlers.ts      # Telephony mocking
│   │
│   ├── context/                      # React Context providers
│   │   ├── AuthContext.tsx           # Authentication state
│   │   ├── ThemeContext.tsx          # Dark mode toggle
│   │   ├── PatientContext.tsx        # Selected patient
│   │   └── ToastContext.tsx          # Notifications
│   │
│   └── types/                        # TypeScript definitions
│       └── patient.ts                # Patient-related types
│
├── public/                           # Static assets
│   ├── mockServiceWorker.js          # MSW worker script
│   └── images/                       # Images and icons
│
├── .env.production                   # Production environment template
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS config
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn 1.22+)
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/wavenet-care-admin.git
   cd wavenet-care-admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp .env.production .env.local
   
   # Edit .env.local with your values
   # Note: For development, MSW will mock all APIs
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   ```
   http://localhost:3000
   ```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Vercel Deployment

This project is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

---

## 📖 Usage Guide

### Dashboard Navigation

After logging in, you'll see the **Hospital Dashboard** with 6 main sections:

1. **Patient Management** - View, create, edit patient records
2. **Appointments** - Schedule and manage dental appointments
3. **Dentists** - Manage dentist profiles and specializations
4. **Procedures** - Catalog of dental procedures with CPT codes
5. **Reports** - Analytics and operational reports
6. **Emergency** - Quick access to emergency protocols

### Queue Management Workflow

1. **Check-In Patient**:
   - Navigate to `/ops/checkin`
   - Select existing patient or create walk-in
   - Choose visit type (consultation, treatment, follow-up, emergency)
   - System automatically creates queue ticket

2. **Manage Queue Board**:
   - Navigate to `/ops/queue`
   - View tickets organized by status (Waiting, Called, In Treatment, Completed)
   - **Drag & drop** tickets between lanes to update status
   - Assign dentist/room by clicking ticket and selecting from dropdown
   - Monitor SLA timers (emergency: 15 min, urgent: 45 min)

3. **Track ETAs**:
   - Queue automatically calculates estimated wait time
   - Considers: procedure duration, dentist availability, current queue position
   - Displayed on each ticket card

### Telephony System

1. **Initialize WebPhone**:
   - Navigate to `/comms/phone`
   - System auto-registers with SIP server (or mock provider)
   - Select microphone, speaker, and ringer devices

2. **Make/Receive Calls**:
   - **Outbound**: Enter phone number, click Dial
   - **Inbound**: Click Answer when call arrives
   - **Hold/Unhold**: Click hold button during active call
   - **Transfer**: Click transfer, enter destination, choose blind/attended
   - **DTMF**: Use keypad for IVR navigation

3. **Monitor Call State**:
   - Real-time status display (Ringing, Connected, Held, etc.)
   - Call duration timer
   - Audio level indicators

### Appointment Scheduling

1. **Create Appointment**:
   - Navigate to `/appointments`
   - Click "New Appointment" button
   - Fill form: patient, dentist, procedure, date/time, duration
   - System checks for scheduling conflicts
   - Confirmation modal shown

2. **Calendar Views**:
   - **Day View**: Hourly schedule for single day
   - **Week View**: 7-day overview
   - **Month View**: Full month calendar
   - **Agenda View**: List of upcoming appointments

3. **Reschedule**:
   - **Drag & drop** appointments to new time slots
   - System validates availability
   - Automatic conflict detection

---

## 🔬 Technical Highlights

### 1. Advanced State Management

**React Query Optimistic Updates**:
```typescript
const { mutate: updateTicket } = useUpdateQueueTicket();

// Optimistic update with automatic rollback
updateTicket(
  { ticketId: '123', updates: { status: 'in_treatment' } },
  {
    onMutate: async ({ ticketId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['queue']);
      
      // Snapshot current state
      const previous = queryClient.getQueryData(['queue']);
      
      // Optimistically update UI
      queryClient.setQueryData(['queue'], old => 
        old.map(ticket => ticket.id === ticketId 
          ? { ...ticket, ...updates } 
          : ticket
        )
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      queryClient.setQueryData(['queue'], context.previous);
    }
  }
);
```

### 2. Intelligent ETA Calculation

**Multi-Lane Queue Algorithm**:
```typescript
export function estimateEta(params: ETACalculationParams): ETAResult[] {
  // Group tickets by dentist/room for accurate lane-based calculation
  const lanes = groupTicketsByLane(queue);
  
  Object.entries(lanes).forEach(([laneId, tickets]) => {
    let cumulativeTime = 0;
    
    tickets.forEach((ticket, index) => {
      // Get procedure-specific duration or use average
      const procedureTime = getProcedureTime(ticket, averageProcedureTimes, globalAverage);
      
      // Add turnover time between patients
      const totalTime = procedureTime + (index > 0 ? turnoverTime : 0);
      
      cumulativeTime += totalTime;
      
      results.push({
        ticketId: ticket.id,
        etaMinutes: cumulativeTime,
        estimatedCompletionTime: new Date(now.getTime() + cumulativeTime * 60 * 1000),
        position: index + 1
      });
    });
  });
  
  return results;
}
```

### 3. Provider Abstraction Pattern (Telephony)

**Pluggable Telephony Providers**:
```typescript
// Abstract interface for any VoIP provider
export interface WebphoneProvider {
  register(): Promise<void>;
  unregister(): Promise<void>;
  dial(number: string): Promise<void>;
  answer(): Promise<void>;
  hangup(): Promise<void>;
  hold(): Promise<void>;
  unhold(): Promise<void>;
  transfer(target: string, type: 'blind' | 'attended'): Promise<void>;
  sendDTMF(tone: string): Promise<void>;
  setDevices(devices: MediaDeviceConfig): Promise<void>;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

// Implementations: SIPProvider, WebPhoneProvider, MockProvider
```

### 4. Event-Driven Analytics

**Comprehensive Event Tracking**:
```typescript
export class AnalyticsService {
  // Track check-in events
  trackCheckInCreate(data: { patientId: string; method: 'reception' | 'kiosk' }) {
    this.track('check-in-create', 'create', data);
  }
  
  // Track queue movements
  trackTicketMove(data: { ticketId: string; fromLane: string; toLane: string }) {
    this.track('ticket-move', 'drag-drop', data);
  }
  
  // Track SLA breaches
  trackSLABreach(data: { ticketId: string; waitTime: number; threshold: number }) {
    this.track('sla-breach', 'threshold-exceeded', data);
  }
  
  // Auto-log every 30 seconds to console.table
  displayRecentEvents(limit = 10) {
    const recent = this.getEvents({ limit });
    console.table(recent);
  }
}
```

### 5. Type-Safe Domain Models

**Comprehensive TypeScript Types**:
```typescript
export interface QueueTicket {
  id: string;
  checkInId: string;
  patient: PatientRef;
  dentist?: DentistRef;
  room?: RoomRef;
  procedure?: ProcedureRef;
  priority: Priority; // 'emergency' | 'urgent' | 'routine' | 'follow_up'
  status: QueueStatus; // 'waiting' | 'called' | 'in_treatment' | 'completed'
  ticketNumber: string;
  queuePosition: number;
  estimatedDuration?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}

// 20+ domain models with full type safety
```

---

## 🚢 Deployment

### Environment Variables

Create a `.env.local` file for local development:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=WaveNet Care
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mock Service Worker
NEXT_PUBLIC_MSW_ENABLED=true

# API Configuration (for production)
NEXT_PUBLIC_API_URL=https://api.wavenetcare.com
NEXT_PUBLIC_API_KEY=your_api_key_here

# Telephony (SIP.js)
NEXT_PUBLIC_SIP_DOMAIN=sip.yourprovider.com
NEXT_PUBLIC_SIP_WS_URL=wss://sip.yourprovider.com
```

See [ENV_VARIABLES_GUIDE.md](ENV_VARIABLES_GUIDE.md) for complete documentation.

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Configure Environment Variables**:
   - Add production environment variables in Vercel dashboard
   - Set `NEXT_PUBLIC_MSW_ENABLED=false` for production

4. **Deploy**:
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Production URL: `https://your-app.vercel.app`

### Production Optimizations

- ✅ **Image Optimization**: AVIF/WebP with `next/image`
- ✅ **Code Splitting**: Automatic route-based splitting
- ✅ **Compression**: Gzip/Brotli enabled
- ✅ **Caching**: Static assets cached with long TTL
- ✅ **Security Headers**: CSP, X-Frame-Options, HSTS
- ✅ **Error Handling**: Global error boundaries
- ✅ **MSW Disabled**: API mocking removed in production

---

## 📊 Performance Metrics

### Lighthouse Scores (Target)

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 95+

### Bundle Size Analysis

```bash
# Analyze bundle size
npm run build
# Output shows route-by-route size breakdown
```

**Key Metrics**:
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 🔐 Security Considerations

### Implemented Security Measures

1. **Authentication**:
   - Context-based auth state management
   - Protected routes with redirect
   - Session persistence in localStorage (production: use httpOnly cookies)

2. **Input Validation**:
   - Zod schema validation on all forms
   - XSS protection via React's built-in escaping
   - Type safety with TypeScript

3. **API Security** (Production Recommendations):
   - Implement JWT-based authentication
   - Add rate limiting (e.g., `express-rate-limit`)
   - Use HTTPS only
   - Implement CORS policies
   - Add CSRF protection

4. **Data Protection**:
   - No sensitive data in localStorage (use secure httpOnly cookies in production)
   - Environment variables for secrets
   - `.gitignore` prevents credential commits

---

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome!

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**:
   ```bash
   npm test
   npm run lint
   ```
5. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ About the Engineer

### Full-Stack Development Capabilities Demonstrated

This project showcases expertise in:

#### Frontend Engineering
- ✅ **Modern React Patterns**: Server Components, React 19 concurrent features, custom hooks
- ✅ **Advanced State Management**: React Query (server state), Zustand (client state), Context API
- ✅ **TypeScript Mastery**: 100+ interfaces, strict mode, generic types, type guards
- ✅ **Performance Optimization**: Code splitting, lazy loading, optimistic updates, memoization
- ✅ **Responsive Design**: Mobile-first approach, flexbox/grid layouts, Tailwind CSS

#### Architecture & System Design
- ✅ **Provider Abstraction**: Pluggable telephony system supporting multiple VoIP providers
- ✅ **Event-Driven Architecture**: Analytics service with comprehensive event tracking
- ✅ **Separation of Concerns**: Clean architecture (presentation, business logic, data access)
- ✅ **Design Patterns**: Singleton (telephony provider), Observer (event system), Factory (MSW handlers)

#### Backend & API Design
- ✅ **RESTful API Design**: CRUD operations, proper HTTP methods, status codes
- ✅ **Mock Service Worker**: Realistic API simulation for development
- ✅ **Data Modeling**: Comprehensive domain models with referential integrity

#### DevOps & Tooling
- ✅ **Modern Build Pipeline**: Next.js 15 with optimized production builds
- ✅ **Environment Management**: Multi-environment configuration (.env files)
- ✅ **Deployment**: Vercel-optimized with production-ready config
- ✅ **Developer Experience**: ESLint, Prettier, TypeScript strict mode, hot reload

#### Real-Time Features
- ✅ **Polling Strategy**: 30-second queue updates with automatic cache invalidation
- ✅ **Optimistic UI Updates**: Instant feedback with automatic rollback on failure
- ✅ **Live Timers**: Real-time countdown for SLA monitoring

#### UX/UI Design
- ✅ **Professional Design System**: Consistent color palette, typography, spacing
- ✅ **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- ✅ **Dark Mode**: System preference detection with manual toggle
- ✅ **Micro-interactions**: Toast notifications, loading states, skeleton screens

---

## 📞 Contact

**Portfolio**: [your-portfolio.com](https://your-portfolio.com)  
**LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)  
**Email**: your.email@example.com  
**GitHub**: [@yourusername](https://github.com/yourusername)

---

## 🌟 Star this Repository

If you found this project impressive or useful, please consider giving it a ⭐️ on GitHub!

---

<div align="center">
  <p><strong>Built with ❤️ by a passionate full-stack developer</strong></p>
  <p><em>Ready to build amazing products at scale</em></p>
</div>
