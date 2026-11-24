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
export interface CartLine {
  product: Product;
  quantity: number;
}
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  active: boolean;
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
export type Status = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  ownerId: string;
  status: Status;
}
export interface Order {
  id: string;
  number: string;
  customer: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currentTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: Status;
  createdAt: string;
}
export interface Catalog {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  stripeEnabled: boolean;
  demoMode: boolean;
}
export interface Dashboard {
  admin: Admin;
  products: Product[];
  orders: Order[];
  categories: Category[];
  admins: Admin[];
  stats: {
    orders: number;
    guests: number;
    products: number;
    sold: number;
    revenue: number;
    lowStock: number;
  };
}
export const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: value % 100 ? 2 : 0,
  }).format(value / 100);
export const label = (value: string) =>
  value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
