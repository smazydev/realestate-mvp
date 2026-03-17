# MVP Implementation Plan — Property Matchmaker

## Roadmap alignment (3-week MVP)

| Week | Scope | Implementation status |
|------|--------|------------------------|
| **Week 1** | Project setup (Next.js + Supabase) | ✅ Next.js 15 App Router, TypeScript, Tailwind, Supabase SSR + migrations |
| | Auth and agent account setup | ✅ Login/signup, middleware, profiles + agents, get-or-create agent |
| | Database schema (agents, buyers, criteria, properties) | ✅ `profiles`, `agents`, `buyers`, `buyer_target_locations`, `property_searches`, `property_matches`, `email_logs` |
| | Privacy and data isolation | ✅ RLS on all tables; agent-scoped + admin policies |
| | Buyer management (create, edit, view, delete) | ✅ Modals for Add/Edit; card view; filters; delete from card |
| **Week 2** | Property input / property search page | ✅ Address Search: address input, geocode, save property, map (Leaflet) |
| | Matching logic (property ↔ buyer criteria) | ✅ City/neighborhood/zip matching; `property_matches` on save |
| | Results page for matched buyers | ✅ Matches shown on Address Search (and Property Searches list → view matches) |
| | Basic role handling | ✅ Admin vs agent; admin CRUD + forms for profiles/agents; agent selector when admin |
| **Week 3** | Email action to contact matched buyers | ✅ Resend; template; email from property result; `email_logs` |
| | Dashboard polish and UX cleanup | ✅ Empty/loading states, toasts, modals, nav |
| | E2E testing of main flows | Manual; no automated E2E in repo |
| | Deployment and MVP handoff | ✅ Build passes; setup steps in this doc |

**Included in total scope (all covered):**

- **Agent accounts** — Sign up → profile + agent row; admin can create/edit agents.
- **Buyer upload and management** — Add/Edit/Delete buyers and target locations (modals); filters.
- **Property input / property search** — Address Search: enter address, geocode, save; Property Searches list.
- **Buyer-to-property matching** — Automatic on save; score + reasons; shown on property view.
- **Email matched buyers** — Send from property result; default template; logged.
- **Privacy and isolation** — RLS; agents see only own data; admin has full access.
- **Lean SaaS MVP deployment** — Vercel-ready; env-based config; seed script for demo data.

---

## 1. Gap analysis

