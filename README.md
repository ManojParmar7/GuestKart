# GuestKart

**Shop as a guest. Leave as a regular.** A guest-first store with a persistent bag, one-click return to private parcel tracking, and a role-based store workspace.

Built with **Next.js, TypeScript, Tailwind CSS, Material UI, Express, GraphQL, MongoDB, JWT and optional Stripe Checkout**. This repository contains a working application, with useful code rather than an arbitrary line count.

![GuestKart storefront preview](docs/screenshots/storefront.jpg)

## Quick start

Requires **Node.js 20.19+** and npm 10+. From the repository root:

```sh
npm install
npm run dev
```

- Store: **http://localhost:3000**
- Admin: **http://localhost:3000/admin**
- API health: **http://localhost:4100/health**

Development automatically seeds eight products into memory. **Demo orders make no real deliveries and all data resets on API restart.** Use fictional customer details. Public demo credentials are rejected in production.

## Roles and demo login

There are **three roles**: Super Admin, Sub Admin and Guest. Only the two admin roles sign in. Both use **http://localhost:3000/admin**.

| Role        | Demo email              | Demo password         | What to try                                           |
| ----------- | ----------------------- | --------------------- | ----------------------------------------------------- |
| Super Admin | `admin@guestkart.local` | `GuestKartDemo!2026`  | All products/orders, categories, team and assignments |
| Sub Admin   | `staff@guestkart.local` | `GuestKartStaff!2026` | Four assigned sample products and their order items   |
| Guest       | No email/password login | No password           | Shop, checkout and track with a private link          |

These accounts are created automatically in memory demo mode. Persistent MongoDB seeds only the configured owner unless you explicitly use the development `--demo` seed. Public demo accounts must never be used for a real store.

### Guest walkthrough

Open the store → search/filter the collection → open a product → add to bag → adjust quantities → checkout as a guest → enter delivery details → choose COD → accept starter terms → place the demo order → save/copy the private tracking link. Return through **Track your order** using the order ID and tracking key. The browser remembers the latest order locally. No signup, OTP or customer password is needed.

### Super Admin walkthrough

Sign in with the owner demo account → review Overview → open Categories to add a category → open Products to add/edit price, image, stock and visibility → select an assigned owner → open Team to create or disable a Sub Admin → open Orders after a guest checkout → advance each item through Processing, Shipped and Delivered. Unshipped COD items can be cancelled after confirmation. Refresh the dashboard to see current counts and delivered revenue.

### Sub Admin walkthrough

Sign out and sign in with the staff demo account → review the scoped Overview → edit only assigned products → place a guest order containing one assigned product → open Orders → update only the assigned line through fulfillment. Categories and Team administration are not available. In a mixed order, another owner's items and merchandise values are excluded from this dashboard.

### Card payment walkthrough

Configure Stripe test keys and the signed webhook first → restart the API → choose card at guest checkout → continue to hosted Stripe Checkout → complete a test payment → return to private tracking → refresh until the verified webhook marks payment paid → fulfill from the workspace. An open pending session can be resumed from tracking. An abandoned session remains pending until Stripe expiration releases its inventory. Without Stripe configuration, COD works and the card option stays disabled.

### Suggested demo acceptance run

Place one COD order as a guest, save its tracking link, sign in as Super Admin and move its items to Processing. Check the private tracking page again, then sign in as Sub Admin and verify that only assigned lines appear. Cancel a separate unshipped COD item and verify its stock returns. Restart the API to reset the memory demo. For persistent orders, configure MongoDB before testing.

## Guest flow

1. Browse products; search, filter categories and sort by price, newest or featured.
2. Open product details, add items to the bag and adjust quantities.
3. Check out without an account using name, email, phone and an Indian address.
4. Choose cash on delivery, or Stripe card payment when configured.
5. The server confirms current prices, calculates delivery and atomically reserves stock.
6. Save the private tracking link and follow each item's fulfillment status.

The bag survives a browser reload. Shipping is ₹99, waived at ₹2,499 merchandise value. Amounts are stored as integer INR paise; displayed prices include applicable taxes. This is a starter pricing rule, not a tax compliance engine.

## Store workspace

| Capability                              | Super Admin  | Sub Admin                     |
| --------------------------------------- | ------------ | ----------------------------- |
| Products, inventory, archive visibility | All products | Assigned products             |
| Change product owners                   | Yes          | No                            |
| Add categories                          | Yes          | No                            |
| Create/enable/disable Sub Admins        | Yes          | No                            |
| Guest orders                            | All          | Orders containing their items |
| Fulfillment updates                     | Every item   | Their assigned items          |
| Metrics                                 | Entire store | Assigned merchandise only     |

Sub Admins see only their items and merchandise totals in a mixed order, alongside the delivery details required for fulfillment. Existing order-item assignments remain unchanged if a product is reassigned later. Disabling an account immediately invalidates its sessions.

Fulfillment: **Placed → Processing → Shipped → Delivered**. Unshipped COD items can be cancelled; stock is restored once. A mixed order reports the earliest stage of its non-cancelled items. Revenue means **delivered merchandise value**, excluding shipping. Orders refresh on load, after changes or with the Refresh button; no websocket service is implied.

