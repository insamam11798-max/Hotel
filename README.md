# HotelPulse AI

**Your hotel. Compared. Explained. Improved.**

Hotel performance intelligence for owners, GMs, finance, revenue and F&B teams and hotel groups. Upload the monthly reports you already produce; HotelPulse extracts and validates the numbers, calculates 70+ KPIs, benchmarks the hotel, explains what changed, lists what needs attention (with evidence and estimated impact), answers questions in plain language and writes the monthly management report.

The interface has five destinations — **Overview · Benchmark · Attention · Ask AI · Reports**. Everything else is a contextual drill-down.

---

## Quick start (local)

Requirements: Node 20+ (tested on Node 24). No Docker or system PostgreSQL needed — a real PostgreSQL 17 runs from `node_modules`.

```bash
npm install
cp .env.example .env              # then fill AUTH_SECRET / APP_ENCRYPTION_KEY / BENCHMARK_HASH_SECRET
npm run db:start                  # terminal 1: PostgreSQL on 127.0.0.1:5433 (creates hotelpulse + hotelpulse_test)
npx prisma migrate deploy         # create the schema
npm run db:seed                   # platform config + clearly-marked DEMO organization (~15 s)
npm run dev                       # http://localhost:3000
```

For local `.env`, point `DATABASE_URL` at `postgresql://hotelpulse:hotelpulse_local_dev@127.0.0.1:5433/hotelpulse` and `TEST_DATABASE_URL` at the `hotelpulse_test` database, and set `STORAGE_DRIVER="local"`.

* **Live demo:** “Explore the live demo” on the sign-in page (fictional 5★ Doha hotel group, every screen labelled DEMO DATA).
* **Demo users per role** and the local platform-admin login: `tests/QA-ACCOUNTS.md`.
* **Emails in development** (verification, reset, invitations) are logged to **Admin → Email outbox** when `RESEND_API_KEY` is empty.

### Tests

```bash
npm test                 # all 90 tests (unit + integration against the hotelpulse_test database)
npm run test:unit        # engine, ingestion, AI guardrails, scenarios, reports, security
npm run test:integration # tenancy isolation, auth, end-to-end pipeline, benchmark privacy, billing
npm run typecheck && npm run lint
```

---

## Architecture

A **modular monolith** on Next.js 15 (App Router, Server Components, Server Actions) + TypeScript + Prisma + PostgreSQL. No microservices; modules are separated by folder and only communicate through function calls.

```
src/
  app/                 routes: marketing, auth, onboarding, /p/[propertyId]/(overview|benchmark|attention|ask|reports|upload|drill), portfolio, settings, admin, api
  components/          design system (ui.tsx), overview, attention, AI chat, reports, upload, admin
  lib/                 shared pure code (formatting, simulator, report types)
  server/
    core/              db, env, crypto (hashing, AES-GCM), rate limit, audit, email, storage (local/S3), settings, notifications
    auth/              passwords (bcrypt), DB sessions, verification/reset/invitation tokens
    tenancy/           tenant context, property access, RBAC permission matrix
    kpi/               canonical metric dictionary, safe formula language, KPI registry & calculator
    ingestion/         parse (xlsx/csv/pdf) → detect → extract/map → validate → apply
    analytics/         analyze() core, benchmarks, Hotel Score, attention/opportunity rules, GOP bridge, forecast, pipeline
    ai/                fact sheet, specialist analysts, provider abstraction, grounding guardrail, prompts, mapping assist
    reports/           33-section report builder, PDF / Excel / PowerPoint exporters
    billing/           plans & entitlements, Stripe or manual provider
    actions/           attention workflow, Action Center, savings tracker
    jobs/              Postgres-backed job queue (after-response + cron)
    demo/              DEMO data generator and seeding
```

**Processing flow.** Upload → `process_document` job (parse, detect report type, extract, map, validate) → user reviews (“We found 85 metrics…”) → confirm → `apply_and_analyze` job writes canonical `MetricValue`s and runs the analytics pipeline for that month and later months (KPIs → history → benchmarks → score → attention → summary → forecast → anonymous contribution → notifications). Jobs start right after the response (`after()`), with `/api/jobs/run` (Vercel Cron, every minute) or `npm run jobs:run` (self-hosted worker) for retries.

## Database

Multi-tenant from day one (`prisma/schema.prisma`). Key tables: `Organization → HotelGroup → Property → Department`; `User`, `Membership` (role, all-properties flag) and `MembershipProperty` (property scoping); `Session`, `AuthToken`, `Invitation`; `ReportingPeriod`; **`MetricValue`** (canonical store: property × period × metric × dimension × scenario, with source document, cell reference, confidence, validation status); `Document` / `ExtractedValue` (staging for review); `PeriodAnalysis` (cached KPI snapshots, score, summary, data quality); `Alert` / `AlertNote` / `Action`; `Forecast` (versioned by base month); `BenchmarkContribution` (anonymous), `BenchmarkDataset` / `BenchmarkValue` (licensed), `CompSetValue`; `AiConversation` / `AiMessage` / `AiAuditRecord` / `AiPrompt`; `Report` / `ReportTemplate`; `Plan` / `Subscription`; `KpiDefinition`, `FeatureFlag`, `SystemSetting`, `ProcessingJob`, `AuditLog`, `Notification`, `EmailOutbox`, `SupportTicket`, `RateLimitBucket`, `DataSource`.

