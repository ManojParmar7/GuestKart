const gql = String.raw;

module.exports = gql`
  type Size {
    id: ID!
    name: String!
    price: Float!
    userId: ID!
  }

  type SizeResponse {
    success: Boolean!
    message: String!
    size: Size
  }

  type Query {
    getSizesByUser(userId: ID!): [Size!]!
    getSize(id: ID!): Size
  }

  type Mutation {
    createSize(name: String!, price: Float!, userId: ID!): SizeResponse!

    updateSize(id: ID!, name: String, price: Float!): SizeResponse!

    deleteSize(id: ID!): SizeResponse!
  }
`;
