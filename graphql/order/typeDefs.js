const gql = String.raw;

module.exports = gql`
  type Product {
    id: ID
    name: String
    price: Float
    stock: Int
    # Add other necessary fields here
  }

  type User {
    id: ID
    name: String
    email: String
    # Add other necessary fields here
  }

  type OrderItem {
    product: Product
    quantity: Int
    price: Float
    discount: Float
    discountType: String
  }

  type ContactInfo {
    name: String
    email: String
    phone: String
    address: String
    # Add additional fields as needed
  }

  type Order {
    id: ID!
    sessionId: String
    subAdminId: ID
    user: User
    items: [OrderItem]
    totalAmount: Float
    paymentStatus: String
    orderStatus: String
    contactInfo: ContactInfo
    createdAt: String
  }

  type OrderResponse {
    success: Boolean!
    message: String!
    order: Order
    clientSecret: String
  }

  input ContactInfoInput {
    name: String
    email: String
    phone: String
    address: String
    # Add additional fields as needed
  }

  extend type Query {
    getGuestOrders(sessionId: String!, email: String, phone: String): [Order]
    getAdminOrders: [Order]
    getSuperAdminOrders: [Order]
  }
  extend type Mutation {
    placeOrder(
      sessionId: String!
      contactInfo: ContactInfoInput!
    ): OrderResponse
  }
`;
