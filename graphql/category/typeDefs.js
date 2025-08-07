const gql = String.raw;

const typeDefs = gql`
  scalar Upload

  type Category {
    id: ID!
    name: String!
    slug: String!
    image: String
    description: String
    userId: String!
  }

  type CategoryResponse {
    success: Boolean!
    message: String!
    category: Category
  }

  type Query {
    getAllCategories(userId: String!): [Category]
    getCategory(id: ID!): Category
  }

  type Mutation {
    createCategory(
      name: String!
      slug: String!
      description: String
      image: Upload!
      userId: ID!
    ): CategoryResponse

    updateCategory(
      id: ID!
      name: String
      slug: String
      description: String
      image: Upload
      userId: ID!
    ): CategoryResponse

    deleteCategory(id: ID!): CategoryResponse
  }
`;
module.exports = typeDefs;
