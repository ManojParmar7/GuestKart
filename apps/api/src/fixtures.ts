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
    const names = ['At home', 'Tech & sound', 'Bags & carry', 'Out & about'];
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
        'Studio headphones in mustard',
        'A considered studio headset in bright mustard. Cushioned over-ear comfort, USB-C charging and a long-play battery for everything on your list.',
        349900,
        499900,
        18,
        'photo-1505740420928-5e560c06d30e',
        'peach',
        1,
      ],
      [
        'Market-day canvas carryall',
        'A sturdy canvas tote sized for market mornings and everything after. Reinforced handles, a useful inner pocket and room for the unscheduled extras.',
        89900,
        119900,
        32,
        'photo-1553062407-98eeb64c6a62',
        'sage',
        2,
      ],
      [
        'Speckled stoneware cup',
        'Hand-finished stoneware with a soft speckle glaze and an easy, comfortable handle. A new favorite for the first cup of the day. Capacity: 350 ml.',
        64900,
        null,
        24,
        'photo-1514228742587-6b1558fcca3d',
        'sand',
        0,
      ],
      [
        'Pocket speaker in cobalt',
        'A small cobalt-blue speaker with a surprisingly full sound. Splash resistant and ready for up to 12 hours away from the wall.',
        229900,
        299900,
        9,
        'photo-1608043152269-423dbba4e7e1',
        'blue',
        1,
      ],
      [
        'Weekender pack in lilac',
        'A light lilac pack that takes the long way around. Room for a 15-inch laptop, a weather-resistant shell and a pocket for the things that wander.',
        249900,
        329900,
        14,
        'photo-1622260614153-03223fb72052',
        'lilac',
        2,
      ],
      [
        'The cold-stays bottle',
        'Double-wall steel for long days out. The 750 ml bottle keeps a cold drink cold for up to 18 hours.',
        119900,
        149900,
        40,
        'photo-1602143407151-7111542de6e8',
        'sage',
        3,
      ],
      [
        'Late-light table lamp',
        'An adjustable table lamp for the hour after the to-do list. Three gentle settings, a warm glow and a compact footprint.',
        189900,
        null,
        5,
        'photo-1507473885765-e6ed057f782c',
        'peach',
        0,
      ],
      [
        'Rooftop-run trainers',
        'Breathable mesh, flexible soles and a bright red finish for wherever the evening goes. Demo pair shown in standard size 8.',
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
