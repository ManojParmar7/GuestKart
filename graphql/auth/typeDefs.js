const gql = String.raw;

module.exports = gql`
  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    superadmin_id: ID
    token: String
  }
`;
