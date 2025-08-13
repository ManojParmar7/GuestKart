const gql = String.raw;

module.exports = gql`
  type Role {
    id: ID!
    name: String!
    description: String
    createdBy: ID
  }
  type RoleListResponse {
    success: Boolean!
    message: String!
    total: Int
    currentPage: Int
    totalPages: Int
    roles: [Role]
  }
  type RoleResponse {
    success: Boolean!
    message: String!
    role: Role
  }

  extend type Query {
    getAllRoles(page: Int, limit: Int, search: String): RoleListResponse
    getRole(id: ID!): Role
  }

  extend type Mutation {
    createRole(name: String!, description: String, createdBy: ID): RoleResponse!
    updateRole(id: ID!, name: String, description: String): RoleResponse!
    deleteRole(id: ID!): RoleResponse!
  }
`;