Dimensions use `type:member` keys (`channel:Booking.com`, `venue:Bar`, `day:2026-06-14`, `department:F&B`, `topic:Cleanliness`, `contract:…`), so breakdowns need no schema changes.

## KPI engine

All formulas live in `src/server/kpi/registry.ts` (70 KPIs over 60+ raw metrics; ~130 measures per month). Formulas use a small safe language (`+ − × ÷`, `coalesce`, `sum`, `min`, `max`, `abs`) parsed without `eval`; missing data yields *null*, never zero. Admins can edit names, descriptions, formulas (validated) and active flags in **Admin → KPI definitions**; changes apply on the next analysis run.

Examples: Occupancy = rooms sold ÷ rooms available × 100 · ADR = room revenue ÷ rooms sold · RevPAR = room revenue ÷ rooms available · GOP margin = GOP ÷ total revenue × 100 · GOPPAR · TRevPAR · food/beverage cost % · F&B labour % · payroll % and per occupied room · overtime % · energy per occupied room · complaints per 1,000 occupied rooms · AR over 60 days · DSO · OTA/direct contribution · commission rate · MPI / ARI / RGI.

## Benchmark methodology

Sources, in order of preference for the headline comparison: **comp set** (aggregate, user-entered or uploaded STR-style data) → **anonymous HotelPulse network** → **licensed datasets** → **your portfolio**; **your own 12-month history** is always shown alongside. Every benchmark carries its source, sample size, period, methodology and confidence.

Network privacy: contributions store only KPI ratios with segment attributes and a one-way HMAC of the property id (no organization/property link); the requesting hotel is excluded; a benchmark is shown only when at least *N* distinct properties qualify (`benchmark.minSampleSize`, default 5, minimum 3, admin-configurable); the segment may widen from *exact* (market, type, stars, room band) to *type + stars* to *stars* but never across star categories; organizations and properties can opt out, which deletes their contributions; demo data never mixes with real data. Otherwise the UI says **“Insufficient peer data to produce a reliable benchmark.”**

## Hotel Score

Each KPI is scored 0–100 against its reference (benchmark → budget → last year → own history → prior month); parity = 75. Dimension scores (Financial 25, Rooms 20, Commercial 13, F&B 12, Guest 12, Workforce 10, Operational 8) are averaged and re-weighted when an area has no data; with fewer than 3 areas the score is withheld.

## AI architecture

One assistant, “HotelPulse AI”, backed by specialists: Executive Analyst, Financial Analyst, Rooms Analyst, F&B Analyst, Commercial Analyst, Guest Experience Analyst, Benchmark Analyst, Root Cause Analyst (GOP bridge), Action Advisor and Report Writer.

* **Deterministic first.** The core questions are answered by analysts that read only the permission-filtered fact sheet and record every number they use as evidence.
* **LLM optional.** With `ANTHROPIC_API_KEY` (default model `claude-opus-5-5`, structured JSON output, server-side refusal fallbacks) or `OPENAI_API_KEY`, free-form questions go to the model with the fact sheet only.
* **Grounding guardrail.** Every number in an answer must match a fact at its display precision (or a change between two facts about the same measure); otherwise the answer is withheld with “I don’t have enough information to determine this reliably.”
* **Auditability.** Every answer stores question, intent, agent, prompt version, provider, evidence, grounding result and latency (`AiAuditRecord`). Every attention item stores its evidence trail (“Why did HotelPulse say this?”).
* **No fraud claims.** Rules and prompts use “variance”, “anomaly”, “requires review”.

## Security controls

Tenant isolation through a single access layer (`getAccessibleProperty` returns 404 for other tenants); role-based permissions applied to pages, actions, AI context, attention items and report sections; bcrypt passwords with policy, generic login errors and dummy hashing (no user enumeration), lockout after 5 failures, DB-backed httpOnly sessions (rolling 30 days), single-use hashed verification/reset/invite tokens, sessions revoked on password reset; rate limits (login, sign-up, reset, AI, uploads, exports); CSP, HSTS, frame-deny and related headers; Server Action origin checks plus an Origin check on the upload API; upload type sniffing by magic bytes, size limits, server-generated tenant-prefixed storage keys, S3 server-side encryption; AES-256-GCM for stored integration secrets; validated admin formulas (no code execution); Stripe webhook signature verification; audit log for security and data events; shared demo blocked from emails, billing, team and account changes; safe redirect handling.

## Deployment

* Vercel (or any Node host) + managed PostgreSQL + S3-compatible storage. Set the variables in `.env.example`, run `prisma migrate deploy` and `npm run db:seed` (`SEED_ADMIN_PASSWORD` required in production; `SEED_DEMO=false` to skip the demo).
* `vercel.json` schedules `/api/jobs/run` every minute; Vercel sends `CRON_SECRET` as the bearer token.
* Stripe (optional): create prices, paste their IDs in **Admin → Plans**, point a webhook at `/api/billing/webhook` for `customer.subscription.*`.

## Known limitations

See the end of the delivery summary; highlights: no PMS/POS integrations yet (upload-first by design); scanned PDFs need an Excel/CSV export (no OCR); forecasts are simple seasonal-ratio estimates; undistributed expense lines are expected to exclude payroll (USALI section totals are flagged for review); WhatsApp notifications and SSO are not built; the legal pages are templates for counsel review.
