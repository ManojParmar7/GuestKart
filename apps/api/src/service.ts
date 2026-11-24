import { createHash, createHmac, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import {
  AppError,
  adminInput,
  categoryInput,
  checkoutInput,
  fulfillmentInput,
  loginInput,
  orderStatus,
  productInput,
  publicAdmin,
  slugify,
  type Admin,
  type Order,
  type Product,
  type PublicAdmin,
} from './domain.js';
import type { Store } from './store.js';

export interface Settings {
  jwtSecret: string;
  webOrigin: string;
  stripeSecret?: string;
  stripeWebhookSecret?: string;
  production: boolean;
  databaseMode: string;
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const notFound = () => new AppError(404, 'This record could not be found.');
const requireSuper = (admin: PublicAdmin) => {
  if (admin.role !== 'SUPER_ADMIN') throw new AppError(403, 'Super Admin access required.');
};
export class ShopService {
  stripe: Stripe | null;
  constructor(
    public store: Store,
    public settings: Settings,
  ) {
    this.stripe = settings.stripeSecret ? new Stripe(settings.stripeSecret) : null;
  }
  async login(input: unknown) {
    const data = loginInput.parse(input);
    const admin = (await this.store.all('admins')).find((a) => a.email === data.email);
    // A fixed dummy hash keeps unknown-user requests on the password verification path.
    const valid = await bcrypt.compare(
      data.password,
      admin?.passwordHash ?? '$2b$12$9lmNeRaX9CkIDFtEuI69c.MXnlJt5h3h1dLWmw6XdZ6jGGx7Oxfqi',
    );
    if (!admin || !admin.active || !valid)
      throw new AppError(401, 'Email or password is incorrect.');
    return {
      admin: publicAdmin(admin),
      token: jwt.sign({ sub: admin.id }, this.settings.jwtSecret, {
        expiresIn: '8h',
        issuer: 'guestkart',
        audience: 'guestkart-admin',
      }),
    };
  }
  async authenticate(token?: string): Promise<PublicAdmin | null> {
    if (!token) return null;
    try {
      const payload = jwt.verify(token, this.settings.jwtSecret, {
        issuer: 'guestkart',
        audience: 'guestkart-admin',
        algorithms: ['HS256'],
      });
      if (typeof payload === 'string' || !payload.sub) return null;
      const admin = await this.store.get('admins', payload.sub);
      return admin?.active ? publicAdmin(admin) : null;
    } catch {
      return null;
    }
  }
  async catalog(
    query: {
      search?: string;
      category?: string;
      sort?: string;
      page?: string;
      limit?: string;
    } = {},
  ) {
    const search = query.search?.trim().toLowerCase().slice(0, 120) ?? '';
    const categories = await this.store.all('categories');
    let products = (await this.store.all('products')).filter(
      (p) =>
        p.active &&
        (!search || `${p.name} ${p.description}`.toLowerCase().includes(search)) &&
        (!query.category || p.categoryId === query.category),
    );
    switch (query.sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      default:
        products.sort(
          (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
        );
    }
    const page = Math.max(1, Math.floor(Number(query.page) || 1));
    const limit = Math.min(60, Math.max(1, Math.floor(Number(query.limit) || 12)));
    return {
      products: products.slice((page - 1) * limit, page * limit),
      categories,
      total: products.length,
      page,
      limit,
      stripeEnabled: Boolean(this.stripe),
      demoMode: this.settings.databaseMode === 'memory',
    };
  }
  async product(slug: string) {
    const product = (await this.store.all('products')).find(
      (p) => p.active && (p.id === slug || p.slug === slug),
    );
    if (!product) throw notFound();
    return product;
  }
  trackingToken(id: string, idempotencyKey: string) {
    return createHmac('sha256', this.settings.jwtSecret)
      .update(`track:${id}:${idempotencyKey}`)
      .digest('hex');
  }
  async checkout(input: unknown) {
    const data = checkoutInput.parse(input);
    if (data.paymentMethod === 'STRIPE' && !this.stripe)
      throw new AppError(400, 'Card payments are not configured. Please use cash on delivery.');
    if (new Set(data.items.map((item) => item.productId)).size !== data.items.length)
      throw new AppError(400, 'Combine duplicate cart items before checkout.');
    const idempotencyHash = hash(data.idempotencyKey);
    const requestHash = hash(
      JSON.stringify({
        ...data,
        idempotencyKey: undefined,
        items: [...data.items].sort((a, b) => a.productId.localeCompare(b.productId)),
      }),
    );
    const order = await this.store.transaction(async (store) => {
      const existing = (await store.all('orders')).find(
        (o) => o.idempotencyHash === idempotencyHash,
      );
      if (existing) {
        if (existing.requestHash !== requestHash)
          throw new AppError(
            409,
            'This checkout key was already used for a different cart. Start a new checkout.',
          );
        return existing;
      }
      const id = randomUUID();
      const items: Order['items'] = [];
      for (const line of data.items) {
        const p = await store.get('products', line.productId);
        if (!p?.active)
          throw new AppError(409, 'A product is no longer available. Please refresh your cart.');
        if (p.stock < line.quantity)
          throw new AppError(409, `Only ${p.stock} of ${p.name} remain.`);
        const owner = await store.get('admins', p.ownerId);
        if (!owner?.active) throw new AppError(409, `${p.name} is temporarily unavailable.`);
        items.push({
          productId: p.id,
          name: p.name,
          image: p.image,
          price: p.price,
          quantity: line.quantity,
          ownerId: p.ownerId,
          status: 'PLACED',
        });
        await store.put('products', { ...p, stock: p.stock - line.quantity });
      }
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 249900 ? 0 : 9900;
      const order: Order = {
        id,
        number: `GK-${id.slice(0, 8).toUpperCase()}`,
        trackingHash: hash(this.trackingToken(id, data.idempotencyKey)),
        idempotencyHash,
        requestHash,
        customer: data.customer,
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'COD' ? 'COD' : 'PENDING',
        stripeSessionId: null,
        createdAt: new Date().toISOString(),
      };
      await store.put('orders', order);
      return order;
    });
    const trackingToken = this.trackingToken(order.id, data.idempotencyKey);
    let paymentUrl: string | null = null;
    if (order.paymentMethod === 'STRIPE' && order.paymentStatus === 'PENDING') {
      const session = await this.stripe!.checkout.sessions.create(
        {
          mode: 'payment',
          payment_method_types: ['card'],
          customer_email: order.customer.email,
          client_reference_id: order.id,
          metadata: { orderId: order.id },
          line_items: [
            ...order.items.map((item) => ({
              quantity: item.quantity,
              price_data: {
                currency: 'inr',
                unit_amount: item.price,
                product_data: { name: item.name },
              },
            })),
            ...(order.shipping
              ? [
                  {
                    quantity: 1,
                    price_data: {
                      currency: 'inr',
                      unit_amount: order.shipping,
                      product_data: { name: 'Standard delivery' },
                    },
                  },
                ]
              : []),
          ],
          success_url: `${this.settings.webOrigin}/track?order=${order.id}#${trackingToken}`,
          cancel_url: `${this.settings.webOrigin}/track?order=${order.id}#${trackingToken}`,
        },
        { idempotencyKey: `guestkart-${order.id}` },
      );
      await this.store.transaction(async (store) => {
        const latest = await store.get('orders', order.id);
        if (latest) await store.put('orders', { ...latest, stripeSessionId: session.id });
      });
      paymentUrl = session.url;
    }
    return { order: this.safeOrder(order), trackingToken, paymentUrl };
  }
  safeOrder(order: Order) {
    const {
      trackingHash: _,
      idempotencyHash: __,
      requestHash: ___,
      stripeSessionId: ____,
      ...safe
    } = order;
    const activeItems = order.items.filter((item) => item.status !== 'CANCELLED');
    const currentTotal =
      activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
      (activeItems.length ? order.shipping : 0);
    return { ...safe, currentTotal, status: orderStatus(order) };
  }
  async track(id: string, token: string) {
    const order = await this.store.get('orders', id);
    if (!order || order.trackingHash !== hash(token)) throw notFound();
    return this.safeOrder(order);
  }
  async resumePayment(id: string, token: string) {
    await this.track(id, token);
    const order = await this.store.get('orders', id);
    if (!this.stripe || !order?.stripeSessionId || order.paymentStatus !== 'PENDING')
      throw new AppError(409, 'This order has no payment session ready to resume.');
    const session = await this.stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.status !== 'open' || !session.url)
      throw new AppError(409, 'This payment session is closed. Refresh order status shortly.');
    return { url: session.url };
  }
  async paymentEvent(event: Stripe.Event) {
    if (!['checkout.session.completed', 'checkout.session.expired'].includes(event.type)) return;
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return;
    await this.store.transaction(async (store) => {
      const order = await store.get('orders', orderId);
      if (!order || order.paymentMethod !== 'STRIPE' || order.paymentStatus !== 'PENDING') return;
      if (order.stripeSessionId && order.stripeSessionId !== session.id)
        throw new AppError(400, 'Payment session mismatch.');
      if (event.type === 'checkout.session.completed') {
        if (
          session.payment_status !== 'paid' ||
          session.amount_total !== order.total ||
          session.currency !== 'inr'
        )
          throw new AppError(400, 'Payment details do not match the order.');
        await store.put('orders', { ...order, stripeSessionId: session.id, paymentStatus: 'PAID' });
      } else {
        for (const item of order.items) {
          const product = await store.get('products', item.productId);
          if (product)
            await store.put('products', { ...product, stock: product.stock + item.quantity });
        }
        await store.put('orders', {
          ...order,
          paymentStatus: 'CANCELLED',
          items: order.items.map((i) => ({ ...i, status: 'CANCELLED' })),
        });
      }
    });
  }
  async adminData(admin: PublicAdmin) {
    const superAdmin = admin.role === 'SUPER_ADMIN';
    const products = (await this.store.all('products')).filter(
      (p) => superAdmin || p.ownerId === admin.id,
    );
    const orders = (await this.store.all('orders'))
      .flatMap((order) => {
        const items = order.items.filter((item) => superAdmin || item.ownerId === admin.id);
        if (!items.length) return [];
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return [
          this.safeOrder({
            ...order,
            items,
            subtotal,
            shipping: superAdmin ? order.shipping : 0,
            total: subtotal + (superAdmin ? order.shipping : 0),
          }),
        ];
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const completed = orders.filter((o) => ['PAID', 'COD'].includes(o.paymentStatus));
    const sold = completed.flatMap((o) => o.items).filter((i) => i.status === 'DELIVERED');
    return {
      admin,
      products,
      orders,
      categories: await this.store.all('categories'),
      admins: superAdmin ? (await this.store.all('admins')).map(publicAdmin) : [],
      stats: {
        orders: orders.length,
        guests: new Set(orders.map((o) => o.customer.email)).size,
        products: products.length,
        sold: sold.reduce((sum, item) => sum + item.quantity, 0),
        revenue: sold.reduce((sum, item) => sum + item.quantity * item.price, 0),
        lowStock: products.filter((p) => p.active && p.stock <= 5).length,
      },
    };
  }
  async saveProduct(admin: PublicAdmin, id: string | null, input: unknown) {
    const data = productInput.parse(input);
    return this.store.transaction(async (store) => {
      const existing = id ? await store.get('products', id) : null;
      if (id && !existing) throw notFound();
      if (
        admin.role !== 'SUPER_ADMIN' &&
        (data.ownerId !== admin.id || (existing && existing.ownerId !== admin.id))
      )
        throw new AppError(403, 'You can only manage your assigned products.');
      if (!(await store.get('categories', data.categoryId)))
        throw new AppError(400, 'Choose an existing category.');
      if (!(await store.get('admins', data.ownerId))?.active)
        throw new AppError(400, 'Choose an active product owner.');
      const productId = id ?? randomUUID();
      const product: Product = {
        ...data,
        id: productId,
        slug: `${slugify(data.name)}-${productId.slice(0, 8)}`,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      await store.put('products', product);
      return product;
    });
  }
  async saveCategory(admin: PublicAdmin, input: unknown) {
    requireSuper(admin);
    const { name } = categoryInput.parse(input);
    const slug = slugify(name);
    if (!slug) throw new AppError(400, 'Use a category name containing letters or numbers.');
    return this.store.transaction(async (store) => {
      if ((await store.all('categories')).some((c) => c.slug === slug))
        throw new AppError(409, 'This category already exists.');
      const category = { id: randomUUID(), name, slug };
      await store.put('categories', category);
      return category;
    });
  }
  async createAdmin(admin: PublicAdmin, input: unknown) {
    requireSuper(admin);
    const { password, ...data } = adminInput.parse(input);
    const passwordHash = await bcrypt.hash(password, 12);
    return this.store.transaction(async (store) => {
      if ((await store.all('admins')).some((a) => a.email === data.email))
        throw new AppError(409, 'This email is already registered.');
      const created: Admin = {
        ...data,
        passwordHash,
        id: randomUUID(),
        role: 'SUB_ADMIN',
        active: true,
      };
      await store.put('admins', created);
      return publicAdmin(created);
    });
  }
  async setAdminActive(admin: PublicAdmin, id: string, active: boolean) {
    requireSuper(admin);
    if (typeof active !== 'boolean') throw new AppError(400, 'Active must be true or false.');
    return this.store.transaction(async (store) => {
      const target = await store.get('admins', id);
      if (!target || target.role !== 'SUB_ADMIN')
        throw new AppError(400, 'Only Sub Admin accounts can be changed here.');
      await store.put('admins', { ...target, active });
      return true;
    });
  }
  async fulfill(admin: PublicAdmin, id: string, input: unknown) {
    const { productId, status } = fulfillmentInput.parse(input);
    return this.store.transaction(async (store) => {
      const order = await store.get('orders', id);
      if (!order) throw notFound();
      const item = order.items.find((i) => i.productId === productId);
      if (!item) throw notFound();
      if (admin.role !== 'SUPER_ADMIN' && item.ownerId !== admin.id)
        throw new AppError(403, 'This order item is not assigned to you.');
      if (order.paymentStatus === 'PENDING' || order.paymentStatus === 'CANCELLED')
        throw new AppError(409, 'This payment is not ready for fulfillment.');
      const allowed: Record<string, string[]> = {
        PLACED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
      };
      if (!allowed[item.status]?.includes(status))
        throw new AppError(409, 'This order status transition is not allowed.');
      // Paid orders need a refund workflow before cancellation, so prevent accidental refunds-by-label.
      if (status === 'CANCELLED' && order.paymentStatus === 'PAID')
        throw new AppError(409, 'Paid orders require a refund through Stripe before cancellation.');
      if (status === 'CANCELLED') {
        const product = await store.get('products', productId);
        if (product)
          await store.put('products', { ...product, stock: product.stock + item.quantity });
      }
      item.status = status;
      if (order.items.every((i) => i.status === 'CANCELLED')) order.paymentStatus = 'CANCELLED';
      await store.put('orders', order);
      return true;
    });
  }
}