### What already exists
- **Stack**: Next.js 15 (App Router), TypeScript, Tailwind, Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`), Zod.
- **Types**: `AppRole = "admin" | "agent"` in `types/index.ts`.
- **Supabase**: Server and browser clients in `lib/supabase/server.ts` and `lib/supabase/client.ts`; no DB schema or migrations.
- **UI shell**: Dashboard layout with Sidebar (Buyers, Property Searches, Address Search, Seller Leads), Header, Breadcrumb.
- **Pages (mock only)**:
  - **Buyers** (`/buyers`): Card grid from `mockBuyerCards`, “Add Buyer” button, filter placeholders.
  - **Property Searches** (`/property-searches`): Table of buyer criteria (mock data; page is misused as buyer table).
  - **Address Search** (`/address-search`): Map placeholder, address input, no real search or save.
  - **Seller Leads** (`/seller-leads`): Mock table (out of MVP scope; left as-is).
- **Mock data**: `lib/mock-data.ts` (buyers, property rows, seller leads, `formatCurrency`).
- **Env**: `.env.example` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.

### What is missing or incomplete
- **Auth**: No sign-in/sign-up, no middleware, no protected routes, no profile/role storage.
- **Database**: No tables, migrations, or RLS.
- **Agents**: No `agents` table or “current agent” resolution from auth.
- **Buyers**: No CRUD, no DB; card view is mock-only; no create/edit/delete or real filters.
- **Property search**: No save, no geocode, no map library, no matching.
- **Matching**: No engine, no `property_matches` table.
- **Email**: No provider, no templates, no logging.
- **Privacy**: No RLS; no tenant isolation.

### What will be added or changed
- **Auth & roles**: Supabase Auth, login/callback routes, middleware protecting dashboard, `profiles` with `role`, RLS.
- **Schema**: `profiles`, `agents`, `buyers`, `buyer_target_locations`, `property_searches`, `property_matches`, `email_logs`; migrations + RLS.
- **Buyer management**: Real CRUD via server actions, card view from DB, Add/Edit/Delete, filters by city/neighborhood, assign to current agent.
- **Property search**: Address input, optional geocode scaffold, save as `property_searches`, lightweight map (e.g. Leaflet or Mapbox), trigger matching.
- **Matching engine**: V1 by city/neighborhood/zip; write `property_matches` on property create/update; show match reasons in UI.
- **Email**: Resend for sending; default template; log in `email_logs`; env for API key.
- **Privacy**: RLS so agents only CRUD their own buyers, property_searches, and email_logs; matching limited to own buyers for MVP (see tradeoffs).
- **UX**: Loading/empty states, basic toasts, clear nav (Buyers, Property Search).

---

## 2. Feature breakdown

| Feature | Description |
|--------|-------------|
| A. Auth & roles | Supabase Auth; profiles.role (admin/agent); middleware; RLS on profiles. |
| B. Schema | All 7 tables; FKs; indexes; RLS policies. |
| C. Buyer management | List (cards), create, edit, delete, target locations, budget, notes, filter by city/neighborhood. |
| D. Property search | Enter address, optional geocode, save property_searches, show on map, trigger matching. |
| E. Matching | On property save: match by city/neighborhood/zip; insert property_matches; show in UI. |
| F. Email | Resend; template with property context; log in email_logs; send to matched buyer/agent. |
| G. Privacy | RLS: agents see only own buyers, property_searches, email_logs; matching = own buyers only. |
| H. UX | Dashboard nav, empty/loading states, toasts. |

---

## 3. Schema

- **profiles** (extends auth.users): `id` (uuid, PK), `full_name`, `email`, `role` (admin/agent), `created_at`.
- **agents**: `id` (uuid), `user_id` (FK profiles/auth), `display_name`, `email`, `brokerage_name` (nullable), `created_at`. 1:1 with user for agents.
- **buyers**: `id`, `agent_id`, `buyer_name`, `budget_min`, `budget_max`, `notes`, `status`, `buyer_email` (nullable, for contact), `created_at`, `updated_at`.
- **buyer_target_locations**: `id`, `buyer_id`, `city`, `neighborhood`, `zip_code` (all nullable where appropriate).
- **property_searches**: `id`, `agent_id`, `raw_address`, `normalized_address`, `city`, `neighborhood`, `zip_code`, `lat`, `lng`, `price`, `notes`, `created_at`, `updated_at`.
- **property_matches**: `id`, `property_id` (property_searches), `buyer_id`, `match_score`, `match_reasons` (jsonb), `created_at`.
- **email_logs**: `id`, `property_id`, `buyer_id`, `sender_agent_id`, `recipient_email`, `subject`, `body`, `status`, `provider_message_id`, `created_at`.

Naming: using `property_searches` for the “saved property / search record” entity to align with “property search” in the product.

---

## 4. Auth / role model

- **Sign-in**: Email/password (or magic link) via Supabase Auth; redirect to dashboard.
- **Post-auth**: On first sign-in, `profiles` row created (trigger or app logic) with `role = 'agent'` unless set to admin.
- **Admin**: Set `profiles.role = 'admin'` manually in DB (or later via invite); admin can have broader RLS if needed (MVP: same as agent for simplicity, or admin can see all; we keep RLS agent-scoped and do not implement admin override in MVP).
- **Middleware**: Protect `/(dashboard)/*` and `/`; redirect unauthenticated to `/login`.

---

## 5. RLS policy summary

- **profiles**: Users can read/update own row; service role or trigger creates row on signup.
- **agents**: Users can read/update own agent row (where `user_id = auth.uid()`); insert for self on first use.
- **buyers**: Select/insert/update/delete where `agent_id` = current user’s agent id.
- **buyer_target_locations**: Select/insert/update/delete where buyer belongs to current agent (via `buyers.agent_id`).
- **property_searches**: Select/insert/update/delete where `agent_id` = current user’s agent id.
- **property_matches**: Select where the `property_searches` row belongs to current agent; insert/delete only via backend (e.g. server action using service role or same-agent checks).
- **email_logs**: Select/insert where `sender_agent_id` = current user’s agent id.

Helper: `current_agent_id()` (or equivalent) via security definer function or subquery so RLS can use “current agent” consistently.

---

## 6. Matching logic (V1)

- **When**: On insert/update of `property_searches` (same-agent only).
- **Rules**:  
  - Exact **city** match → include buyer.  
  - **Neighborhood** match (if property has neighborhood) → add reason, boost score.  
  - **Zip** match (if both sides have zip) → add reason, boost score.  
- **Output**: Rows in `property_matches` with `match_score` (e.g. 0–100) and `match_reasons` (e.g. `["target_city_match","neighborhood_match"]`).
- **Scope**: Only buyers belonging to the **same agent** (no cross-agent matching in MVP).

Modular: matching implemented in a single server-side function (or API route) that can be replaced/extended later.

---

## 7. Email workflow

- **Provider**: Resend; env `RESEND_API_KEY` (and optional `FROM` address).
- **Trigger**: From property result UI: “Email matched buyers/agents” → open flow with default template (property address, match count, optional body).
- **Template**: Editable subject/body before send; include property context (e.g. raw_address).
- **Log**: After send, insert `email_logs` (property_id, buyer_id if applicable, sender_agent_id, recipient_email, subject, body, status, provider_message_id).
- **Recipients**: MVP: send to matched buyer’s `buyer_email` or their agent’s email (configurable in UI: “Email buyer” vs “Email agent”).

---

## 8. Setup steps

1. **Supabase**: Create a project at supabase.com. In the SQL Editor, run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls.sql`
2. **Env**: Copy `.env.example` to `.env`. Set:
   - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from same
   - `RESEND_API_KEY` — from resend.com (required for sending email)
   - `RESEND_FROM` — optional; defaults to `onboarding@resend.dev`
3. **Auth**: In Supabase Dashboard → Authentication → Providers, enable Email. (Sign-up is enabled by default; use `/signup` to create accounts.)
4. **Profile creation**: Handled by DB trigger `handle_new_user` on `auth.users` insert — creates `profiles` with role `agent`. Agent row is created on first use (e.g. when creating a buyer) via `getOrCreateCurrentAgent()`.
5. **Geocoding**: Uses Nominatim (OpenStreetMap) by default; no API key. For production, replace `lib/geocode.ts` with a paid provider and set `GEOCODE_API_KEY` if needed.
6. **Run**: `pnpm install && pnpm dev`. Open http://localhost:3000; redirect to `/login` if not authenticated. Sign up at `/signup`, then use Buyers and Address Search.

7. **Seed mock data** (optional): Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (from Supabase Dashboard → Settings → API → service_role). Run `pnpm run seed`. This creates auth users (admin@example.com, oranshevach@example.com, galmoshe@example.com) with password `seedpassword123`, sets one as admin, creates agents, buyers with target locations, property searches, property matches, and email logs. Re-running seed skips creating duplicate buyers/properties if data already exists.

---

## 9. Known tradeoffs / future improvements

- **Matching scope**: MVP matches only the current agent’s buyers. Cross-agent “network” matching can be added later with minimal match payload exposure.
- **Admin**: No separate admin UI; set `profiles.role = 'admin'` in DB if needed; RLS can be extended for admin override.
- **Seller leads**: Page kept as mock; not part of MVP.
- **Geocoding**: Scaffolded only; no key = no geocode; address can still be saved and matched on city/neighborhood/zip if parsed manually or added later.
- **Map**: One lightweight map library; fallback to list-only if map fails.
- **Property Searches list**: Lists saved `property_searches` for the agent; clicking a row can go to a detail view (e.g. same address-search page with id) to see matches and send email.

---

## 10. Files created or modified

| Action | Path |
|--------|------|
| Create | `MVP_IMPLEMENTATION_PLAN.md` (this file) |
| Create | `supabase/migrations/001_initial_schema.sql` |
| Create | `supabase/migrations/002_rls.sql` |
| Create | `middleware.ts` (auth protection, session refresh) |
| Create | `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` |
| Create | `app/(auth)/layout.tsx` |
| Create | `app/auth/callback/route.ts` |
| Create | `lib/auth.ts` (get user, profile, get-or-create agent) |
| Create | `lib/db/types.ts`, `lib/db/queries.ts` |
| Create | `lib/validations/buyer.ts`, `property.ts`, `email.ts` (Zod) |
| Create | `app/actions/buyers.ts`, `properties.ts`, `email.ts` |
| Create | `lib/email/resend.ts` (send + log to email_logs) |
| Create | `lib/matching/engine.ts` (V1 city/neighborhood/zip matching) |
| Create | `lib/geocode.ts` (Nominatim scaffold) |
| Create | `components/map/simple-map.tsx` (Leaflet) |
| Create | `components/buyers/buyer-card.tsx`, `buyer-form.tsx`, `buyer-filters.tsx` |
| Create | `components/address-search/address-search-content.tsx`, `email-match-form.tsx` |
| Modify | `app/layout.tsx` (Toaster from sonner) |
| Modify | `app/(dashboard)/layout.tsx` (auth check, pass user to sidebar) |
| Modify | `app/(dashboard)/buyers/page.tsx` (real data, filters, Add Buyer link) |
| Create | `app/(dashboard)/buyers/new/page.tsx`, `app/(dashboard)/buyers/[id]/edit/page.tsx` |
| Modify | `app/(dashboard)/address-search/page.tsx` (server data + AddressSearchContent) |
| Modify | `app/(dashboard)/property-searches/page.tsx` (list saved property_searches, link to address-search?id=) |
| Modify | `components/layout/sidebar.tsx` (user props, real sign-out) |
| Modify | `.env.example` (RESEND_API_KEY, RESEND_FROM) |
| Modify | `app/globals.css` (import leaflet.css) |
| Add deps | `resend`, `sonner`, `leaflet`, `react-leaflet`, `@types/leaflet` |

---

## 11. Conflicts / decisions

- **Property Searches page**: Previously showed buyer criteria (mock). Repurposed to list **saved property search records** for the logged-in agent; Address Search remains the primary “search address → save → see matches → email” flow.
- **Matching**: Spec allows “match across network”; MVP implements **own-buyers only** for safety and simplicity; document and extend later.
- **Agent creation**: One agent per user; agent row created on first need (e.g. when creating a buyer or property) via “get or create” in server code.
