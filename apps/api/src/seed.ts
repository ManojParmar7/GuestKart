import mongoose from 'mongoose';
import { env } from './config.js';
import { MongoStore } from './store.js';
import { seedStore } from './fixtures.js';
if (!env.MONGODB_URI) throw new Error('Set MONGODB_URI before running the seed.');
if (env.NODE_ENV === 'production' && process.argv.includes('--demo'))
  throw new Error('Demo seed is disabled in production.');
try {
  const store = await MongoStore.connect(env.MONGODB_URI);
  await seedStore(store, env.ADMIN_EMAIL, env.ADMIN_PASSWORD, process.argv.includes('--demo'));
  console.log('Seed complete. Existing stores are left unchanged.');
} finally {
  await mongoose.disconnect();
}
