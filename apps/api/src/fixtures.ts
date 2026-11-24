import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Store } from './store.js';
import { slugify, type Product } from './domain.js';

export async function seedStore(store: Store, email: string, password: string, demo: boolean) {
  if ((await store.all('admins')).length) return;
  const adminId = randomUUID();
  const staffId = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  const staffHash = demo ? await bcrypt.hash('GuestKartStaff!2026', 12) : '';
  await store.transaction(async (tx) => {
    if ((await tx.all('admins')).length) return;
    await tx.put('admins', {
      id: adminId,
      name: 'Store Owner',
      email: email.toLowerCase(),
      passwordHash,
      role: 'SUPER_ADMIN',
      active: true,
    });
    if (!demo) return;
    await tx.put('admins', {
      id: staffId,
      name: 'Demo Store Manager',
      email: 'staff@guestkart.local',
      passwordHash: staffHash,
      role: 'SUB_ADMIN',
      active: true,
    });
    const names = ['Home & living', 'Tech essentials', 'Everyday carry', 'Wellness'];
    const categories = names.map((name) => ({ id: randomUUID(), name, slug: slugify(name) }));
    for (const category of categories) await tx.put('categories', category);
    const products: [
      string,
      string,
      number,
      number | null,
      number,
      string,
      Product['accent'],
      number,
    ][] = [
      [
        'Studio wireless headphones',
        'Your own little quiet space. Cushioned over-ear headphones with balanced sound, USB-C charging and up to 30 hours of listening.',
        349900,
        499900,
        18,
        'photo-1505740420928-5e560c06d30e',
        'peach',
        1,
      ],
      [
        'Everyday canvas tote',
        'A dependable carryall for market mornings and everything after. Heavyweight cotton canvas, reinforced handles and a useful inner pocket.',
        89900,
        119900,
        32,
        'photo-1553062407-98eeb64c6a62',
        'sage',
        2,
      ],
      [
        'Slow morning ceramic cup',
        'Make a little room for your morning ritual. A tactile, glazed ceramic cup with a comfortable handle. Capacity: 350 ml.',
        64900,
        null,
        24,
        'photo-1514228742587-6b1558fcca3d',
        'sand',
        0,
      ],
      [
        'Pocket bluetooth speaker',
        'A compact companion for your favorite playlists. Rich portable sound, splash resistance and 12-hour battery life.',
        229900,
        299900,
        9,
        'photo-1608043152269-423dbba4e7e1',
        'blue',
        1,
      ],
      [
        'The everyday backpack',
        'Clean lines, clever pockets. A lightweight everyday backpack with a padded 15-inch laptop sleeve and weather-resistant finish.',
        249900,
        329900,
        14,
        'photo-1622260614153-03223fb72052',
        'lilac',
        2,
      ],
      [
        'Flow stainless steel bottle',
        'Keep your daily hydration close. A 750 ml double-wall stainless steel bottle that keeps drinks cold for up to 18 hours.',
        119900,
        149900,
        40,
        'photo-1602143407151-7111542de6e8',
        'sage',
        3,
      ],
      [
        'Warm glow desk lamp',
        'Soft light for focused evenings. A minimal adjustable desk lamp with three brightness settings and a warm, comfortable glow.',
        189900,
        null,
        5,
        'photo-1507473885765-e6ed057f782c',
        'peach',
        0,
      ],
      [
        'Move everyday sneakers',
        'An easy pair for busy days. Breathable mesh, flexible soles and lightweight cushioning. Demo product supplied in standard size 8.',
        299900,
        399900,
        12,
        'photo-1542291026-7eec264c27ff',
        'blue',
        3,
      ],
    ];
    for (const [
      index,
      [name, description, price, compareAtPrice, stock, photo, accent, category],
    ] of products.entries()) {
      const id = randomUUID();
      await tx.put('products', {
        id,
        name,
        slug: `${slugify(name)}-${id.slice(0, 8)}`,
        description,
        price,
        compareAtPrice,
        stock,
        image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=85`,
        accent,
        categoryId: categories[category]!.id,
        featured: index < 4,
        active: true,
        ownerId: index % 2 === 0 ? staffId : adminId,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
      });
    }
  });
}
