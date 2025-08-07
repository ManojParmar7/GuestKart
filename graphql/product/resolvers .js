const fs = require("fs");
const path = require("path");
const Products = require("../../modals/Product");
const { saveImage } = require("../../shared/uploadImage");
const Category = require("../../modals/category");
const User = require("../../modals/User");
const Color = require("../../modals/colors");
const Size = require("../../modals/size");
const Extra = require("../../modals/extras");

module.exports = {
  Upload: require("graphql-upload").GraphQLUpload,

  Product: {
    category: async (parent) => {
      return await Category.findById(parent.categoryId);
    },
    user: async (parent) => {
      return await User.findById(parent.userId);
    },
    sizes: async (parent) => await Size.find({ _id: { $in: parent.sizes } }),
    colors: async (parent) => await Color.find({ _id: { $in: parent.colors } }),
    extras: async (parent) => await Extra.find({ _id: { $in: parent.extras } }),
  },

  Query: {
    getAllProducts: async () => await Products.find(),
    getProduct: async (_, { userId, getProductId }) => {
      console.log("getProductId: ", getProductId);
      console.log("userId: ", userId);
      try {
        const product = await Products.findOne({
          _id: getProductId,
          userId: userId, // 'user' field in your Product model
        });

        if (!product) {
          return {
            success: false,
            message: "Product not found or does not belong to this user",
            product: null,
          };
        }

        return {
          success: true,
          message: "Product fetched successfully",
          product,
        };
      } catch (error) {
        console.error("Error fetching product:", error);
        return {
          success: false,
          message: "Server error",
          product: null,
        };
      }
    },
    getUserProducts: async (_, { userId }) => {
      return await Products.find({ userId });
    },

    getProductUserCategories: async (_, { userId }) => {
      const userProducts = await Products.find({ userId });

      const categoryIds = [
        ...new Set(userProducts.map((p) => String(p.categoryId))),
      ];

      return await Category.find({ _id: { $in: categoryIds } });
    },

    getUserProductsByCategory: async (_, { userId, categoryId }) => {
      return await Products.find({ userId, categoryId });
    },
  },

  Mutation: {
    createProduct: async (
      _,
      { images, sizes, colors, extras, ...args },
      { user }
    ) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      const imagePaths = await Promise.all(images.map(saveImage));

      const product = new Products({
        ...args,
        userId: user.id, // token se user ID lo
        images: imagePaths,
        sizes,
        colors,
        extras,
      });

      const data = await product.save();

      return {
        success: true,
        message: "Product created successfully",
        product: data,
      };
    },
    updateProduct: async (
      _,
      { id, images, sizes, colors, extras, ...updates },
      { user }
    ) => {
      if (!user) throw new Error("Unauthorized");

      const existing = await Products.findById(id);
      if (!existing || existing.userId.toString() !== user.id) {
        throw new Error("Unauthorized or product not found");
      }

      if (images && images.length > 0) {
        const imagePaths = await Promise.all(images.map(saveImage));
        updates.images = imagePaths;
      }

      if (sizes) updates.sizes = sizes;
      if (colors) updates.colors = colors;
      if (extras) updates.extras = extras;

      const response = await Products.findByIdAndUpdate(id, updates, {
        new: true,
      });

      return {
        success: true,
        message: "Product updated successfully",
        product: response,
      };
    },

    deleteProduct: async (_, { id }) => {
      const response = await Products.findByIdAndDelete(id);
      return {
        success: true,
        message: "Product deleted successfully",
        product: response,
      };
    },
  },
};
