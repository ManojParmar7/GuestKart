const gql = String.raw;

module.exports = gql`
  scalar Upload
  type CreatedBy {
    name: String
    role: String
  }
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    stock: Int!
    images: [String]
    category: Category
    createdBy: CreatedBy

    sizes: [Size]
    user: User
    colors: [Color]
    extras: [Extra]
    subadminId: ID
    superadminId: ID
  }

  type ProductResponse {
    success: Boolean!
    message: String!
    product: Product
  }
  type ProductPaginationResponse {
    success: Boolean!
    message: String
    total: Int
    currentPage: Int
    totalPages: Int
    products: [Product]
  }
  extend type Query {
    getAllProducts(
      page: Int
      limit: Int
      search: String
      subadminId: ID
      superadminId: ID
      categoryId: ID
    ): ProductPaginationResponse
    getProduct(getProductId: ID!): ProductResponse

    getUserProducts(userId: ID!): [Product]
    getProductUserCategories(superadminId: ID!, subadminId: ID): [Category]
    getUserProductsByCategory(
      superadminId: ID!
      subadminId: ID
      categoryId: ID!
    ): [Product]
  }

  extend type Mutation {
    createProduct(
      name: String!
      price: Float!
      description: String
      stock: Int!
      categoryId: ID!
      subadminId: ID! #
      superadminId: ID!
      images: [Upload!]!
      sizes: [ID!]!
      colors: [ID!]!
      extras: [ID!]!
    ): ProductResponse

    updateProduct(
      id: ID!
      name: String
      price: Float
      description: String
      stock: Int
      categoryId: ID
      images: [Upload!]
      sizes: [ID!]
      colors: [ID!]
      extras: [ID!]
      subadminId: ID!
      superadminId: ID!
    ): ProductResponse

    deleteProduct(id: ID!): ProductResponse
  }
`;
