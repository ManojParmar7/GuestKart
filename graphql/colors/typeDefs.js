const gql = String.raw;

module.exports = gql`
  type Color {
    id: ID!
    name: String!
    price: Float!
    subadmin: ID!
  }

  type ColorResponse {
    success: Boolean!
    message: String!
    color: Color
  }
  type ColorPaginationResponse {
    success: Boolean!
    message: String
    total: Int
    currentPage: Int
    totalPages: Int
    colors: [Color!]!
  }
  extend type Query {
    getAllColors(
      page: Int
      limit: Int
      search: String
      subadminId: ID
      superadminId: ID
    ): ColorPaginationResponse!

    getColorsByUser(subadmin: ID!): [Color!]!
    getColor(id: ID!): Color
  }

  extend type Mutation {
    createColor(
      name: String!
      price: Float!
      colorCode: String!
      userId: ID!
      subadminId: ID!
      superadminId: ID!
    ): ColorResponse!

    updateColor(
      id: ID!
      name: String
      price: Float
      colorCode: String
    ): ColorResponse!

    deleteColor(id: ID!): ColorResponse!
  }
`;
