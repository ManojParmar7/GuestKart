# API reference

Browser base: `/api`. Direct development API: `http://localhost:4100/api`.

Writes require JSON and `X-GuestKart-Client: web`; browser origins must match `WEB_ORIGIN`. Signed Stripe webhooks are exempt. Errors return `{ "error": "Readable message" }` with an HTTP status.

| Method | Path                  | Purpose/access                                    |
| ------ | --------------------- | ------------------------------------------------- |
| GET    | `/catalog`            | Public search/filter/sort/pagination              |
| GET    | `/products/:slug`     | Active product by slug or UUID                    |
| POST   | `/checkout`           | Public guest checkout/retry                       |
| POST   | `/orders/track`       | Order ID + private token                          |
| POST   | `/orders/payment`     | Same ID/token; resume an open Stripe session      |
| POST   | `/auth/login`         | Email/password; sets HTTP-only cookie             |
| POST   | `/auth/logout`        | Clear cookie                                      |
| GET    | `/auth/me`            | Current active admin                              |
| GET    | `/admin/dashboard`    | Role-scoped data and stats                        |
| POST   | `/admin/products`     | Create product; Sub Admin must own it             |
| PUT    | `/admin/products/:id` | Replace editable product fields                   |
| POST   | `/admin/categories`   | Super Admin: `{ name }`                           |
| POST   | `/admin/accounts`     | Super Admin: `{ name, email, password }`          |
| PATCH  | `/admin/accounts/:id` | Super Admin: `{ active }`, Sub Admin targets only |
| PATCH  | `/admin/orders/:id`   | `{ productId, status }`, ownership checked        |
| POST   | `/stripe/webhook`     | Signed Stripe event                               |

Catalog keys: `search`, `category` (UUID), `sort` (`featured`, `newest`, `price-asc`, `price-desc`), `page` (one-based), `limit` (1–60, default 12). The response includes products, categories, total, page, limit, stripeEnabled and demoMode.

Checkout body:

```json
{
  "customer": {
    "name": "Demo Buyer",
    "email": "buyer@example.com",
    "phone": "9876543210",
    "line1": "12 Test Street",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "postalCode": "380001"
  },
  "items": [{ "productId": "PRODUCT_UUID", "quantity": 1 }],
  "paymentMethod": "COD",
  "idempotencyKey": "NEW_UUID"
}
```

Response: `{ order, trackingToken, paymentUrl }`. Redirect to paymentUrl for Stripe; otherwise show tracking. Retain the checkout key for retries, use a new key for changed checkout content. Prices come from the server. Tracking body: `{ "id": "ORDER_UUID", "token": "PRIVATE_KEY" }`. All monetary amounts are integer paise. Orders include original `total` and adjusted `currentTotal`, which excludes cancelled items and clears shipping when all items are cancelled.

Product fields: name, description, categoryId, price, nullable compareAtPrice, stock, HTTPS image, accent (sage/peach/blue/lilac/sand), featured, active and ownerId. Unchecking active archives without destroying order history. API clients may authenticate using a Bearer JWT; browser login deliberately returns no token in JSON.

## GraphQL

Endpoint `/api/graphql` shares service rules with REST. Production disables introspection. Query depth is limited.

```graphql
query {
  catalog(sort: "price-asc", limit: 8) {
    products {
      id
      name
      price
      stock
    }
    categories {
      id
      name
    }
    total
  }
}
```

Queries: catalog, product(slug), me, trackOrder(id, token), dashboard. Mutations: checkout(input), updateFulfillment(orderId, productId, status). Product/category/team administration uses REST.

`GET /health` (outside `/api`) reports API readiness and configured storage mode.
