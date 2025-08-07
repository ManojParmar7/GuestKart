const gql = String.raw;

module.exports = gql`
  type Role {
    id: ID!
    name: String!
    description: String
    createdBy: ID
  }

  type RoleResponse {
    success: Boolean!
    message: String!
    role: Role
  }

  extend type Query {
    getAllRoles: [Role!]!
    getRole(id: ID!): Role
  }

  extend type Mutation {
    createRole(name: String!, description: String, createdBy: ID): RoleResponse!
    updateRole(id: ID!, name: String, description: String): RoleResponse!
    deleteRole(id: ID!): RoleResponse!
  }
`;
