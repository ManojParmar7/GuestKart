const Category = require("../../modals/category");
const { saveImage } = require("../../shared/uploadImage");

const categoryResolvers = {
  Upload: require("graphql-upload").GraphQLUpload,

  Query: {
    getAllCategories: async (_, { userId }) => {
      return await Category.find({ userId });
    },

    getCategory: async (_, { id }) => {
      return await Category.findById(id);
    },
  },

  Mutation: {
    createCategory: async (_, { image, ...args }) => {
      const imagePath = await saveImage(image);
      const category = new Category({ ...args, image: imagePath });
      const data = await category.save();

      return {
        success: true,
        message: "Category created successfully",
        category: data,
      };
    },

    updateCategory: async (_, { id, image, ...updates }) => {
      if (image) {
        const imagePath = await saveImage(image);
        updates.image = imagePath;
      }

      const response = await Category.findByIdAndUpdate(id, updates, {
        new: true,
      });

      return {
        success: true,
        message: "Category updated successfully",
        category: response,
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
