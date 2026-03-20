# OneStop Centre

Client: Christine Masika

## Project Overview

The Uganda Investment Authority (UIA) OneStop Centre is a digital platform that streamlines access to government business services, investment opportunities, and professional support for investors in Uganda. It consolidates multiple government agencies into a single portal, enabling investors to submit service requests, track tickets, access downloadable resources, chat with an AI assistant, and explore licensed investment projects across Uganda.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **CMS**: Sanity.io (content management, ticket storage, analytics)
- **Authentication**: Custom JWT + Google OAuth
- **Email**: Postmark (transactional emails)
- **AI Chatbot**: Groq (LLaMA 3.3 70B)
- **Maps**: Leaflet.js
- **Deployment**: Vercel
- **Domain**: <https://www.oscdigitaltool.com>

## Key Features

- [x] Multi-agency government services portal (16+ agencies)
- [x] Service request / ticket system with SLA tracking
- [x] AI-powered multilingual chatbot (EN, FR, AR, ZH, SW)
- [x] Agency-to-agency live chat
- [x] Interactive investment project map (Leaflet)
- [x] Investor onboarding and profile management
- [x] Admin dashboard with analytics and KPIs
- [x] Downloadable resources center
- [x] Business tools (ROI calculator, tax calculator, invoice generator, document checklist)
- [x] Google OAuth + email/password authentication
- [x] Email notifications (ticket confirmation, status updates, escalations)
- [x] CSV export for admin data
- [x] PWA manifest for mobile install

## Status

- [x] Requirements gathered
- [x] Design approved
- [x] Development started
- [x] Testing complete
- [x] Deployed
- [ ] Handed off to client

**Last updated**: 2026-03-12

## Timeline

- **Start date**: 2026
- **Expected completion**: TBD
- **Current milestone**: Live on production, iterating on feedback

## Client Contact

- **Client**: Christine Masika
- **Email**: admin@uia.go.ug
- **Domain registrar**: <https://oscdigitaltool.com>

## Setup

```bash
cd treat/frontend
npm install
npm run dev
```

**Environment variables** (`.env`):

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
POSTMARK_SERVER_TOKEN=
EMAIL_FROM=notifications@www.oscdigitaltool.com
ADMIN_NOTIFICATION_EMAIL=admin@uia.go.ug
GROQ_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
NEXT_PUBLIC_SITE_URL=https://www.oscdigitaltool.com
```

## Project Structure

```text
treat/frontend/
├── src/
│   ├── app/            # Next.js App Router pages + API routes
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (Sanity client, email, validations)
│   ├── data/           # Mock data
│   └── types/          # TypeScript type definitions
├── sanity/             # Sanity Studio schemas
├── public/             # Static assets (images, icons, logos)
└── dist/               # Sanity Studio build output
```

## Notes

- Emails sent via Postmark from `notifications@www.oscdigitaltool.com`
- Escalation alerts go to `admin@uia.go.ug`
- Sanity Studio accessible at `/studio`
