const gql = String.raw;

module.exports = gql`
  scalar JSON

  type ModulePermissions {
    view: Boolean
    create: Boolean
    update: Boolean
    delete: Boolean
  }

  type OrderPermissions {
    view: Boolean
    update: Boolean
  }

  type UserPermissions {
    view: Boolean
  }

  type Modules {
    products: ModulePermissions
    categories: ModulePermissions
    orders: OrderPermissions
    banners: ModulePermissions
    users: UserPermissions
  }

  type Permission {
    id: ID!
    subadmin_id: ID!
    superadmin_id: ID!
    modules: Modules
  }

  type Query {
    getPermission(superadminId: ID!, subadminId: ID!): Permission
    getSubAdminPermissions(subadminId: ID!): Permission

    getAllPermissions: [Permission]
  }

  type Mutation {
    createOrUpdatePermissions(
      subadmin_id: ID!
      superadmin_id: ID!
      modules: JSON!
    ): Permission
  }
`;
