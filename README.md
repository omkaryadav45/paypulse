# 💳 PayPulse — Payments Analytics & Pricing Dashboard

A modern, full-stack **payments analytics and pricing administration** dashboard with an
**AI assistant**, role-based access control, and a rich, editable pricing engine.

Built to production standards with **Next.js 16 (App Router)**, **React 19**,
**TypeScript**, **Prisma**, **Tailwind CSS v4**, and the **Vercel AI SDK**.

> Portfolio project by **Omkar Yadav** — [github.com/omkaryadav45](https://github.com/omkaryadav45)

<!-- Add your live URL after deploying: -->
<!-- **🔗 Live demo:** https://paypulse.vercel.app -->

---

## ✨ Features

- **Analytics dashboard** — KPI cards with 30-day trend deltas, a revenue area chart,
  transaction-status donut, revenue-by-method bar chart, top merchants, and recent activity.
- **Transactions** — server-side paginated data table (TanStack Table + TanStack Query) with
  debounced search, status/method filters, and sortable columns.
- **Pricing & fees** — an **inline-editable fee grid** per merchant with real-time **Zod**
  validation (decimal, min/max, and type-dependent rules) saved via **Server Actions**.
- **Merchants CRUD** — create / edit / delete with a **React Hook Form + Zod** modal.
- **Auth + RBAC** — credential login (bcrypt) with a signed **JWT session** (jose), route-
  protecting middleware, and **Admin (edit) vs Analyst (read-only)** roles enforced on both
  the UI and Server Actions.
- **AI Assistant** — a streaming chat (Vercel AI SDK) that answers questions about your data
  using **tool-calling** grounded in live database queries.
- **Polish** — dark/light theme, fully responsive, skeleton loading states, and a reusable
  component library.

## 🧱 Tech stack

| Area        | Tech |
|-------------|------|
| Framework   | Next.js 16 (App Router, Server Actions), React 19 |
| Language    | TypeScript |
| Styling     | Tailwind CSS v4, custom design tokens, dark mode |
| Data        | Prisma 7 ORM, SQLite (libSQL adapter) |
| Client data | TanStack Query, TanStack Table |
| Forms       | React Hook Form, Zod |
| Charts      | Recharts |
| Auth        | jose (JWT), bcryptjs, middleware |
| AI          | Vercel AI SDK (`ai`, `@ai-sdk/openai`) with tool-calling |
| Testing     | Jest, React Testing Library |

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up the database (creates dev.db + applies migrations)
npx prisma migrate dev

# 3. Seed demo data (merchants, fee codes, ~1,200 transactions, users)
npm run seed

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 🔑 Demo credentials

| Role    | Email                   | Password      | Access          |
|---------|-------------------------|---------------|-----------------|
| Admin   | `admin@paypulse.dev`    | `password123` | Full edit access |
| Analyst | `analyst@paypulse.dev`  | `password123` | Read-only (RBAC) |

> The login screen also has one-click **Admin** / **Analyst** demo buttons.

### 🤖 Enabling the AI Assistant

Add an API key to `.env` (see `.env.example`):

```bash
OPENAI_API_KEY="sk-..."
```

You can swap to a free provider (Groq / Google Gemini) by changing the model in
`src/app/api/chat/route.ts`. Without a key, the assistant shows a friendly "not configured" message.

## 🧪 Testing & quality

```bash
npm run typecheck   # strict TypeScript
npm run lint        # ESLint
npm test            # Jest + React Testing Library
```

## 🗂️ Project structure

```
src/
├── app/
│   ├── (app)/            # Authenticated shell: dashboard, transactions, merchants, pricing, assistant
│   ├── api/              # Route handlers: transactions, fee-codes, chat (AI)
│   ├── login/            # Auth pages + actions
│   └── layout.tsx        # Root layout, providers
├── components/           # UI primitives + feature components
├── lib/                  # prisma, auth/session, queries, validation, utils
├── hooks/                # custom hooks (useDebounce)
└── middleware.ts         # route protection
```

## ☁️ Deployment

Deploys to **Vercel**. Since Vercel is serverless, swap SQLite for a hosted database
(**Turso** — libSQL, drop-in — or **Neon/Vercel Postgres**), set `DATABASE_URL`,
`SESSION_SECRET`, and `OPENAI_API_KEY` as environment variables, then run
`prisma migrate deploy` and seed.

---

Built with care to demonstrate senior-level full-stack engineering: type safety,
component architecture, server/client data patterns, validation, RBAC, and AI integration.

