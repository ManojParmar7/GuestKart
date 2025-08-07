const gql = String.raw;

module.exports = gql`
  type Color {
    id: ID!
    name: String!
    price: Float!
    userId: ID!
  }

  type ColorResponse {
    success: Boolean!
    message: String!
    color: Color
  }

  extend type Query {
    getColorsByUser(userId: ID!): [Color!]!
    getColor(id: ID!): Color
  }

  extend type Mutation {
    createColor(name: String!, price: Float!, userId: ID!): ColorResponse!
    updateColor(id: ID!, name: String, price: Float): ColorResponse!
    deleteColor(id: ID!): ColorResponse!
  }
`;