## Configuration

The default demo requires no environment file. To customize it, copy the root example to the API workspace:

```powershell
Copy-Item .env.example apps/api/.env
```

```sh
# macOS / Linux
cp .env.example apps/api/.env
```

The workspace scripts read `apps/api/.env`. Never commit secrets.

### Persistent MongoDB

Use MongoDB Atlas or a local **replica set**: checkout uses multi-document transactions, so standalone MongoDB is insufficient.

```dotenv
DATABASE_MODE=mongo
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/guestkart
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=your-unique-password-at-least-12-characters
JWT_SECRET=your-random-secret-at-least-32-characters
```

```sh
npm run seed
npm run dev
```

The seed creates an initial Super Admin only if there are no admins. Existing accounts and passwords are not overwritten. Add real categories/products through the workspace. For a development database with sample products: `npm run seed -w @guestkart/api -- --demo`.

### Stripe

Set **both** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`. Use test keys for development.

```sh
stripe listen --forward-to localhost:4100/api/stripe/webhook
```

Copy the listener's signing secret to the environment and restart the API. Subscribe production webhooks to `checkout.session.completed` and `checkout.session.expired`. Checkout uses hosted card payments; delayed payment methods are excluded. Card data never passes through the app.

Stock is reserved before payment. Only a signed, amount-checked completion event marks an order paid; expiration releases stock idempotently. The browser redirect is not proof of payment. Abandoned sessions hold stock until Stripe expires them, normally within 24 hours. Monitor/replay failed webhooks. If a checkout request fails, retry the same checkout from the same browser session; stable application and Stripe idempotency keys prevent duplicates. See [payment recovery](docs/DEPLOYMENT.md).

## Commands

```sh
npm run dev          # API :4100 and Next.js :3000
npm run typecheck    # Both workspaces
npm test             # Business-flow and HTTP integration tests
npm run build        # API compile and production Next.js build
npm run seed         # Initialize persistent MongoDB store
```

Production uses separate processes/terminals:

```sh
npm run start -w @guestkart/api
npm run start -w @guestkart/web
```

Set web `API_URL` before building if the backend is not at `http://localhost:4100`. Next.js proxies browser `/api/*` requests to that backend. Set API `WEB_ORIGIN` to the exact public frontend origin. See [deployment](docs/DEPLOYMENT.md).

## Structure

```text
apps/api/src/
  app.ts          Express routes, cookies, request protection and errors
  config.ts       Environment validation and production guards
  domain.ts       Domain types and Zod validation
  fixtures.ts     Initial owner and demo catalog
  graphql.ts      GraphQL catalog, checkout, tracking and dashboard
  service.ts      Pricing, authorization, payment and fulfillment
  store.ts        Transactional memory and MongoDB adapters
  shop.test.ts    Business and HTTP integration tests
apps/web/src/
  app/            Store, cart, checkout, tracking, admin and policies
  components/     Shared navigation, cart state and product browsing
  lib/            Typed API client and view types
docs/             Architecture, API and deployment documentation
```

## Safeguards and verification

HTTP-only SameSite admin cookies, Secure cookies in production, bcrypt passwords, active-account checks, server-side role/item permissions, private tracking keys, input/body-size validation, origin checks, rate limits, stock transactions and checkout idempotency are implemented. Tests cover concurrent stock requests, transaction rollback, retries, tracking privacy, role boundaries, fulfillment and payment events. CI runs type checking, tests and a build.

Automated tests use the memory adapter and simulated Stripe events. A live MongoDB replica-set check and Stripe test-mode checkout/webhook run are required before deployment. This starter has not undergone a production security audit.

The local verification run passed **29 automated tests**, type checking and the production build. Browser verification covered guest checkout, bag persistence, private tracking, Sub Admin fulfillment, Super Admin team access, product search and desktop/mobile layouts. The screenshot above shows the verified storefront.

## Scope and limitations

Implemented: guest shopping, persistent browser cart, COD checkout, configurable Stripe checkout, private tracking, product/category/team management, scoped fulfillment and metrics.

Not included: automated refunds/returns, email/SMS notifications, password reset/MFA, variants, image uploads, discounts, tax invoices, carrier integrations, customer accounts, immutable audit logs or distributed rate limiting. Paid-order cancellation is blocked until a refund workflow is implemented. After partial COD cancellation, screens show the remaining payable merchandise plus the original shipping fee. The API also preserves the original purchase total; fully cancelled orders have a current total of zero.

The current repository adapter filters/aggregates collections in application memory; use indexed database queries and load testing before scaling. Pending payments need operational monitoring: there is no background reconciliation worker.

Replace sample products/photos and starter policy pages with actual business identity, support contact and delivery/return/privacy terms before accepting real customers. Product photos use external Unsplash URLs; check your asset rights for live use.

Read [architecture](docs/ARCHITECTURE.md), [API reference](docs/API.md) and [deployment](docs/DEPLOYMENT.md). GitHub: [ManojParmar7/GuestKart](https://github.com/ManojParmar7/GuestKart).
