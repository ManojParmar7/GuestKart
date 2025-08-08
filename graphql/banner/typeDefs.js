const gql = String.raw;

module.exports = gql`
  scalar Upload

  type Banner {
    id: ID!
    title: String!
    subTitle: String
    description: String
    image: String
    subadminId: ID
    superadminId: ID
    user: User
  }
  type BannerPaginationResponse {
    success: Boolean!
    message: String
    total: Int
    currentPage: Int
    totalPages: Int
    banners: [Banner]
  }

  type BannerResponse {
    success: Boolean!
    message: String!
    banner: Banner
  }
  extend type Query {
    getAllBanners(
      page: Int
      limit: Int
      search: String
      subadminId: ID
      superadminId: ID
    ): BannerPaginationResponse
    getBanner(id: ID!): Banner
  }

  extend type Mutation {
    createBanner(
      title: String!
      subTitle: String
      description: String
      subadminId: ID!
      superadminId: ID!
      image: Upload!
    ): BannerResponse

    updateBanner(
      id: ID!
      title: String
      subTitle: String
      description: String
      image: Upload
      subadminId: ID
      superadminId: ID!
    ): BannerResponse

    deleteBanner(id: ID!): BannerResponse
  }
`;
