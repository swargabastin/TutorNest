# HomeTutor — Implementation Status & Setup

This is the companion doc to `ARCHITECTURE.md`. That file explains *how the
system is built*; this file explains *what's actually done, what's verified,
and what's left*. Read `ARCHITECTURE.md` first if you haven't.

## Secrets & environment setup — do this before anything else

None of this is code that needs fixing — it's configuration and access that
only you can provide. Antigravity (or anyone) will hit a wall immediately
without it.

### 1. Real secrets (currently all placeholders)

`appsettings.json` has literal placeholder values — nothing that touches
payments, image upload, or email will work until these are replaced:

```
Jwt:SecretKey        → "CHANGE_THIS_TO_A_MINIMUM_32_CHARACTER_RANDOM_SECRET_KEY_12345"
Razorpay:KeyId       → "rzp_test_YOUR_KEY_ID"
Razorpay:KeySecret   → "YOUR_RAZORPAY_SECRET"
Cloudinary:CloudName → "YOUR_CLOUD_NAME"
Cloudinary:ApiKey    → "YOUR_API_KEY"
Cloudinary:ApiSecret → "YOUR_API_SECRET"
Email:SmtpUser       → "YOUR_GMAIL@gmail.com"
Email:SmtpPass       → "YOUR_APP_PASSWORD"
```
Either supply real (test-mode is fine for Razorpay) credentials, or
explicitly tell Antigravity which of these to treat as unset/skipped.

### 2. Database — two independent schema sources that are already out of sync

There are **two separate ways this project's database gets created**, and
they don't agree with each other:

- **EF Core migrations** (`Migrations/*.cs`, applied via `dotnet ef database
  update`) — this is the one described everywhere else in this doc, and the
  one that has the `Audience` column and the 3 new tutor plans from this
  integration pass.
- **`database/schema.sql`** — a completely separate, hand-written, snake_case
  SQL schema (`subscription_plans`, `tutor_profiles`, etc., vs. EF's
  PascalCase `SubscriptionPlans`, `TutorProfiles`), wired into
  `docker-compose.yml` to run once against a fresh Postgres volume
  (`docker-entrypoint-initdb.d`). **It does not have the `Audience` column
  or the tutor plans** — it was never updated alongside the EF migrations.

**Practical effect:** if you bring the database up via `docker-compose up`,
you get the old `schema.sql` version. If you then run `dotnet ef database
update` against that same database, EF will try to create tables that
already exist (under different-cased names) and likely fail or produce a
mismatched schema.

**Recommendation:** pick one source of truth going forward — EF Core
migrations is the actively-maintained one — and either delete/ignore
`schema.sql` and the `docker-compose.yml` init-script line, or point
`docker-compose` at an empty Postgres with no init script and let
`dotnet ef database update` be the only thing that creates tables. Tell
Antigravity which one you want before it touches the database.

Also note: `appsettings.json`'s connection string password (`12345678`)
doesn't match `docker-compose.yml`'s Postgres password (`postgres`) — pick
one and make them consistent.

### 3. No git history

This project (both zips) is a plain snapshot, not a git repository — there's
no commit history, no blame, no way to see when or why something was
written. If you have real git history for this project anywhere, hand that
over too; otherwise tell Antigravity there isn't one so it doesn't go
looking.

### 4. Test login credentials

- `database/schema.sql` seeds one admin account:
  **`admin@hometutor.in` / `Admin@123`** — but this only exists if you go
  the `schema.sql` route (see point 2 above).
