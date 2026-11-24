# GuestKart Frontend

GuestKart has two frontend experiences: a public guest shopping storefront and a role-based operations dashboard.

## Features

- Product catalogue with search, category filters, availability, and product pricing from the GraphQL API.
- Persistent guest bag with quantity changes, remove item, delivery estimate, and cash-on-delivery checkout.
- Checkout validates live prices and inventory on the backend before placing the order.
- Order confirmation and private order-status refresh using the order number, email, and browser-held checkout token.
- Existing dashboard at `/dashboard` for Super Admin, Sub Admin, and Delivery Boy accounts.

## Run locally

From this directory:

```bash
npm install --legacy-peer-deps
```

Create `\.env\.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the backend first, then run:

```bash
npm run dev
```

Open `http://localhost:3000` for the storefront. The operations dashboard remains at `http://localhost:3000/dashboard`.

## Demo roles and logins

These accounts are seeded by the backend for local development. Change or remove them before using a public deployment.

| Role         | Email                       | Password            |
| ------------ | --------------------------- | ------------------- |
| Super Admin  | `manojsuperadmin@gmail.com` | `manoj@1234567`     |
| Sub Admin    | `subadmin@example.com`      | `manojsubadmin@123` |
| Delivery Boy | `deliveryboy1@gmail.com`    | `12345678`          |

Guest shopping does not require an account. Customers can browse, add products to the bag, submit contact and delivery details, place a COD order, then refresh its status from the confirmation panel.

## Project layout

- `next/src/app/shop/` — public storefront, cart, and guest checkout.
- `next/src/app/dashboard/` — role-based store operations.
- `next/src/app/auth/` — staff sign-in, registration, and password reset.
- `next/src/app/apolloClient/` — GraphQL client used by dashboard screens.
