import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import depthLimit from 'graphql-depth-limit';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { AppError, type PublicAdmin } from './domain.js';
import type { ShopService } from './service.js';

interface Context {
  admin: PublicAdmin | null;
}
export async function graphqlMiddleware(service: ShopService) {
  const server = new ApolloServer<Context>({
    introspection: !service.settings.production,
    validationRules: [depthLimit(8)],
    typeDefs: `#graphql
      type Category { id: ID!, name: String!, slug: String! }
      type Product { id: ID!, name: String!, slug: String!, description: String!, categoryId: ID!, price: Int!, compareAtPrice: Int, stock: Int!, image: String!, featured: Boolean!, active: Boolean!, ownerId: ID! }
      type Catalog { products: [Product!]!, categories: [Category!]!, total: Int!, page: Int!, limit: Int!, stripeEnabled: Boolean!, demoMode: Boolean! }
      type Admin { id: ID!, name: String!, email: String!, role: String!, active: Boolean! }
      type Customer { name: String!, email: String!, phone: String!, line1: String!, city: String!, state: String!, postalCode: String! }
      type OrderItem { productId: ID!, name: String!, image: String!, price: Int!, quantity: Int!, ownerId: ID!, status: String! }
      type Order { id: ID!, number: String!, customer: Customer!, items: [OrderItem!]!, subtotal: Int!, shipping: Int!, total: Int!, currentTotal: Int!, paymentMethod: String!, paymentStatus: String!, createdAt: String!, status: String! }
      input AddressInput { name: String!, email: String!, phone: String!, line1: String!, city: String!, state: String!, postalCode: String! }
      input CartItemInput { productId: ID!, quantity: Int! }
      input CheckoutInput { customer: AddressInput!, items: [CartItemInput!]!, paymentMethod: String!, idempotencyKey: String! }
      type CheckoutResult { order: Order!, trackingToken: String!, paymentUrl: String }
      type Stats { orders: Int!, guests: Int!, products: Int!, sold: Int!, revenue: Int!, lowStock: Int! }
      type Dashboard { admin: Admin!, products: [Product!]!, orders: [Order!]!, categories: [Category!]!, admins: [Admin!]!, stats: Stats! }
      type Query { catalog(search: String, category: String, sort: String, page: Int, limit: Int): Catalog!, product(slug: String!): Product!, me: Admin, trackOrder(id: ID!, token: String!): Order!, dashboard: Dashboard! }
      type Mutation { checkout(input: CheckoutInput!): CheckoutResult!, updateFulfillment(orderId: ID!, productId: ID!, status: String!): Boolean! }
    `,
    resolvers: {
      Query: {
        catalog: (_, args) => service.catalog(args),
        product: (_, { slug }) => service.product(slug),
        me: (_, __, ctx) => ctx.admin,
        trackOrder: (_, { id, token }) => service.track(id, token),
        dashboard: (_, __, ctx) => {
          if (!ctx.admin) throw new AppError(401, 'Please sign in.');
          return service.adminData(ctx.admin);
        },
      },
      Mutation: {
        checkout: (_, { input }) => service.checkout(input),
        updateFulfillment: (_, { orderId, productId, status }, ctx) => {
          if (!ctx.admin) throw new AppError(401, 'Please sign in.');
          return service.fulfill(ctx.admin, orderId, { productId, status });
        },
      },
    },
    formatError(formatted, error) {
      const original = error instanceof GraphQLError ? error.originalError : null;
      if (original instanceof AppError)
        return { message: original.message, extensions: { code: `HTTP_${original.status}` } };
      if (original instanceof ZodError)
        return {
          message: original.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          extensions: { code: 'BAD_USER_INPUT' },
        };
      return service.settings.production
        ? { message: 'The request could not be completed.', extensions: { code: 'REQUEST_FAILED' } }
        : formatted;
    },
  });
  await server.start();
  return {
    server,
    middleware: expressMiddleware(server, {
      context: async ({ req }) => ({
        admin: await service.authenticate(
          req.cookies?.gk_session ?? req.headers.authorization?.replace(/^Bearer /, ''),
        ),
      }),
    }),
  };
}
