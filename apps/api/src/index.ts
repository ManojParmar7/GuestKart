import mongoose from 'mongoose';
import { env } from './config.js';
import { MemoryStore, MongoStore } from './store.js';
import { seedStore } from './fixtures.js';
import { ShopService } from './service.js';
import { createApp } from './app.js';

const store =
  env.DATABASE_MODE === 'mongo' ? await MongoStore.connect(env.MONGODB_URI!) : new MemoryStore();
if (env.DATABASE_MODE === 'memory') {
  await seedStore(store, env.ADMIN_EMAIL, env.ADMIN_PASSWORD, true);
  console.log(
    'Demo mode: in-memory products and orders reset on restart. Do not use for real orders.',
  );
}
const service = new ShopService(store, {
  jwtSecret: env.JWT_SECRET,
  webOrigin: env.WEB_ORIGIN,
  stripeSecret: env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  production: env.NODE_ENV === 'production',
  databaseMode: env.DATABASE_MODE,
});
const { app, apollo } = await createApp(service);
const server = app.listen(env.PORT, (error?: Error) => {
  if (error) {
    console.error(`API failed to listen on port ${env.PORT}: ${error.message}`);
    process.exit(1);
  }
  console.log(`GuestKart API listening on http://localhost:${env.PORT}`);
});
let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  server.close(async () => {
    await apollo.stop();
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
