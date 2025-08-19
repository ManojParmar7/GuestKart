const gql = String.raw;

const typeDefs = gql`
  type Coupon {
    id: ID!
    code: String!
    type: String!
    value: Float!
    minOrderAmount: Float
    maxDiscountAmount: Float
    usageLimit: Int
    usedCount: Int
    startDate: String
    endDate: String
    isActive: Boolean
    subadminId: ID
    superadminId: ID
  }

  type CouponPaginationResponse {
    success: Boolean!
    message: String
    total: Int
    currentPage: Int
    totalPages: Int
    coupons: [Coupon]
  }

  type CouponResponse {
    success: Boolean!
    message: String!
    coupon: Coupon
  }

  extend type Query {
    getAllCoupons(
      page: Int
      limit: Int
      search: String
      subadminId: ID
      superadminId: ID
    ): CouponPaginationResponse

    getCoupon(id: ID!): CouponResponse
  }

  extend type Mutation {
    createCoupon(
      code: String!
      type: String!
      value: Float!
      minOrderAmount: Float
      maxDiscountAmount: Float
      usageLimit: Int
      startDate: String!
      endDate: String!
      subadminId: ID!
      superadminId: ID!
    ): CouponResponse

    updateCoupon(
      id: ID!
      code: String
      type: String
      value: Float
      minOrderAmount: Float
      maxDiscountAmount: Float
      usageLimit: Int
      startDate: String
      endDate: String
      subadminId: ID
      superadminId: ID!
    ): CouponResponse

    deleteCoupon(id: ID!): CouponResponse
  }
`;

module.exports = typeDefs;
