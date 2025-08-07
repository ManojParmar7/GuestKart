const gql = String.raw;

module.exports = gql`
  scalar Upload

  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    stock: Int!
    images: [String]
    category: Category
    user: User
  }

  type ProductResponse {
    success: Boolean!
    message: String!
    product: Product
  }

  extend type Query {
    getAllProducts: [Product]
    getProduct(id: ID!): Product

    # ✅ Added Queries
    getUserProducts(userId: ID!): [Product]
    getProductUserCategories(userId: ID!): [Category]
    getUserProductsByCategory(userId: ID!, categoryId: ID!): [Product]
  }

  extend type Mutation {
    createProduct(
      name: String!
      price: Float!
      description: String
      stock: Int!
      categoryId: ID!
      userId: ID!
      images: [Upload!]!
    ): ProductResponse

    updateProduct(
      id: ID!
      name: String
      price: Float
      description: String
      stock: Int
      categoryId: ID
      userId: ID
      images: [Upload!]
    ): ProductResponse

    deleteProduct(id: ID!): ProductResponse
  }
`;
