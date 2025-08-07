const gql = String.raw;

const typeDefs = gql`
  type Discount {
    id: ID!
    type: String!
    value: Float!
    startDate: String
    endDate: String
    product: Product
    user: User
    isActive: Boolean
  }

  type DiscountResponse {
    success: Boolean!
    message: String!
    discount: Discount
  }

  type Query {
    getAllDiscounts: [Discount]
    getDiscount(id: ID!): DiscountResponse
  }

  type Mutation {
    createDiscount(
      productId: ID!
      type: String!
      value: Float!
      startDate: String
      endDate: String
      userId: ID!
    ): DiscountResponse

    updateDiscount(
      id: ID!
      type: String
      value: Float
      startDate: String
      endDate: String
      userId: ID!
    ): DiscountResponse

    deleteDiscount(id: ID!): DiscountResponse
  }
`;

module.exports = typeDefs;
