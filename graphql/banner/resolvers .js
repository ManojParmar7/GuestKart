const Banner = require("../../modals/Banner");
const { saveImage } = require("../../shared/uploadImage");
const User = require("../../modals/User");

module.exports = {
  Upload: require("graphql-upload").GraphQLUpload,
  Banner: {
    user: async (user) => await User.findById(user.userId),
  },

  Query: {
    getAllBanners: async () => await Banner.find(),
    getBanner: async (_, { id }) => await Banner.findById(id),
  },

  Mutation: {
    createBanner: async (_, { images, ...args }) => {
      const imagePaths = await Promise.all(images.map(saveImage));
      const banner = new Banner({
        ...args,
        images: imagePaths,
      });

      const response = await banner.save();
      return {
        success: true,
        message: "Banner created successfully",
        product: response,
      };
    },

    updateBanner: async (_, { id, images, ...updates }) => {
      if (images && images.length > 0) {
        const imagePaths = await Promise.all(images.map(saveImage));
        updates.images = imagePaths;
      }

      const response = await Banner.findByIdAndUpdate(id, updates, {
        new: true,
      });
      return {
        success: true,
        message: "Banner updated successfully",
        product: response,
      };
    },

    deleteBanner: async (_, { id }) => {
      const response = await Banner.findByIdAndDelete(id);
      return {
        success: true,
        message: "Banner deleted successfully",
        product: response,
      };
    },
  },
};
