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
    getAllProducts: async (
      _,
      { page, limit, search = "", subadminId, superadminId, categoryId }
    ) => {
      let query = {};

      // Superadmin wise filter
      if (superadminId) {
        query.superadminId = superadminId;
      }

      // Subadmin wise filter
      if (subadminId) {
        query.subadminId = subadminId;
      }

      // Category filter (optional)
      if (categoryId) {
        query.categoryId = categoryId;
      }

      // Search by product name
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      // If no pagination params, return all
      if (!page || !limit) {
        const products = await Products.find(query)
          .populate("categoryId")
          .sort({ createdAt: -1 });

        return {
          success: true,
          message: "Products fetched successfully",
          total: products.length,
          currentPage: null,
          totalPages: null,
          products,
        };
      }

      // Pagination logic
      const skip = (page - 1) * limit;
      const total = await Products.countDocuments(query);

      const products = await Products.find(query)
        .populate("categoryId")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Products fetched successfully",
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        products,
      };
    },
    getProduct: async (_, { getProductId }) => {
      try {
        const product = await Products.findById(getProductId);

        if (!product) {
          return {
            success: false,
            message: "Product not found",
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

    getProductUserCategories: async (_, { superadminId, subadminId }) => {
      let query = { superadminId };

      if (subadminId) {
        query.subadminId = subadminId;
      }

      const userProducts = await Products.find(query);

      const categoryIds = [
        ...new Set(userProducts.map((p) => String(p.categoryId))),
      ];

      return await Category.find({ _id: { $in: categoryIds } });
    },

    getUserProductsByCategory: async (
      _,
      { superadminId, subadminId, categoryId }
    ) => {
      let query = { superadminId, categoryId };

      if (subadminId) {
        query.subadminId = subadminId;
      }

      return await Products.find(query);
    },
  },

  Mutation: {
    createProduct: async (
      _,
      { images, sizes, colors, extras, subadminId, superadminId, ...args },
      { user }
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access: Please login to continue.",
          product: null,
        };
      }

      // Role verification
      if (user.role === "superadmin") {
        if (user.id.toString() !== superadminId) {
          return {
            success: false,
            message:
              "Unauthorized: You can only create products under your own account.",
            product: null,
          };
        }
      } else if (user.role === "subadmin") {
        if (user.id.toString() !== subadminId) {
          return {
            success: false,
            message:
              "Unauthorized: Subadmins can only create products for their own account.",
            product: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Unauthorized role.",
          product: null,
        };
      }
      const existingProduct = await Products.findOne({
        name: { $regex: `^${args.name}$`, $options: "i" }, // case-insensitive exact match
        superadminId,
        subadminId,
      });

      if (existingProduct) {
        return {
          success: false,
          message:
            "This product name already exists for the same Superadmin and Subadmin.",
          product: null,
        };
      }
      // Save images
      const imagePaths = await Promise.all(images.map(saveImage));

      // Create product
      const product = new Products({
        ...args,
        subadminId,
        superadminId,
        userId: user.id,
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
      {
        id,
        images,
        sizes,
        colors,
        extras,
        subadminId,
        superadminId,
        ...updates
      },
      { user }
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access: Please login to continue.",
          product: null,
        };
      }

      // 🔹 Role verification (same as createProduct)
      if (user.role === "superadmin") {
        if (user.id.toString() !== superadminId) {
          return {
            success: false,
            message:
              "Unauthorized: You can only update products under your own account.",
            product: null,
          };
        }
      } else if (user.role === "subadmin") {
        if (user.id.toString() !== subadminId) {
          return {
            success: false,
            message:
              "Unauthorized: Subadmins can only update products for their own account.",
            product: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Unauthorized role.",
          product: null,
        };
      }

      // 🔹 Find existing product
      const existing = await Products.findById(id);
      if (!existing) {
        return {
          success: false,
          message: "Product not found.",
          product: null,
        };
      }

      // 🔹 Duplicate check (same as create but excluding current product)
      if (updates.name) {
        const duplicate = await Products.findOne({
          _id: { $ne: id },
          name: { $regex: `^${updates.name}$`, $options: "i" },
          superadminId,
          subadminId,
        });

        if (duplicate) {
          return {
            success: false,
            message:
              "This product name already exists for the same Superadmin and Subadmin.",
            product: null,
          };
        }
      }

      // 🔹 Image handling
      if (images && images.length > 0) {
        const imagePaths = await Promise.all(images.map(saveImage));
        updates.images = imagePaths;
      }

      if (sizes) updates.sizes = sizes;
      if (colors) updates.colors = colors;
      if (extras) updates.extras = extras;

      // 🔹 Ensure IDs stay intact
      updates.subadminId = subadminId;
      updates.superadminId = superadminId;

      // 🔹 Update product
      const updatedProduct = await Products.findByIdAndUpdate(id, updates, {
        new: true,
      });

      return {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
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
