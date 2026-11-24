import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { ZodError } from 'zod';
import { AppError, type PublicAdmin } from './domain.js';
import { graphqlMiddleware } from './graphql.js';
import type { ShopService } from './service.js';

export async function createApp(service: ShopService) {
  const app = express();
  app.disable('x-powered-by');
  // Set only when behind a known single reverse proxy; do not trust arbitrary X-Forwarded-For.
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: service.settings.webOrigin, credentials: true }));
  app.use(
    rateLimit({ windowMs: 60000, limit: 150, standardHeaders: 'draft-8', legacyHeaders: false }),
  );
  app.get('/health', (_, res) =>
    res.json({ status: 'ok', database: service.settings.databaseMode }),
  );
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json', limit: '256kb' }),
    async (req, res) => {
      if (!service.stripe || !service.settings.stripeWebhookSecret)
        throw new AppError(503, 'Stripe is not configured.');
      const signature = req.headers['stripe-signature'];
      if (typeof signature !== 'string') throw new AppError(400, 'Missing webhook signature.');
      let event;
      try {
        event = service.stripe.webhooks.constructEvent(
          req.body,
          signature,
          service.settings.stripeWebhookSecret,
        );
      } catch {
        throw new AppError(400, 'Invalid webhook signature.');
      }
      await service.paymentEvent(event);
      res.json({ received: true });
    },
  );
  app.use(express.json({ limit: '64kb' }), cookieParser());
  // Browsers must supply our exact same-origin/custom header on every write.
  // Cross-origin requests require a successful preflight; non-browser API clients use the header too.
  app.use('/api', (req, _res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (req.headers['x-guestkart-client'] !== 'web')
        return next(new AppError(403, 'Missing client header.'));
      const origin = req.headers.origin;
      if (origin && origin !== service.settings.webOrigin)
        return next(new AppError(403, 'This request origin is not allowed.'));
    }
    next();
  });
  const cookieOptions = {
    httpOnly: true,
    secure: service.settings.production,
    sameSite: 'lax' as const,
    path: '/api',
  };
  const auth: RequestHandler = async (req, res, next) => {
    const admin = await service.authenticate(
      req.cookies.gk_session ?? req.headers.authorization?.replace(/^Bearer /, ''),
    );
    if (!admin) throw new AppError(401, 'Please sign in to continue.');
    res.locals.admin = admin;
    next();
  };
  const adminOf = (res: express.Response) => res.locals.admin as PublicAdmin;
  app.get('/api/catalog', async (req, res) =>
    res.json(await service.catalog(req.query as Record<string, string>)),
  );
  app.get('/api/products/:slug', async (req, res) =>
    res.json(await service.product(String(req.params.slug))),
  );
  app.post('/api/checkout', rateLimit({ windowMs: 60000, limit: 12 }), async (req, res) =>
    res.status(201).json(await service.checkout(req.body)),
  );
  app.post('/api/orders/track', async (req, res) => {
    if (
      typeof req.body.id !== 'string' ||
      typeof req.body.token !== 'string' ||
      req.body.token.length > 128
    )
      throw new AppError(400, 'Enter the order ID and tracking key.');
    res.json(await service.track(req.body.id, req.body.token));
  });
  app.post('/api/orders/payment', async (req, res) => {
    if (
      typeof req.body.id !== 'string' ||
      typeof req.body.token !== 'string' ||
      req.body.token.length > 128
    )
      throw new AppError(400, 'Enter the order ID and tracking key.');
    res.json(await service.resumePayment(req.body.id, req.body.token));
  });
  app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60000, limit: 15 }), async (req, res) => {
    const result = await service.login(req.body);
    res
      .cookie('gk_session', result.token, { ...cookieOptions, maxAge: 8 * 3600000 })
      .json({ admin: result.admin });
  });
  app.post('/api/auth/logout', (_req, res) =>
    res.clearCookie('gk_session', cookieOptions).json({ ok: true }),
  );
  app.get('/api/auth/me', auth, (_req, res) => res.json({ admin: adminOf(res) }));
  app.get('/api/admin/dashboard', auth, async (_req, res) =>
    res.json(await service.adminData(adminOf(res))),
  );
  app.post('/api/admin/products', auth, async (req, res) =>
    res.status(201).json(await service.saveProduct(adminOf(res), null, req.body)),
  );
  app.put('/api/admin/products/:id', auth, async (req, res) =>
    res.json(await service.saveProduct(adminOf(res), String(req.params.id), req.body)),
  );
  app.post('/api/admin/categories', auth, async (req, res) =>
    res.status(201).json(await service.saveCategory(adminOf(res), req.body)),
  );
  app.post('/api/admin/accounts', auth, async (req, res) =>
    res.status(201).json(await service.createAdmin(adminOf(res), req.body)),
  );
  app.patch('/api/admin/accounts/:id', auth, async (req, res) =>
    res.json({
      ok: await service.setAdminActive(adminOf(res), String(req.params.id), req.body.active),
    }),
  );
  app.patch('/api/admin/orders/:id', auth, async (req, res) =>
    res.json({ ok: await service.fulfill(adminOf(res), String(req.params.id), req.body) }),
  );
  const graphql = await graphqlMiddleware(service);
  app.use('/api/graphql', graphql.middleware);
  app.use((_req, _res, next) => next(new AppError(404, 'Endpoint not found.')));
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    if (error?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON request.' });
      return;
    }
    if (error?.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request is too large.' });
      return;
    }
    console.error('Request failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  };
  app.use(errorHandler);
  return { app, apollo: graphql.server };
}
