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
    CREATED # Order place hua hai (COD ya ONLINE dono case me)
    CONFIRMED # COD auto confirm ho gaya OR Online payment successful
    APPROVED # Superadmin/Subadmin ne accept kiya
    REJECTED # Superadmin/Subadmin ne reject kiya
    SHIPPED # Delivery boy ne pick kiya
    DELIVERED # Delivery boy ne complete delivery ki
    CANCELLED # User/Admin ne cancel kiya ya payment fail
    RETURNED # Delivery ke baad return/refund hua
  }

  type Product {
    id: ID
    name: String
    price: Float
    stock: Int
  }

  type User {
    id: ID
    name: String
    email: String
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
    getGuestOrders(sessionId: String!, email: String, phone: String): [Order]
    getAllOrders(
      page: Int
      limit: Int
      search: String
      subadminId: ID
      superadminId: ID
    ): OrderPaginationResponse
  }

  extend type Mutation {
    placeOrder(
      sessionId: String!
      contactInfo: ContactInfoInput!
      paymentMethod: PaymentMethod!
      coupon: CouponInput
    ): OrderResponse
  }
`;
