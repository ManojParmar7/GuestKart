import { z } from 'zod';

export type Role = 'SUPER_ADMIN' | 'SUB_ADMIN';
export type Fulfillment = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export interface Admin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
}
export type PublicAdmin = Omit<Admin, 'passwordHash'>;
export interface Category {
  id: string;
  name: string;
  slug: string;
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string;
  accent: string;
  featured: boolean;
  active: boolean;
  ownerId: string;
  createdAt: string;
}
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  ownerId: string;
  status: Fulfillment;
}
export interface Address {
  name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}
export interface Order {
  id: string;
  number: string;
  trackingHash: string;
  idempotencyHash: string;
  requestHash: string;
  customer: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'COD' | 'STRIPE';
  paymentStatus: 'PENDING' | 'PAID' | 'COD' | 'CANCELLED';
  stripeSessionId: string | null;
  createdAt: string;
}
export interface Tables {
  admins: Admin;
  categories: Category;
  products: Product;
  orders: Order;
}
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const publicAdmin = ({ passwordHash: _, ...admin }: Admin): PublicAdmin => admin;
export const money = (amount: number) => Number.isSafeInteger(amount) && amount >= 0;
const text = (max: number) => z.string().trim().min(1).max(max);
const id = z.string().uuid();
export const productInput = z
  .object({
    name: text(120),
    description: text(2000),
    categoryId: id,
    price: z.number().int().min(100).max(100000000),
    compareAtPrice: z.number().int().min(100).max(100000000).nullable().default(null),
    stock: z.number().int().min(0).max(100000),
    image: z.url().refine((value) => value.startsWith('https://'), 'Use an HTTPS image URL'),
    accent: z.enum(['sage', 'peach', 'blue', 'lilac', 'sand']).default('sage'),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    ownerId: id,
  })
  .refine((value) => value.compareAtPrice === null || value.compareAtPrice >= value.price, {
    message: 'Compare price must be at least the selling price',
    path: ['compareAtPrice'],
  });
export const addressInput = z.object({
  name: text(100),
  email: z
    .email()
    .max(200)
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d ()-]{10,18}$/, 'Enter a valid phone number'),
  line1: text(250),
  city: text(100),
  state: text(100),
  postalCode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a six digit Indian PIN code'),
});
export const checkoutInput = z.object({
  customer: addressInput,
  items: z
    .array(z.object({ productId: id, quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(40),
  paymentMethod: z.enum(['COD', 'STRIPE']),
  idempotencyKey: z.string().uuid(),
});
export const adminInput = z.object({
  name: text(100),
  email: z
    .email()
    .max(200)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
});
export const loginInput = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});
export const categoryInput = z.object({ name: text(80) });
export const fulfillmentInput = z.object({
  productId: id,
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const orderStatus = (order: Pick<Order, 'items'>): Fulfillment => {
  const active = order.items.filter((item) => item.status !== 'CANCELLED');
  if (!active.length) return 'CANCELLED';
  const steps: Fulfillment[] = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  return steps[Math.min(...active.map((item) => steps.indexOf(item.status)))]!;
};
