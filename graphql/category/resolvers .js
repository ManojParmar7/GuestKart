// categoryResolvers.js
const Category = require("../../modals/category");
const { saveImage } = require("../../shared/uploadImage");
const User = require("../../modals/User");

const categoryResolvers = {
  Upload: require("graphql-upload").GraphQLUpload,

  Query: {
    getAllCategories: async (
      _,
      { page, limit, search = "", subadminId, superadminId }
    ) => {
      let query = {};

      if (superadminId) {
        query.superadminId = superadminId;
      }
      if (subadminId) {
        query.subadminId = subadminId;
      }
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      // Agar page ya limit pass nahi kiya to direct find kar do
      if (!page || !limit) {
        const categories = await Category.find(query).sort({ createdAt: -1 });
        return {
          success: true,
          message: "Categories fetched successfully",
          total: categories.length,
          currentPage: null,
          totalPages: null,
          categories,
        };
      }

      // Pagination logic
      const skip = (page - 1) * limit;
      const total = await Category.countDocuments(query);
      const categories = await Category.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Categories fetched successfully",
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        categories,
      };
    },

    getCategory: async (_, { id }) => {
      return await Category.findById(id);
    },
  },

  Mutation: {
    createCategory: async (
      _,
      { image, name, slug, description, subadminId, superadminId },
      { user }
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access: Please login to continue.",
          category: null,
        };
      }

      // Authorization checks
      if (user.role === "superadmin") {
        if (user.id.toString() !== superadminId) {
          return {
            success: false,
            message:
              "Unauthorized: You can only create categories under your own account.",
            category: null,
          };
        }
      } else if (user.role === "subadmin") {
        if (user.id.toString() !== subadminId) {
          return {
            success: false,
            message:
              "Unauthorized: Subadmins can only create categories for their own account.",
            category: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Unauthorized role.",
          category: null,
        };
      }

      // Check for existing category with same name + admins
      const existingCategory = await Category.findOne({
        name: name.trim(),
        subadminId,
        superadminId,
      });

      if (existingCategory) {
        return {
          success: false,
          message:
            "Category with this name already exists for this subadmin and superadmin.",
          category: null,
        };
      }

      // Save image
      const imagePath = image ? await saveImage(image) : null;
      const creator = await User.findById(subadminId).populate("role");

      // Create
      const category = new Category({
        name: name.trim(),
        slug,
        description,
        image: imagePath,
        subadminId,
        superadminId,
        createdBy: {
          name: creator?.name || null,
          role: creator?.role?.name || null,
        },
      });

      const data = await category.save();

      return {
        success: true,
        message: "Category created successfully",
        category: data,
      };
    },

    updateCategory: async (
      _,
      { id, image, name, slug, description, subadminId, superadminId },
      { user }
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access: Please login to continue.",
          category: null,
        };
      }

      const category = await Category.findById(id);
      if (!category) {
        return {
          success: false,
          message: "Category not found.",
          category: null,
        };
      }

      // Authorization checks (same logic as banner)
      if (user.role === "superadmin") {
        if (category.superadminId?.toString() !== user.id) {
          return {
            success: false,
            message: "Unauthorized: You can only update your own categories.",
            category: null,
          };
        }
      } else if (user.role === "subadmin") {
        if (
          category.subadminId?.toString() !== user.id ||
          category.superadminId?.toString() !== user.superadmin_id?.toString()
        ) {
          return {
            success: false,
            message:
              "Unauthorized: Subadmin can only update their own categories under their superadmin.",
            category: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Unauthorized role: Access denied.",
          category: null,
        };
      }

      // Check for duplicate name
      if (name) {
        const existingCategory = await Category.findOne({
          _id: { $ne: id },
          name: name.trim(),
          subadminId,
          superadminId,
        });

        if (existingCategory) {
          return {
            success: false,
            message:
              "A category with this name already exists under this subadmin and superadmin.",
            category: null,
          };
        }
      }

      // Handle image update
      if (image) {
        const imagePath = await saveImage(image);
        category.image = imagePath;
      }

      // Update fields
      category.name = name?.trim() || category.name;
      category.slug = slug || category.slug;
      category.description = description || category.description;
      category.subadminId = subadminId || category.subadminId;
      category.superadminId = superadminId || category.superadminId;

      const updated = await category.save();

      return {
        success: true,
        message: "Category updated successfully.",
        category: updated,
      };
    },

    deleteCategory: async (_, { id }) => {
      const deleted = await Category.findByIdAndDelete(id);
      return {
        success: true,
        message: "Category deleted successfully",
        category: deleted,
      };
    },
  },
};

module.exports = categoryResolvers;
