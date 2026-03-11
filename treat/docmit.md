# Backend Implementation — Build Log

## Date: 2026-02-13

## Decisions Locked
| # | Decision | Choice |
|---|----------|--------|
| 1 | Database | Firestore (Firebase project: `onestopcentre-c99ed`) |
| 2 | Backend Stack | Firebase Backend (Cloud Functions + Firestore + Auth + Storage) |
| 3 | Auth System | Firebase Auth (Email/Password + Google Sign-In) |
| 4 | Gemini API Key | Moved to server-side Cloud Functions |

---

## Phase 0: Foundation — COMPLETE

### Cloud Functions Initialized
- Directory: `frontend/functions/`
- Runtime: Node 20, TypeScript
- Dependencies: `firebase-admin`, `firebase-functions`, `@google/generative-ai`, `express`, `cors`

### Files Created
| File | Purpose |
|------|---------|
| `functions/package.json` | Cloud Functions project config |
| `functions/tsconfig.json` | TypeScript compiler config |
| `functions/.env` | Gemini API key (server-side only) |
| `functions/src/admin.ts` | Firebase Admin SDK initialization |
| `functions/src/index.ts` | Entry point — exports all functions |
| `functions/src/chatbot.ts` | Gemini AI proxy (POST, stores sessions) |
| `functions/src/tickets.ts` | CRUD for tickets (GET/POST/PUT) with SLA calculation |
| `functions/src/events.ts` | CRUD for events + registration |
| `functions/src/projects.ts` | Projects query with filters (sector, region, status, range, search) |
| `functions/src/dashboard.ts` | DG dashboard metrics aggregation from tickets/events/sessions |
| `functions/src/triggers/onUserCreate.ts` | Auto-creates Firestore user profile on Firebase Auth signup |

### Security Rules Created
| File | Coverage |
|------|----------|
| `firestore.rules` | 8 collections: users, chat_sessions, events, event_registrations, tickets, projects, agencies, analytics, dashboard_cache |
| `firestore.indexes.json` | 9 composite indexes for filtered queries |
| `storage.rules` | Ticket attachments (10MB), event resources, user avatars (2MB) |

### Security Fixes
- Gemini API key removed from client-side `.env` / `.env.local`
- Key moved to `functions/.env` (server-side only)
- `service-account.json` confirmed gitignored and untracked
- `.gitignore` updated: added `functions/lib/`, `functions/node_modules/`

---

## Phase 1: Firestore Schema — COMPLETE

### Collections
```
users/{uid}           — role, email, name, phone, createdAt
chat_sessions/{id}    — messages[], language, status, startedAt
events/{id}           — title, category, date, location, capacity, registered
event_registrations/  — eventId, name, email, phone, organization
tickets/{id}          — title, category, status, priority, slaDeadline, history[]
projects/{id}         — name, company, sector, region, coordinates, investmentValue
agencies/{id}         — name, acronym, services[], contactInfo
analytics/{id}        — inquiry summary data
dashboard_cache/{id}  — aggregated metrics snapshot
```

---

## Phase 2: Firebase Auth Integration — COMPLETE

### AuthContext.tsx Rewritten
- **Before**: Called dead REST API endpoints on `treat.onrender.com`
- **After**: Uses Firebase Auth SDK directly

| Method | Old | New |
|--------|-----|-----|
| `login()` | `apiClient.login()` → dead endpoint | `signInWithEmailAndPassword()` |
| `register()` | `apiClient.register()` → dead endpoint | `createUserWithEmailAndPassword()` + Firestore profile |
| `googleSignIn()` | Google Identity Services → dead endpoint | `signInWithPopup(GoogleAuthProvider)` |
| `logout()` | `apiClient.logout()` → dead endpoint | `signOut()` |
| `verifyEmail()` | 6-digit code → dead endpoint | `sendEmailVerification()` (link-based) |
| Auth state | Manual `localStorage` token | `onAuthStateChanged()` listener |

### Auth Components Updated
| Component | Change |
|-----------|--------|
| `GoogleSignInButton.tsx` | Removed Google Identity Services script → Firebase popup |
| `EmailVerificationForm.tsx` | Removed 6-digit code input → email link verification |
| `AuthModal.tsx` | Updated for new component signatures |

---

## Phase 4: Frontend Wired to Firestore — COMPLETE

### Hooks Created
| Hook | Collection | Fallback |
|------|-----------|----------|
| `useFirestoreCollection<T>` | Generic real-time listener | Mock data array |
| `useTickets()` | `tickets` | `mockTickets` |
| `useEvents()` | `events` | `mockEvents` |
| `useProjects()` | `projects` | `mockProjects` |
| `useDashboard()` | `dashboard_cache` + Cloud Function | `mockDashboardMetrics` |

### Pages Updated
| Page | Before | After |
|------|--------|-------|
| `/tickets` | `import { mockTickets }` | `useTickets()` hook with real-time listener |
| `/tickets/[id]` | `mockTickets.find()` | Firestore `getDoc()` with mock fallback |
| `/tickets/create` | `localStorage.setItem()` | `addDoc(collection(firestore, 'tickets'))` |
| `/events` | `import { mockEvents }` | `useEvents()` hook with real-time listener |
| `/events/[id]` | `mockEvents.find()` | Firestore `getDoc()` with mock fallback |
| `/projects` | `import { mockProjects }` | `useProjects()` hook with real-time listener |
| `/dashboard` | `import { mockDashboardMetrics }` | `useDashboard()` hook (Firestore + Cloud Function) |
| `/analytics` | `import { mockAnalytics }` | Firestore `onSnapshot()` with mock fallback |

### Chatbot Updated
| Before | After |
|--------|-------|
| Client-side `GoogleGenerativeAI` call | Cloud Function proxy call |
| API key in browser network tab | Key on server only |
| No session persistence | Sessions stored in Firestore `chat_sessions` |

---

## Firebase Config Updated
`firebase.json` now includes:
- `hosting` (static export to `out/`)
- `firestore` (rules + indexes)
- `storage` (rules)

### firebase.ts (Client SDK)
- Added: `getAuth()`, `getFirestore()`, `getStorage()`, `GoogleAuthProvider`
- Added: `getFunctionsBaseUrl()` helper (auto-detects emulator vs production)
- All services guarded with `typeof window !== 'undefined'` for static export compatibility

---

## Build Status
- `npx tsc --noEmit` — 0 errors
- `npm run build` — SUCCESS (all 28 pages exported)
- `functions/npm run build` — SUCCESS

---

## Next Steps Required (Manual)

### 1. Enable Firebase Services in Console
Go to: `console.firebase.google.com` → Project `onestopcentre-c99ed`

- **Authentication** → Sign-in method → Enable:
  - Email/Password
  - Google
- **Firestore Database** → Create database → Production mode
- **Storage** → Enable

### 2. Get Firebase Web App Config
Console → Project Settings → General → Web App → Config snippet

Fill values into `frontend/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=<from console>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from console>
NEXT_PUBLIC_FIREBASE_APP_ID=<from console>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<from console>
```

### 3. Deploy
```bash
cd frontend
firebase deploy
```

### 4. Seed Data (Optional)
Import mock data into Firestore collections for initial content:
- `agencies` — from `src/data/agencies.ts`
- `projects` — from `src/data/mock/projects.ts` + PDF data
- `events` — from `src/data/mock/events.ts`

### 5. Future Phases
- Module 5 (Inter-Agency Hub) — real-time messaging
- Freshdesk integration (Decision D2) — webhook sync with `tickets` collection
- Email notifications (FCM/SMTP) for ticket SLA breaches
- PDF data import pipeline for licensed projects
