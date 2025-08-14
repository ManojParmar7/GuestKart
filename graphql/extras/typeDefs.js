const gql = String.raw;

module.exports = gql`
  type CreatedByInfo {
    name: String
    role: String
  }

  type Extra {
    id: ID!
    name: String!
    price: Float!
    superadminId: ID!
    subadminId: ID
    createdBy: CreatedByInfo
    createdAt: String
    updatedAt: String
  }

  type ExtraListResponse {
    extras: [Extra!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type ExtraResponse {
    success: Boolean!
    message: String!
    extra: Extra
  }

  extend type Query {
    getExtras(
      search: String
      page: Int
      limit: Int
      superadminId: ID!
      subadminId: ID
    ): ExtraListResponse!
    getExtra(id: ID!): Extra
  }

  extend type Mutation {
    createExtra(
      name: String!
      price: Float!
      superadminId: ID!
      subadminId: ID
    ): ExtraResponse!
    updateExtra(id: ID!, name: String, price: Float): ExtraResponse!
    deleteExtra(id: ID!): ExtraResponse!
  }
`;
