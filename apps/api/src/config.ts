import 'dotenv/config';
import { z } from 'zod';
const env = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(4100),
    WEB_ORIGIN: z.url().default('http://localhost:3000'),
    DATABASE_MODE: z.enum(['memory', 'mongo']).default('memory'),
    MONGODB_URI: z.string().optional(),
    JWT_SECRET: z.string().min(32).default('guestkart-development-secret-do-not-deploy-2026'),
    ADMIN_EMAIL: z.email().default('admin@guestkart.local'),
    ADMIN_PASSWORD: z.string().min(12).max(128).default('GuestKartDemo!2026'),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  })
  .parse(process.env);
if (env.DATABASE_MODE === 'mongo' && !env.MONGODB_URI)
  throw new Error('MONGODB_URI is required for MongoDB mode.');
if (env.STRIPE_SECRET_KEY && !env.STRIPE_WEBHOOK_SECRET)
  throw new Error('Configure STRIPE_WEBHOOK_SECRET together with STRIPE_SECRET_KEY.');
if (env.NODE_ENV === 'production') {
  if (env.DATABASE_MODE !== 'mongo')
    throw new Error('Production requires persistent MongoDB storage.');
  if (!env.WEB_ORIGIN.startsWith('https://'))
    throw new Error('Production requires an HTTPS WEB_ORIGIN.');
  if (!process.env.JWT_SECRET || /development|replace-this/.test(env.JWT_SECRET))
    throw new Error('Set a strong production JWT_SECRET.');
  if (!process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD === 'GuestKartDemo!2026')
    throw new Error('Set a unique ADMIN_PASSWORD.');
}
export { env };
