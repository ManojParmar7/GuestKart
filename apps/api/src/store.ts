import mongoose, { type ClientSession } from 'mongoose';
import type { Tables } from './domain.js';

export interface Store {
  all<K extends keyof Tables>(table: K): Promise<Tables[K][]>;
  get<K extends keyof Tables>(table: K, id: string): Promise<Tables[K] | null>;
  put<K extends keyof Tables>(table: K, value: Tables[K]): Promise<void>;
  remove<K extends keyof Tables>(table: K, id: string): Promise<void>;
  transaction<T>(fn: (store: Store) => Promise<T>): Promise<T>;
}
export class MemoryStore implements Store {
  private data = new Map<string, Map<string, unknown>>();
  private queue: Promise<void> = Promise.resolve();
  async all<K extends keyof Tables>(table: K): Promise<Tables[K][]> {
    return structuredClone([...(this.data.get(table)?.values() ?? [])]) as Tables[K][];
  }
  async get<K extends keyof Tables>(table: K, id: string): Promise<Tables[K] | null> {
    return structuredClone(this.data.get(table)?.get(id) ?? null) as Tables[K] | null;
  }
  async put<K extends keyof Tables>(table: K, value: Tables[K]) {
    if (!this.data.has(table)) this.data.set(table, new Map());
    this.data.get(table)!.set(value.id, structuredClone(value));
  }
  async remove<K extends keyof Tables>(table: K, id: string) {
    this.data.get(table)?.delete(id);
  }
  async transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    // Work on a private snapshot: concurrent readers never see uncommitted writes.
    const draft = new MemoryStore();
    draft.data = structuredClone(this.data);
    try {
      const result = await fn(draft);
      this.data = draft.data;
      return result;
    } finally {
      release();
    }
  }
}

const schemas = {
  admins: new mongoose.Schema(
    { id: { type: String, unique: true }, email: { type: String, unique: true } },
    { strict: false, versionKey: false },
  ),
  categories: new mongoose.Schema(
    { id: { type: String, unique: true }, slug: { type: String, unique: true } },
    { strict: false, versionKey: false },
  ),
  products: new mongoose.Schema(
    {
      id: { type: String, unique: true },
      slug: { type: String, unique: true },
      ownerId: { type: String, index: true },
      categoryId: { type: String, index: true },
    },
    { strict: false, versionKey: false },
  ),
  orders: new mongoose.Schema(
    {
      id: { type: String, unique: true },
      idempotencyHash: { type: String, unique: true },
      createdAt: { type: String, index: true },
    },
    { strict: false, versionKey: false },
  ),
};
const models = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, mongoose.model(name, schema)]),
);
export class MongoStore implements Store {
  constructor(private session?: ClientSession) {}
  async all<K extends keyof Tables>(table: K): Promise<Tables[K][]> {
    return (await models[table]!.find({}, { _id: 0 })
      .session(this.session ?? null)
      .lean()) as unknown as Tables[K][];
  }
  async get<K extends keyof Tables>(table: K, id: string): Promise<Tables[K] | null> {
    return (await models[table]!.findOne({ id }, { _id: 0 })
      .session(this.session ?? null)
      .lean()) as unknown as Tables[K] | null;
  }
  async put<K extends keyof Tables>(table: K, value: Tables[K]) {
    await models[table]!.replaceOne({ id: value.id }, value, {
      upsert: true,
      session: this.session,
    });
  }
  async remove<K extends keyof Tables>(table: K, id: string) {
    await models[table]!.deleteOne({ id }, { session: this.session });
  }
  async transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();
    try {
      return (await session.withTransaction(() => fn(new MongoStore(session))))!;
    } finally {
      await session.endSession();
    }
  }
  static async connect(uri: string) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    await Promise.all(Object.values(models).map((model) => model.init()));
    return new MongoStore();
  }
}
