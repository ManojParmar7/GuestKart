const gql = String.raw;

module.exports = gql`
  input GuestCartLineInput {
    productId: ID!
    quantity: Int!
  }

  input GuestContactInput {
    name: String!
    email: String!
    phone: String!
    address: String!
  }

  type GuestOrderLine {
    productId: ID!
    name: String!
    image: String
    unitPrice: Float!
    quantity: Int!
  }

  type GuestOrder {
    orderNumber: String!
    status: String!
    items: [GuestOrderLine!]!
    subtotal: Float!
    delivery: Float!
    total: Float!
    createdAt: String!
  }

  type GuestCheckoutResponse {
    success: Boolean!
    message: String!
    order: GuestOrder
    trackingToken: String
  }

  extend type Query {
    trackGuestOrder(orderNumber: String!, email: String!, trackingToken: String!): GuestOrder
  }

  extend type Mutation {
    checkoutAsGuest(items: [GuestCartLineInput!]!, contact: GuestContactInput!, idempotencyKey: String!): GuestCheckoutResponse!
  }
`;
