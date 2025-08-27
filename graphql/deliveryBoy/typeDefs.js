const gql = String.raw;

const typeDefs = gql`
  # ================== USER ==================
  type Role {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    phone: String
  }
  type Product {
    id: ID
    name: String
    price: Float
    stock: Int
  }

  # ================== ORDER ==================
  type Order {
    id: ID!
    product: Product
    amount: Float!
    status: String!
    subAdminId: ID
    superAdminId: ID
    deliveryBoy: User
    createdAt: String!
    updatedAt: String!
  }

  # ================== RESPONSES ==================
  type OrderResponse {
    success: Boolean!
    message: String!
    order: Order
  }

  type OrdersResponse {
    success: Boolean!
    message: String!
    orders: [Order]
  }

  # ================== MUTATIONS ==================
  extend type Mutation {
    # Assign order to delivery boy (done by subadmin)
    assignOrderToDeliveryBoy(orderId: ID!, deliveryBoyId: ID!): OrderResponse

    acceptOrder(orderId: ID!): OrderResponse
    deliverOrder(orderId: ID!): OrderResponse
  }

  # ================== QUERIES ==================
  extend type Query {
    getOrdersForDeliveryBoy(deliveryBoyId: ID!): OrdersResponse
  }
`;

module.exports = typeDefs;
