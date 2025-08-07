const gql = String.raw;

module.exports = gql`
  type Extra {
    id: ID!
    name: String!
    price: Float!

    userId: ID!
  }

  type ExtraResponse {
    success: Boolean!
    message: String!
    extra: Extra
  }

  extend type Query {
    getExtrasByUser(userId: ID!): [Extra!]!
    getExtra(id: ID!): Extra
  }

  extend type Mutation {
    createExtra(name: String!, price: Float!, userId: ID!): ExtraResponse!
    updateExtra(id: ID!, name: String, price: Float!): ExtraResponse!
    deleteExtra(id: ID!): ExtraResponse!
  }
`;
