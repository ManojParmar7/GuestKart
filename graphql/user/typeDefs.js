const gql = String.raw;

module.exports = gql`
  scalar Upload

  type Role {
    id: ID!
    name: String
    description: String
    createdAt: String
    updatedAt: String
  }
  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    phone: String!
    website: String!
    password: String
    role: Role!
    createdBy: ID
    superadmin_id: ID
    subadmin_id: ID
    country: String
    currency: String
    createdAt: String
    updatedAt: String
    image: String
  }
  input UserFilterInput {
    name: String
    email: String
  }
  type UserResponse {
    success: Boolean!
    message: String!
    users: [User]
  }
  type GetUsersResponse {
    success: Boolean!
    message: String!
    users: [User!]!
    total: Int
    page: Int
    limit: Int
  }
  type Query {
    getAllUsers: UserResponse
    getUser(id: ID!): User

    getUsersBySuperadmin(
      superadmin_id: ID!
      subadmin_id: ID
      roleName: String
      page: Int = 1
      limit: Int = 10
      filters: UserFilterInput
    ): GetUsersResponse
  }

  type Mutation {
    createUser(
      name: String!
      username: String!
      email: String!
      phone: String!
      website: String!
      password: String
      country: String
      currency: String
      role: ID!
      createdBy: ID
      superadmin_id: ID
      subadmin_id: ID
      image: Upload!
    ): UserResponse

    updateUser(
      id: ID!
      name: String
      username: String
      email: String
      phone: String
      password: String
      website: String
      country: String
      currency: String
      role: ID
      createdBy: ID
      superadmin_id: ID
      subadmin_id: ID
      image: Upload
    ): UserResponse

    deleteUser(id: ID!): UserResponse
  }
`;