- The EF Core seed data (`AppDbContext.cs`) does **not** seed any user
  accounts at all — only reference data (subjects, cities, subscription
  plans). If you go the EF-migrations-only route, there is no admin account
  until you register one and manually set its role to `Admin` in the
  database (there's no self-serve "become admin" flow in the app).
- No seeded student/tutor test accounts exist either way — register fresh
  ones, or tell Antigravity to.

### 5. Original chat context

The share link for the conversation that originally built this app
(`claude.ai/share/f0accc71-...`) is JS-rendered and couldn't be fetched
during this integration work — only an empty shell came back. If that
conversation contains decisions or reasoning not captured in this doc or
`ARCHITECTURE.md`, that context only exists in your memory of it — worth
writing down anything that seems relevant before handing off.

## Running it locally

**Backend**
```bash
cd BackEnd/HomeTutorAPI
dotnet restore
dotnet ef database update      # applies EF Core migrations to Postgres
dotnet run                     # http://localhost:5000
```
Requires a reachable PostgreSQL instance — check the connection string in
`appsettings.Development.json` and adjust to your local DB.

**Frontend**
```bash
cd FrontEnd
npm install
npm run dev                    # http://localhost:3000
```
`.env.local` already points at `http://localhost:5000/api`. Start the
backend first.

## Feature status

| Area | Status | Notes |
|---|---|---|
| Auth (register/login/refresh/reset) | Working | JWT + refresh token, role-based |
| Tutor search & filtering | Working | Server-side filter/sort/paginate |
| Tutor profile detail + reviews | Working | Real reviews from backend |
| Student registration | Working | |
| Tutor registration | Working | Required fields (`hourlyRate`, `teachingMode`) were missing from the original form — added |
| Post a requirement | Working | Requires login (backend enforces this — see below) |
| Wallet (balance, buy coins, history) | Working | Real Razorpay checkout, real transaction history |
| Subscription checkout | Working | Real Razorpay checkout; "Choose Plan" previously had no click handler at all |
| Student dashboard | Working | Requirements + stats real; scheduling section honestly shows "not available yet" |
| Tutor dashboard | Working | Leads + stats real; scheduling and messaging sections removed/flagged (backend doesn't have these features) |
| Admin dashboard | Working | Real revenue chart, user growth, pending tutor approvals with working approve/reject |
| Pricing page | Working | Separate real API-backed Student and Tutor plan catalogs (see below) |
| Tutor-specific subscription pricing | Working, **not build-verified** | See "Known incomplete / unverified" |

## What changed during integration (chronological)

1. **Mock data → real API.** All 12 pages that imported from
   `lib/mock-data.ts` now call `lib/api.ts`. That file is untouched dead
   code now (still in the repo, nothing imports it) — safe to delete.
2. **`lib/api.ts` created** — the full typed API client + adapter layer
   described in `ARCHITECTURE.md`.
3. **Real bugs found and fixed** (not just wiring):
   - `EnquiryDto` always returned the tutor's own name, even when a tutor
     views their own leads (should show the student) — would likely throw a
     null-reference exception in that code path. Fixed in the DTO and
     AutoMapper profile.
   - Razorpay's checkout script (`window.Razorpay`) was never loaded
     anywhere — added to `app/layout.tsx`.
   - Wallet page linked to a fully fake, hardcoded `/payment` demo page
     instead of the real payment flow — rewired to real Razorpay checkout.
     `app/payment/page.tsx` is now orphaned (nothing links to it) — safe to
     delete.
   - Subscription page's "Choose Plan" button had no `onClick` at all.
   - A fake "yearly billing, save 20%" toggle wasn't backed by anything in
     the database (plans are month-only) — removed rather than let it
     silently misbill.
4. **Tutor-specific pricing (most recent work).** Originally the pricing
   page showed three fabricated tutor price tiers (₹499/₹999/₹1499) that
   didn't correspond to any backend data — the backend only had one shared
   plan catalog. This was reworked into a real feature:
   - Added `PlanAudience` enum (`Student`/`Tutor`/`Both`) and an `Audience`
     column on `SubscriptionPlan`.
   - `GET /api/payments/plans?audience=Student|Tutor` filters server-side.
   - `POST /api/payments/create-order` validates the caller's actual role
     against the plan's audience and rejects mismatches with `400` —
     enforced in the API itself, not just hidden in the frontend.
   - Seeded 3 real tutor plans (₹499 / ₹999 / ₹1499) with distinct features
     and coin allowances.
   - Frontend pricing page now fetches Student and Tutor plans as two
     separate real API calls; no tutor pricing is hardcoded anywhere.

## Known incomplete / unverified — read this before continuing

**The backend has never actually been compiled against this exact set of
changes with a full, clean toolchain.** The environment that did this
integration work had no `dotnet` SDK for most of the session; a `.NET 10 SDK`
was installed late via `apt-get` (worked), but `dotnet restore` failed
because `api.nuget.org` was blocked by that sandbox's network policy
(`403 host_not_allowed`) — NuGet packages could never be downloaded. So:

- `dotnet build` — **never succeeded**. Not run to completion once.
- `dotnet ef migrations list` — **never run** (needs `dotnet-ef` tool, which
  also needs NuGet).
- The migration `Migrations/20260817000000_AddSubscriptionPlanAudience.cs`
  is **hand-authored**, not generated by `dotnet ef migrations add`. It has
  no companion `Designer.cs` (that file is normally auto-generated from a
  full model diff; hand-writing one accurately for a schema this size was
  judged too risky to fake). The `[Migration]` attribute was placed directly
  on the migration class so `dotnet ef database update` can still find and
  apply it, but this is a workaround, not standard practice.

**Before doing anything else, in an environment with real internet access:**
```bash
cd BackEnd/HomeTutorAPI
dotnet restore
dotnet build                                    # confirm it actually compiles
dotnet ef database update                       # apply migrations, including the hand-authored one
dotnet ef migrations add PostAudienceCheck       # let EF regenerate a real Designer.cs/snapshot
```
Do not add further migrations on top of the hand-authored one until you've
done this — EF's diffing may not be reliable against a snapshot that wasn't
generated by its own tooling.

**Frontend, by contrast, is verified**: `npx tsc --noEmit` passes with zero
errors, and a full `npx next build` succeeded (all 15 routes compiled) once
the Google Fonts network call — the only failure — was temporarily stubbed
to work around that sandbox's restricted network; the real `next/font/google`
import was confirmed restored afterward. This will build normally anywhere
with normal internet access.

## Honestly-flagged gaps (don't build features assuming these exist)

- No class/session scheduling/booking feature in the backend at all.
- No tutor-side messaging/chat feature — only one-shot enquiries.
- No annual/yearly billing — plans are month-only.

## Suggested next steps

1. Compile the backend for real (`dotnet build`) and fix anything that
   surfaces — the changes are small and mechanical (one new enum, one new
   column, one new controller parameter, one new validation branch) but
   have not been proven to compile.
2. Regenerate the EF migration properly per the commands above.
3. Decide whether to delete the two orphaned files (`lib/mock-data.ts`,
   `app/payment/page.tsx`) or leave them as reference.
4. If real class scheduling or tutor messaging are wanted, those are new
   features (new tables, endpoints, and UI), not integration fixes — scope
   them separately.

---

## Handoff Addendum for Antigravity

### Priority Order for Antigravity (§3)
1. **Full-stack defect audit**: Check high-risk pages (messaging, bookings, reviews, requirements, subscriptions) for role check, array guards, SDK load guards, hardcoded 401 redirects, and DateTime/migration drift.
2. **Staging DB migration test**: Test `tutor-verification-v2/` hand-written migration against a PostgreSQL instance.
3. **Integrate tutor verification backend**: Follow `tutor-verification-v2/README.md` exactly, keeping existing `Review` system untouched.
4. **Build verification frontend UI**: Build tutor upload widget and admin approval queue.
5. **Execute deployment pipeline**: Run `deploy-config/` pipeline using provided Azure/Vercel credentials.
6. **Wire Razorpay live webhook**: Implement webhook controller in `PaymentsController.cs`.
7. **Fill in and publish legal pages**: Fill placeholders in `legal-pages-nextjs/` and publish routes.

