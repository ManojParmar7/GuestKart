const gql = String.raw;

module.exports = gql`
  type CreatedBy {
    name: String!
    role: String!
  }

  type Size {
    id: ID!
    name: String!
    price: Float!
    superadminId: ID!
    subadminId: ID
    createdBy: CreatedBy!
    user: User
    createdAt: String
    updatedAt: String
  }

  type SizeListResponse {
    sizes: [Size!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type SizeResponse {
    success: Boolean!
    message: String!
    size: Size
  }

  extend type Query {
    getSizes(
      search: String
      page: Int
      limit: Int
      superadminId: ID!
      subadminId: ID
    ): SizeListResponse!
    getSize(id: ID!): Size
  }

  extend type Mutation {
    createSize(
      name: String!
      price: Float!
      superadminId: ID!
      subadminId: ID
    ): SizeResponse!

    updateSize(id: ID!, name: String, price: Float): SizeResponse!

    deleteSize(id: ID!): SizeResponse!
  }
`;
