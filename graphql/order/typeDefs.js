// const gql = String.raw;

// module.exports = gql`
//   enum PaymentMethod {
//     COD
//     ONLINE
//   }

//   enum PaymentStatus {
//     PENDING
//     PAID
//     FAILED
//     REFUNDED
//   }

//   enum OrderStatus {
//     PLACED
//     PENDING
//     CONFIRMED
//     APPROVED
//     PACKED
//     ASSIGNED
//     OUT_FOR_DELIVERY
//     DELIVERED
//     CANCELLED
//     REJECTED
//     RETURN_REQUESTED
//     RETURNED
//     REFUNDED
//     FAILED
//     SHIPPED
//   }

//   type Product {
//     id: ID
//     name: String
//     price: Float
//     stock: Int
//     discountPrice: Float
//   }

//   type User {
//     id: ID
//     name: String
//     email: String
//   }
//   type OptionDetail {
//     _id: ID
//     name: String
//     price: Float
//   }

//   type OrderSelectedOptions {
//     color: OptionDetail
//     size: OptionDetail
//     extras: [OptionDetail]
//   }

//   type OrderItem {
//     product: Product
//     quantity: Int
//     price: Float
//     discount: Float
//     discountType: String
//     totalOptionPrice: Float
//     selectedOptions: OrderSelectedOptions
//   }

//   type ContactInfo {
//     name: String
//     email: String
//     phone: String
//     address: String
//   }

//   type Order {
//     id: ID!
//     sessionId: String
//     subadminId: ID
//     superadminId: ID
//     user: User
//     items: [OrderItem]
//     totalAmount: Float
//     couponCode: String
//     discountAmount: Float
//     finalAmount: Float
//     paymentStatus: PaymentStatus
//     paymentMethod: PaymentMethod
//     orderStatus: OrderStatus
//     contactInfo: ContactInfo
//     createdAt: String
//   }

//   type OrderPaginationResponse {
//     data: [Order]
//     total: Int
//     page: Int
//     limit: Int
//     totalPages: Int
//   }

//   type OrderResponse {
//     success: Boolean!
//     message: String!
//     order: Order
//     clientSecret: String
//   }

//   input ContactInfoInput {
//     name: String
//     email: String
//     phone: String
//     address: String
//   }

//   input CouponInput {
//     code: String!
//   }

//   extend type Query {
//     getAllOrders(
//       page: Int
//       limit: Int
//       search: String
//       subadminId: ID
//       superadminId: ID
//       sessionId: ID
//     ): OrderPaginationResponse

//     getGuestOrders(sessionId: String!, email: String, phone: String): [Order]
//   }

//   extend type Mutation {
//     placeOrder(
//       sessionId: String!
//       contactInfo: ContactInfoInput!
//       paymentMethod: PaymentMethod!
//       coupon: CouponInput
//     ): OrderResponse
//     deleteOrder(orderId: ID!): OrderResponse!
//   }
// `;
const gql = String.raw;

module.exports = gql`
  enum PaymentMethod {
    COD
    ONLINE
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
  }

  enum OrderStatus {
    PLACED
    PENDING
    CONFIRMED
    APPROVED
    PACKED
    ASSIGNED
    OUT_FOR_DELIVERY
    DELIVERED
    CANCELLED
    REJECTED
    RETURN_REQUESTED
    RETURNED
    REFUNDED
    FAILED
    SHIPPED
  }

  type Product {
    id: ID
    name: String
    price: Float
    stock: Int
    discountPrice: Float
  }

  type User {
    id: ID
    name: String
    email: String
  }

  type OptionDetail {
    _id: ID
    name: String
    price: Float
  }

  type OrderSelectedOptions {
    color: OptionDetail
    size: OptionDetail
    extras: [OptionDetail]
  }

  type OrderItem {
    product: Product
    quantity: Int
    price: Float
    discount: Float
    discountType: String
    totalOptionPrice: Float
    selectedOptions: OrderSelectedOptions
  }

  type ContactInfo {
    name: String
    email: String
    phone: String
    address: String
  }

  type Order {
    id: ID!
    sessionId: String
    subadminId: ID
    superadminId: ID
    user: User
    items: [OrderItem]
    totalAmount: Float
    couponCode: String
    discountAmount: Float
    finalAmount: Float
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    orderStatus: OrderStatus
    contactInfo: ContactInfo
    createdAt: String

    # Delivery related fields
    deliveryBoyId: ID
    deliveryCharge: Float
    deliveryEarnings: Float
  }

  type OrderPaginationResponse {
    data: [Order]
    total: Int
    page: Int
    limit: Int
    totalPages: Int
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
  }

  input CouponInput {
    code: String!
  }

  extend type Query {
    getAllOrders(
      page: Int
      limit: Int
      search: String
      subadminId: ID
      superadminId: ID
      sessionId: ID
    ): OrderPaginationResponse

    getGuestOrders(sessionId: String!, email: String, phone: String): [Order]
  }

  extend type Mutation {
    placeOrder(
      sessionId: String!
      contactInfo: ContactInfoInput!
      paymentMethod: PaymentMethod!
      coupon: CouponInput
    ): OrderResponse

    deleteOrder(orderId: ID!): OrderResponse!
  }
`;
