const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

const userTypeDefs = require("./graphql/user/typeDefs");
const todoTypeDefs = require("./graphql/todo/typeDefs");

const userResolvers = require("./graphql/user/resolvers ");
const todoResolvers = require("./graphql/todo/resolvers ");
const productResolvers = require("./graphql/product/resolvers ");
const productTypeDefs = require("./graphql/product/typeDefs");
const categoryTypeDefs = require("./graphql/category/typeDefs");
const categoryResolvers = require("./graphql/category/resolvers ");

const bannerTypeDefs = require("./graphql/banner/typeDefs");
const bannerResolvers = require("./graphql/banner/resolvers ");
const discountTypeDefs = require("./graphql/discount/typeDefs");
const discountResolvers = require("./graphql/discount/resolvers ");
const cartTypeDefs = require("./graphql/cart/typeDefs");
const cartResolvers = require("./graphql/cart/resolvers ");
const orderTypeDefs = require("./graphql/order/typeDefs");
const orderPlaceResolvers = require("./graphql/order/resolvers ");
const sizeTypeDefs = require("./graphql/sizes/typeDefs");
const sizeResolvers = require("./graphql/sizes/resolvers ");
const colorTypeDefs = require("./graphql/colors/typeDefs");
const colorResolvers = require("./graphql/colors/resolvers ");
const extrasTypeDefs = require("./graphql/extras/typeDefs");
const extrasResolvers = require("./graphql/extras/resolvers ");
const rolesTypeDefs = require("./graphql/roles/typeDefs");
const rolesResolvers = require("./graphql/roles/resolvers ");
const permissionsTypeDefs = require("./graphql/permissions/typeDefs");
const permissionsResolvers = require("./graphql/permissions/resolvers ");
const authTypeDefs = require("./graphql/auth/typeDefs");
const authResolvers = require("./graphql/auth/resolvers ");
const rootTypeDefs = `
  type Query
  type Mutation
`;

const typeDefs = mergeTypeDefs([
  rootTypeDefs,
  userTypeDefs,
  todoTypeDefs,
  productTypeDefs,
  categoryTypeDefs,
  bannerTypeDefs,
  discountTypeDefs,
  cartTypeDefs,
  orderTypeDefs,
  extrasTypeDefs,
  colorTypeDefs,
  sizeTypeDefs,
  rolesTypeDefs,
  permissionsTypeDefs,
  authTypeDefs,
]);

const resolvers = mergeResolvers([
  userResolvers,
  todoResolvers,
  productResolvers,
  categoryResolvers,
  bannerResolvers,
  discountResolvers,
  cartResolvers,
  orderPlaceResolvers,
  extrasResolvers,
  colorResolvers,
  sizeResolvers,
  rolesResolvers,
  permissionsResolvers,
  authResolvers,
]);

module.exports = {
  typeDefs,
  resolvers,
};
