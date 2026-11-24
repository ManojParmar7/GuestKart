import { beforeAll, beforeEach, afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import Stripe from 'stripe';
import { createApp } from './app.js';
import { seedStore } from './fixtures.js';
import { MemoryStore } from './store.js';
import { ShopService } from './service.js';
import { publicAdmin, type Product, type PublicAdmin, type Tables } from './domain.js';

const settings = {
  jwtSecret: 'test-secret-with-at-least-32-characters',
  webOrigin: 'http://localhost:3000',
  production: false,
  databaseMode: 'memory',
  stripeWebhookSecret: 'whsec_guestkart_test',
};
let service: ShopService;
let running: Awaited<ReturnType<typeof createApp>>;
let owner: PublicAdmin;
let seller: PublicAdmin;
let other: PublicAdmin;
let product: Product;
let baseline: { [K in keyof Tables]: Tables[K][] };
const customer = {
  name: 'Demo Buyer',
  email: 'buyer@example.com',
  phone: '9876543210',
  line1: '12 Test Street',
  city: 'Ahmedabad',
  state: 'Gujarat',
  postalCode: '380001',
};
const checkout = (quantity = 1) => ({
  customer,
  items: [{ productId: product.id, quantity }],
  paymentMethod: 'COD',
  idempotencyKey: randomUUID(),
});
const client = () => request(running.app);
const submit = (body: unknown) =>
  client().post('/api/checkout').set('X-GuestKart-Client', 'web').send(body);
beforeAll(async () => {
  const store = new MemoryStore();
  await seedStore(store, 'owner@example.com', 'OwnerPassword!2026', true);
  service = new ShopService(store, settings);
  owner = publicAdmin((await store.all('admins'))[0]!);
  seller = await service.createAdmin(owner, {
    name: 'Seller',
    email: 'seller@example.com',
    password: 'SellerPassword!2026',
  });
  other = await service.createAdmin(owner, {
    name: 'Other',
    email: 'other@example.com',
    password: 'OtherPassword!2026',
  });
  product = (await store.all('products'))[0]!;
  product = { ...product, ownerId: seller.id, stock: 5 };
  await store.put('products', product);
  baseline = {
    admins: await store.all('admins'),
    categories: await store.all('categories'),
    products: await store.all('products'),
    orders: [],
  };
  running = await createApp(service);
});
beforeEach(async () => {
  const store = new MemoryStore();
  for (const row of baseline.admins) await store.put('admins', row);
  for (const row of baseline.categories) await store.put('categories', row);
  for (const row of baseline.products) await store.put('products', row);
  service.store = store;
});
afterAll(async () => {
  await running.apollo.stop();
});
afterEach(() => {
  vi.restoreAllMocks();
  service.stripe = null;
});

describe('guest shopping and stock integrity', () => {
  it('filters, sorts and paginates the active catalog', async () => {
    const response = await client().get('/api/catalog?search=wireless&limit=1&sort=price-asc');
    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name.toLowerCase()).toContain('wireless');
    expect(response.body.demoMode).toBe(true);
  });
  it('uses server prices and creates a private trackable order without login', async () => {
    const response = await submit({ ...checkout(2), total: 1 });
    expect(response.status).toBe(201);
    expect(response.body.order.subtotal).toBe(product.price * 2);
    expect(response.body.order.trackingHash).toBeUndefined();
    expect(response.body.order.idempotencyHash).toBeUndefined();
    expect((await service.store.get('products', product.id))?.stock).toBe(3);
    const tracked = await client()
      .post('/api/orders/track')
      .set('X-GuestKart-Client', 'web')
      .send({ id: response.body.order.id, token: response.body.trackingToken });
    expect(tracked.status).toBe(200);
  });
  it('rejects incorrect tracking keys without exposing customer details', async () => {
    const order = await service.checkout(checkout());
    await expect(service.track(order.order.id, 'incorrect')).rejects.toMatchObject({ status: 404 });
  });
  it('returns the same order and token for a retried checkout', async () => {
    const body = checkout();
    const first = await service.checkout(body);
    const second = await service.checkout(body);
    expect(second.order.id).toBe(first.order.id);
    expect(second.trackingToken).toBe(first.trackingToken);
    expect((await service.store.get('products', product.id))?.stock).toBe(4);
    expect(await service.store.all('orders')).toHaveLength(1);
  });
  it('deduplicates concurrent checkout retries', async () => {
    const body = checkout();
    const results = await Promise.all([
      service.checkout(body),
      service.checkout(body),
      service.checkout(body),
    ]);
    expect(new Set(results.map((r) => r.order.id)).size).toBe(1);
    expect((await service.store.get('products', product.id))?.stock).toBe(4);
  });
  it('rejects reuse of a checkout key with a different payload', async () => {
    const body = checkout();
    await service.checkout(body);
    await expect(
      service.checkout({ ...body, customer: { ...customer, name: 'Different buyer' } }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it('prevents overselling under simultaneous guest orders', async () => {
    const results = await Promise.allSettled([
      service.checkout(checkout(4)),
      service.checkout(checkout(4)),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect((await service.store.get('products', product.id))?.stock).toBe(1);
  });
  it('rolls back earlier stock changes when any cart item is unavailable', async () => {
    const body = checkout();
    body.items.push({ productId: randomUUID(), quantity: 1 });
    await expect(service.checkout(body)).rejects.toMatchObject({ status: 409 });
    expect((await service.store.get('products', product.id))?.stock).toBe(5);
    expect(await service.store.all('orders')).toHaveLength(0);
  });
  it('rejects duplicate product rows, invalid quantities and invalid addresses', async () => {
    const body = checkout();
    expect((await submit({ ...body, items: [body.items[0], body.items[0]] })).status).toBe(400);
    expect((await submit(checkout(-1))).status).toBe(400);
    expect((await submit({ ...body, customer: { ...customer, postalCode: 'bad' } })).status).toBe(
      400,
    );
  });
  it('applies the shipping threshold on the server', async () => {
    const cheap = baseline.products.find((p) => p.price < 100000)!;
    const result = await service.checkout({
      ...checkout(),
      items: [{ productId: cheap.id, quantity: 1 }],
    });
    expect(result.order.shipping).toBe(9900);
    const large = await service.checkout(checkout());
    expect(large.order.shipping).toBe(0);
  });
  it('rejects unconfigured Stripe before reserving stock', async () => {
    expect((await submit({ ...checkout(), paymentMethod: 'STRIPE' })).status).toBe(400);
    expect((await service.store.get('products', product.id))?.stock).toBe(5);
  });
});

describe('admin authentication and assignment boundaries', () => {
  it('requires login for dashboard and rejects wrong credentials', async () => {
    expect((await client().get('/api/admin/dashboard')).status).toBe(401);
    const response = await client()
      .post('/api/auth/login')
      .set('X-GuestKart-Client', 'web')
      .send({ email: 'owner@example.com', password: 'incorrect' });
    expect(response.status).toBe(401);
  });
  it('uses an HTTP-only session cookie and returns no password hash', async () => {
    const response = await client()
      .post('/api/auth/login')
      .set('X-GuestKart-Client', 'web')
      .send({ email: 'owner@example.com', password: 'OwnerPassword!2026' });
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(response.body.admin.passwordHash).toBeUndefined();
    expect(response.body.token).toBeUndefined();
  });
  it('invalidates existing sessions as soon as a Sub Admin is disabled', async () => {
    const { token } = await service.login({ email: seller.email, password: 'SellerPassword!2026' });
    expect(await service.authenticate(token)).not.toBeNull();
    await service.setAdminActive(owner, seller.id, false);
    expect(await service.authenticate(token)).toBeNull();
  });
  it('limits product access and blocks privilege escalation', async () => {
    await expect(
      service.saveProduct(other, product.id, { ...product, ownerId: other.id }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      service.createAdmin(seller, {
        name: 'Escalate',
        email: 'bad@example.com',
        password: 'LongPassword!2026',
      }),
    ).rejects.toMatchObject({ status: 403 });
    const dashboard = await service.adminData(seller);
    expect(dashboard.products.map((p) => p.id)).toEqual([product.id]);
    expect(dashboard.admins).toHaveLength(0);
  });
  it('projects mixed orders to assigned merchandise only', async () => {
    const second = baseline.products.find((p) => p.id !== product.id)!;
    const body = checkout();
    body.items.push({ productId: second.id, quantity: 1 });
    await service.checkout(body);
    const dashboard = await service.adminData(seller);
    expect(dashboard.orders[0]!.items).toHaveLength(1);
    expect(dashboard.orders[0]!.total).toBe(product.price);
    expect(dashboard.orders[0]!.shipping).toBe(0);
    expect((await service.adminData(other)).orders).toHaveLength(0);
  });
  it('checks order item ownership and prevents skipping fulfillment states', async () => {
    const { order } = await service.checkout(checkout());
    await expect(
      service.fulfill(other, order.id, { productId: product.id, status: 'PROCESSING' }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      service.fulfill(seller, order.id, { productId: product.id, status: 'DELIVERED' }),
    ).rejects.toMatchObject({ status: 409 });
    for (const status of ['PROCESSING', 'SHIPPED', 'DELIVERED'])
      await service.fulfill(seller, order.id, { productId: product.id, status });
    expect((await service.adminData(seller)).stats.revenue).toBe(product.price);
  });
  it('restores stock only once when a COD item is cancelled', async () => {
    const { order } = await service.checkout(checkout(2));
    await service.fulfill(seller, order.id, { productId: product.id, status: 'CANCELLED' });
    await expect(
      service.fulfill(seller, order.id, { productId: product.id, status: 'CANCELLED' }),
    ).rejects.toMatchObject({ status: 409 });
    expect((await service.store.get('products', product.id))?.stock).toBe(5);
    expect((await service.adminData(seller)).orders[0]?.currentTotal).toBe(0);
  });
  it('reduces the payable total after partial COD cancellation without changing the original total', async () => {
    const second = baseline.products.find((p) => p.id !== product.id)!;
    const body = checkout();
    body.items.push({ productId: second.id, quantity: 1 });
    const { order } = await service.checkout(body);
    await service.fulfill(owner, order.id, { productId: product.id, status: 'CANCELLED' });
    const updated = (await service.adminData(owner)).orders[0]!;
    expect(updated.total).toBe(order.total);
    expect(updated.currentTotal).toBe(second.price + order.shipping);
  });
  it('allows category creation only for Super Admins and prevents duplicates', async () => {
    await expect(service.saveCategory(seller, { name: 'New' })).rejects.toMatchObject({
      status: 403,
    });
    await service.saveCategory(owner, { name: 'Office gear' });
    await expect(service.saveCategory(owner, { name: 'Office gear' })).rejects.toMatchObject({
      status: 409,
    });
  });
});

describe('payment events and HTTP boundaries', () => {
  it('verifies webhook signatures before processing payment events', async () => {
    service.stripe = new Stripe('sk_test_not_a_real_key');
    const payload = JSON.stringify({
      id: 'evt_test',
      type: 'unhandled.event',
      data: { object: {} },
    });
    const signature = service.stripe.webhooks.generateTestHeaderString({
      payload,
      secret: settings.stripeWebhookSecret,
    });
    const signed = await client()
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', signature)
      .send(payload);
    expect(signed.status).toBe(200);
    const invalid = await client()
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', 'invalid')
      .send(payload);
    expect(invalid.status).toBe(400);
  });
  it('resumes an open payment only with the correct private tracking key', async () => {
    const result = await service.checkout(checkout());
    const stored = (await service.store.get('orders', result.order.id))!;
    await service.store.put('orders', {
      ...stored,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PENDING',
      stripeSessionId: 'cs_test_resume',
    });
    service.stripe = new Stripe('sk_test_not_a_real_key');
    const retrieve = vi.spyOn(service.stripe.checkout.sessions, 'retrieve').mockResolvedValue({
      id: 'cs_test_resume',
      status: 'open',
      url: 'https://checkout.stripe.com/test',
    } as Stripe.Response<Stripe.Checkout.Session>);
    await expect(service.resumePayment(result.order.id, 'wrong-key')).rejects.toMatchObject({
      status: 404,
    });
    expect(retrieve).not.toHaveBeenCalled();
    expect(await service.resumePayment(result.order.id, result.trackingToken)).toEqual({
      url: 'https://checkout.stripe.com/test',
    });
    expect(retrieve).toHaveBeenCalledWith('cs_test_resume');
  });
  const eventFor = (type: string, id: string, total: number) =>
    ({
      type,
      data: {
        object: {
          id: 'cs_test_session',
          metadata: { orderId: id },
          payment_status: 'paid',
          amount_total: total,
          currency: 'inr',
        },
      },
    }) as unknown as Stripe.Event;
  async function pendingOrder() {
    const { order } = await service.checkout(checkout());
    const stored = (await service.store.get('orders', order.id))!;
    await service.store.put('orders', {
      ...stored,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PENDING',
      stripeSessionId: 'cs_test_session',
    });
    return order;
  }
  it('verifies payment amounts and processes payment confirmation idempotently', async () => {
    const order = await pendingOrder();
    await expect(
      service.paymentEvent(eventFor('checkout.session.completed', order.id, 1)),
    ).rejects.toMatchObject({ status: 400 });
    const event = eventFor('checkout.session.completed', order.id, order.total);
    await service.paymentEvent(event);
    await service.paymentEvent(event);
    expect((await service.store.get('orders', order.id))?.paymentStatus).toBe('PAID');
    expect((await service.store.get('products', product.id))?.stock).toBe(4);
    await expect(
      service.fulfill(owner, order.id, { productId: product.id, status: 'CANCELLED' }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it('releases an expired payment reservation once', async () => {
    const order = await pendingOrder();
    const event = eventFor('checkout.session.expired', order.id, order.total);
    await service.paymentEvent(event);
    await service.paymentEvent(event);
    expect((await service.store.get('products', product.id))?.stock).toBe(5);
    expect((await service.store.get('orders', order.id))?.paymentStatus).toBe('CANCELLED');
  });
  it('does not expire a paid order on a delayed expiration event', async () => {
    const order = await pendingOrder();
    await service.paymentEvent(eventFor('checkout.session.completed', order.id, order.total));
    await service.paymentEvent(eventFor('checkout.session.expired', order.id, order.total));
    expect((await service.store.get('orders', order.id))?.paymentStatus).toBe('PAID');
  });
  it('blocks fulfillment while card payment is pending', async () => {
    const order = await pendingOrder();
    await expect(
      service.fulfill(owner, order.id, { productId: product.id, status: 'PROCESSING' }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it('blocks missing client headers and foreign origins', async () => {
    expect((await client().post('/api/checkout').send(checkout())).status).toBe(403);
    expect(
      (
        await client()
          .post('/api/checkout')
          .set('X-GuestKart-Client', 'web')
          .set('Origin', 'https://untrusted.example')
          .send(checkout())
      ).status,
    ).toBe(403);
  });
  it('makes GraphQL catalog available but protects its dashboard', async () => {
    const response = await client()
      .post('/api/graphql')
      .set('X-GuestKart-Client', 'web')
      .send({ query: '{ catalog(limit: 2) { products { id name } total } }' });
    expect(response.status).toBe(200);
    expect(response.body.data.catalog.products).toHaveLength(2);
    const denied = await client()
      .post('/api/graphql')
      .set('X-GuestKart-Client', 'web')
      .send({ query: '{ dashboard { admin { email } } }' });
    expect(denied.body.errors[0].message).toContain('sign in');
  });
  it('returns a clear error for malformed JSON and unknown endpoints', async () => {
    expect(
      (
        await client()
          .post('/api/checkout')
          .set('X-GuestKart-Client', 'web')
          .set('Content-Type', 'application/json')
          .send('{')
      ).status,
    ).toBe(400);
    expect((await client().get('/api/does-not-exist')).status).toBe(404);
  });
});
