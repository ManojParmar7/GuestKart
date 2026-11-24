# GuestKart API

Node.js and Express API for the GuestKart marketplace. The service exposes a GraphQL endpoint, staff authentication and operations, product/catalogue queries, cart and order operations, file uploads, and optional Stripe payments.

## Requirements

- Node.js 20 or newer
- MongoDB
- Stripe keys only when enabling online payments or webhooks

## Local setup

```bash
npm ci
npm run dev
```

The default local database is `mongodb://127.0.0.1:27017/graphql_crud`. Set these variables in `.env` to override local defaults:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/graphql_crud
JWT_SECRET=replace-with-a-long-random-secret
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

The GraphQL endpoint is `http://localhost:8000/graphql`. Uploaded media is served under `/uploads`.

## Guest shopping flow

1. The storefront queries `getAllProducts` for catalogue data.
2. A guest keeps the bag in the browser and submits contact, delivery, and cart details with a unique checkout key.
3. `checkoutAsGuest` validates input and current stock, computes prices on the server, reserves inventory, then creates an order in the same `Order` collection used by the operations dashboard. Guest orders use cash on delivery.
4. The confirmation returns an order number and private tracking token. `trackGuestOrder` checks the order number, email, and token and returns its current status.

Orders can also move through the existing staff and delivery status workflow.

## Staff roles

The seed data defines three staff roles: `superadmin`, `subadmin`, and `deliveryBoy`. Local demo credentials are documented in the frontend README. These seeded accounts are for local development only.
