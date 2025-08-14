const gql = String.raw;

module.exports = gql`
  type CreatedByInfo {
    name: String
    role: String
  }

  type Color {
    id: ID!
    name: String!
    price: Float!
    superadminId: ID
    subadminId: ID
    createdBy: CreatedByInfo
  }

  type ColorResponse {
    success: Boolean!
    message: String!
    color: Color
  }

  type PaginatedColors {
    colors: [Color!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  extend type Query {
    getColors(
      search: String
      page: Int
      limit: Int
      superadminId: ID
      subadminId: ID
    ): PaginatedColors!

    getColor(id: ID!): Color
  }

  extend type Mutation {
    createColor(
      name: String!
      price: Float!
      superadminId: ID
      subadminId: ID
    ): ColorResponse!

    updateColor(
      id: ID!
      name: String
      price: Float
      superadminId: ID
      subadminId: ID
    ): ColorResponse!

    deleteColor(id: ID!): ColorResponse!
  }
`;
