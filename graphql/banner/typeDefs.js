const gql = String.raw;

module.exports = gql`
  scalar Upload

  type Banner {
    id: ID!
    title: String!
    subTitle: String
    description: String
    images: [String]
    user: User
  }

  type BannerResponse {
    success: Boolean!
    message: String!
    product: Banner
  }
  extend type Query {
    getAllBanners: [Banner]
    getBanner(id: ID!): Banner
  }

  extend type Mutation {
    createBanner(
      title: String!
      subTitle: String
      description: String
      userId: ID!

      images: [Upload!]!
    ): BannerResponse

    updateBanner(
      id: ID!
      title: String
      subTitle: String
      description: String
      images: [Upload!]
      userId: ID!
    ): BannerResponse
    deleteBanner(id: ID!): BannerResponse
  }
`;
