// const gql = String.raw;

// const typeDefs = gql`
//   # ================== USER ==================
//   type Role {
//     id: ID!
//     name: String!
//   }

//   type User {
//     id: ID!
//     name: String!
//     email: String!
//     role: Role!
//     phone: String
//   }
//   type Product {
//     id: ID
//     name: String
//     price: Float
//     stock: Int
//   }

//   # ================== ORDER ==================
//   type Order {
//     id: ID!
//     product: Product
//     amount: Float!
//     status: String!
//     subAdminId: ID
//     superAdminId: ID
//     deliveryBoy: User
//     createdAt: String!
//     updatedAt: String!
//   }

//   # ================== RESPONSES ==================
//   type OrderResponse {
//     success: Boolean!
//     message: String!
//     order: Order
//   }

//   type OrdersResponse {
//     success: Boolean!
//     message: String!
//     orders: [Order]
//   }

//   # ================== MUTATIONS ==================
//   extend type Mutation {
//     # Assign order to delivery boy (done by subadmin)
//     assignOrderToDeliveryBoy(orderId: ID!, deliveryBoyId: ID!): OrderResponse

//     acceptOrder(orderId: ID!): OrderResponse
//     deliverOrder(orderId: ID!): OrderResponse
//   }

//   # ================== QUERIES ==================
//   extend type Query {
//     getOrdersForDeliveryBoy(deliveryBoyId: ID!): OrdersResponse
//   }
// `;

// module.exports = typeDefs;
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
  enum DeliveryStatus {
    PENDING # Assigned to delivery boy but not accepted yet
    ACCEPTED # Delivery boy accepted
    PICKED_UP # Delivery boy picked up from shop/warehouse
    OUT_FOR_DELIVERY # Delivery boy is on the way
    DELIVERED # Successfully delivered
    CANCELLED # Cancelled by admin/user
  }
  type DeliveryBoyStats {
    todaysDeliveries: Int
    activeOrders: Int
    averageRating: Float
    todaysEarnings: Float
    totalCompletedOrders: Int
    totalCancelledOrders: Int
  }
  type Order {
    id: ID!
    product: Product
    amount: Float!
    status: String! # main order status (CREATED, CONFIRMED, etc.)
    deliveryStatus: DeliveryStatus # track delivery boy side
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
    stats: DeliveryBoyStats
  }

  # ================== MUTATIONS ==================
  extend type Mutation {
    acceptOrder(orderId: ID!, subadminId: ID, superadminId: ID): OrderResponse
    # ✅ Subadmin assigns order to delivery boy
    assignOrderToDeliveryBoy(orderId: ID!, deliveryBoyId: ID!): OrderResponse

    # ✅ Delivery boy accepts order
    acceptOrderDeliveryBoy(orderId: ID!): OrderResponse

    # ✅ Delivery boy picks up order from shop
    pickUpOrder(orderId: ID!): OrderResponse

    # ✅ Delivery boy goes out for delivery
    outForDelivery(orderId: ID!): OrderResponse

    # ✅ Delivery boy delivers order
    deliverOrder(orderId: ID!): OrderResponse

    rejectOrderDeliveryBoy(orderId: ID!, deliveryBoyId: ID!): OrderResponse!
    cancelOrder(orderId: ID!, subadminId: ID, superadminId: ID): OrderResponse
  }

  # ================== QUERIES ==================
  extend type Query {
    getOrdersForDeliveryBoy(deliveryBoyId: ID!): OrdersResponse
  }
`;

module.exports = typeDefs;
