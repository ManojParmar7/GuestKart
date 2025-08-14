const gql = String.raw;

const typeDefs = gql`
  scalar Upload
  type CreatedByInfo {
    name: String
    role: String
  }
  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    image: String
    subadminId: ID!
    superadminId: ID!
    createdBy: CreatedByInfo
  }
  type CatgoryPaginationResponse {
    success: Boolean!
    message: String
    total: Int
    currentPage: Int
    totalPages: Int
    categories: [Category]
  }
  type CategoryResponse {
    success: Boolean!
    message: String!
    category: Category
  }

  type Query {
    getAllCategories(
      page: Int
      limit: Int
      subadminId: ID
      superadminId: ID
      search: String
    ): CatgoryPaginationResponse

    getCategory(id: ID!): Category
  }

  type Mutation {
    createCategory(
      name: String!
      slug: String!
      description: String
      image: Upload!
      subadminId: ID!
      superadminId: ID!
    ): CategoryResponse

    updateCategory(
      id: ID!
      name: String
      slug: String
      description: String
      image: Upload
      subadminId: ID
      superadminId: ID
    ): CategoryResponse

    deleteCategory(id: ID!): CategoryResponse
  }
`;
module.exports = typeDefs;
