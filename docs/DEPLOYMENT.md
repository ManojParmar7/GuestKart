# Deployment and operations

Deploy two Node.js 20.19+ processes and a MongoDB replica set. Configure web `API_URL` before building; default is http://localhost:4100. Browser API requests use same-origin Next.js rewrites. Set API `WEB_ORIGIN` to the exact HTTPS frontend origin.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run seed
```

Run `npm run start -w @guestkart/api` and `npm run start -w @guestkart/web` in separate terminals or under a process manager. Expose the frontend over HTTPS and keep direct API access restricted as appropriate.

## Production environment

API requires NODE_ENV=production, DATABASE_MODE=mongo, MONGODB_URI, HTTPS WEB_ORIGIN, unique ADMIN_EMAIL/ADMIN_PASSWORD and a strong JWT_SECRET of at least 32 characters. Production startup rejects demo credentials, example secrets and memory mode. Keep secrets in the platform secret manager. The initial owner seed does not overwrite existing accounts; changing ADMIN_PASSWORD later does not reset an existing password.

Set TRUST_PROXY=1 only behind exactly one trusted reverse proxy that overwrites forwarded IP headers. Otherwise leave it unset. Multi-instance deployments need shared rate-limit storage; the starter limiter is process-local.

## Launch verification

- Replace sample catalog/photos and publish actual business identity, support details, delivery times, return terms and privacy practices.
- Verify replica-set transactions, simultaneous stock requests, backups, restricted database credentials and restore procedures.
- Test COD fulfillment, cancellation/restocking and Sub Admin scope with real browser sessions.
- Test Stripe test-mode checkout, signature rejection, completion, expiration and duplicate webhook delivery.
- Subscribe Stripe to checkout.session.completed and checkout.session.expired. If routing through the frontend, verify the proxy preserves raw body/signature.
- Verify secure session cookies over HTTPS. Monitor pending orders, API errors, payment failures and webhook deliveries.
- Define customer-data retention/deletion. The API health check does not replace database monitoring.

## Payment recovery

Stripe retries failed event deliveries. Monitor and replay failed signed events after recovery. The browser success URL is not payment evidence. Never blindly restore stock or mark an order paid after a network failure.

Pending orders with a session ID can be reconciled against Stripe. Expire abandoned sessions through Stripe and replay their signed expiration events to release inventory. Session-creation uncertainty can leave an order without a saved session ID: retry the original checkout key where available, inspect provider metadata/orderId, and reconcile before creating a new order or adjusting stock.

There is no automated reconciliation worker. Build one with durable jobs, provider state verification, transaction-guarded transitions and audit events before unattended high-volume use. Refunds must be processed and reconciled by an operator; automated paid-order cancellation is intentionally blocked. COD screens use the adjusted `currentTotal` after cancellation, while the API preserves the original purchase `total` for reference.

## Verification limits

Automated tests use the actual Express/GraphQL/service stack with the transactional memory adapter and simulated payment events. They do not prove a specific MongoDB cluster, Stripe account, reverse proxy or business policy is ready. Run live integration checks in the target environment before accepting real orders.
