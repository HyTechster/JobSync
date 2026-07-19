<div align="center">

<img src="public/icons/icon-192.png" width="72" alt="JobSync logo" />

# JobSync

**A digital job sheet and work order management system for field service SMEs.**

Replace paper job sheets with a real-time, offline-capable Progressive Web App -
built for surveillance and maintenance crews who dispatch from the office and
complete work in the field.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## What it does

JobSync gives service businesses two connected apps in one codebase:

- 🖥️ **Admin dashboard** (desktop) — create and assign job orders, track every
  job and technician in real time, review submitted job sheets, manage your
  team, and send alerts.
- 📱 **Technician PWA** (mobile) — view assigned jobs, update status on the
  go, submit digital job sheets with photo evidence, and keep working even
  with no signal.

Everything syncs live through Supabase, and job sheets created offline queue
locally and sync automatically the moment connectivity returns.

## Key features

| | |
|---|---|
| 🗂️ **Job orders** | Create, assign, filter, sort, and cancel job orders across your organization |
| 👥 **Multi-tenant orgs** | Admins invite technicians into their own organization; role-based access throughout |
| ⚡ **Real-time sync** | Job status changes appear on the dashboard within seconds, no refresh needed |
| 📶 **Offline-first** | Job sheets are saved to IndexedDB in the field and synced automatically once back online |
| 📸 **Photo attachments** | Technicians document completed work straight from their phone camera |
| 🔔 **Alerts** | Broadcast updates to one technician or the whole crew, with read tracking |
| 🧭 **Guided onboarding** | A spotlight-style walkthrough introduces new organizations to the app |
| 🏠 **Public marketing site** | A landing page explains the product before anyone signs in |

## Tech stack

**Frontend** — React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router · TanStack Query · Zustand · React Hook Form + Zod

**Backend** — Supabase (PostgreSQL, Auth, Realtime, Storage) with Row Level Security on every table

**Offline / PWA** — `vite-plugin-pwa` (Workbox) + Dexie.js (IndexedDB)

**Tooling** — Vitest · React Testing Library · Playwright · ESLint · Prettier · GitHub Actions CI · deployed on Vercel

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run the dev server
npm run dev
```

To set up the database, run [`schema.sql`](schema.sql) in the Supabase SQL Editor on a fresh
project — it creates every table, RLS policy, trigger, and function in one go.

### Other commands

```bash
npm run build     # type-check + production build
npm run lint       # ESLint
npm run test       # Vitest unit tests
npx playwright test  # end-to-end tests
```

## Project structure

```
src/
├── components/  # Shared UI, layout, and design-system primitives
├── features/    # Feature-sliced modules (auth, jobs, job-sheets, alerts, users, tour...)
├── pages/       # Route-level pages (admin/, technician/, home/, dashboard/, account/)
├── router/      # Route definitions and role-based route guards
├── context/     # Organization/session context
├── store/       # Zustand stores
├── offline/     # Dexie database + background sync logic
└── hooks/       # Shared reusable hooks
```

## About

JobSync is a Final Year Project for the Bachelor of Computer Science (Software
Engineering) programme at **Multimedia University (MMU)**, built by
**Wan Amirul Amir Bin Wan Romzi**.

