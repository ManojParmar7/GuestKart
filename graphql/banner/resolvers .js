const Banner = require("../../modals/Banner");
const { saveImage } = require("../../shared/uploadImage");
const User = require("../../modals/User");

module.exports = {
  Upload: require("graphql-upload").GraphQLUpload,
  Banner: {
    user: async (user) => await User.findById(user.subadminId),
  },

  Query: {
    getAllBanners: async (
      _,
      { page = 1, limit = 10, search = "", subadminId, superadminId }
    ) => {
      const skip = (page - 1) * limit;

      const query = {};
      if (superadminId) {
        query.superadminId = superadminId;
      }
      if (subadminId) {
        query.subadminId = subadminId;
      }

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      const total = await Banner.countDocuments(query);
      const banners = await Banner.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Banners fetched successfully",
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        banners,
      };
    },

    getBanner: async (_, { id }) => await Banner.findById(id),
  },

  Mutation: {
    createBanner: async (
      _,
      { image, title, subadminId, superadminId, ...args },
      { user } // 👈 context user
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access: Please login to continue.",
          banner: null,
        };
      }
      console.log("testing--------------------------: ", user);

      if (user.role === "superadmin") {
        // ✅ superadmin can create for any subadmin under them
        if (user.id.toString() !== superadminId) {
          return {
            success: false,
            message:
              "Unauthorized: You can only create banners under your own account.",
            banner: null,
          };
        }
      } else if (user.role === "subadmin") {
        // ✅ subadmin can only create for themselves
        if (user.id.toString() !== subadminId) {
          return {
            success: false,
            message:
              "Unauthorized: Subadmins can only create banners for their own account.",
            banner: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Unauthorized role.",
          banner: null,
        };
      }

      // Step 1: Check for existing banner
      const existingBanner = await Banner.findOne({
        title: title.trim(),
        subadminId,
        superadminId,
      });

      if (existingBanner) {
        return {
          success: false,
          message:
            "Banner with this title already exists for this subadmin and superadmin.",
          banner: null,
        };
      }

      // Step 2: Save image if exists
      let imagePath = null;
      if (image) {
        imagePath = await saveImage(image);
      }

      // Step 3: Create and save banner
      const banner = new Banner({
        title: title.trim(),
        subadminId,
        superadminId,
        image: imagePath,
        ...args,
      });

      const response = await banner.save();
      return {
        success: true,
        message: "Banner created successfully",
        banner: response,
      };
    },

    updateBanner: async (
      _,
      { id, title, subTitle, description, image, subadminId, superadminId },
      { user } // 👈 Authenticated user from context
    ) => {
      // Step 0: Ensure user is logged in
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access: Please login to continue.",
          banner: null,
        };
      }

      // Step 1: Fetch banner
      const banner = await Banner.findById(id);

      if (!banner) {
        return {
          success: false,
          message: "Banner not found.",
          banner: null,
        };
      }

      // Step 2: Role and ownership verification
      if (user.role === "superadmin") {
        // Superadmin must only modify banners they created
        if (banner.superadminId?.toString() !== user.id) {
          return {
            success: false,
            message: "Unauthorized: You can only update your own banners.",
            banner: null,
          };
        }
      } else if (user.role === "subadmin") {
        // Subadmin must only modify banners they created AND
        // it must belong to their assigned superadmin
        if (
          banner.subadminId?.toString() !== user.id ||
          banner.superadminId?.toString() !== user.superadmin_id?.toString()
        ) {
          return {
            success: false,
            message:
              "Unauthorized: Subadmin can only update their own banners under their superadmin.",
            banner: null,
          };
        }
      } else {
        // Unknown role
        return {
          success: false,
          message: "Unauthorized role: Access denied.",
          banner: null,
        };
      }

      // Step 3: Check for existing title under same subadmin and superadmin
      const existingBanner = await Banner.findOne({
        _id: { $ne: id },
        title: title.trim(),
        subadminId,
        superadminId,
      });

      if (existingBanner) {
        return {
          success: false,
          message:
            "A banner with this title already exists under this subadmin and superadmin.",
          banner: null,
        };
      }

      // Step 4: Handle image if provided
      let imagePath = banner.image;
      if (image) {
        imagePath = await saveImage(image);
      }

      // Step 5: Update banner fields
      banner.title = title?.trim() || banner.title;
      banner.subTitle = subTitle?.trim() || banner.subTitle;
      banner.description = description?.trim() || banner.description;
      banner.image = imagePath;
      banner.subadminId = subadminId;
      banner.superadminId = superadminId;

      const updated = await banner.save();

      return {
        success: true,
        message: "Banner updated successfully.",
        banner: updated,
      };
    },

    deleteBanner: async (_, { id }) => {
      const response = await Banner.findByIdAndDelete(id);
      return {
        success: true,
        message: "Banner deleted successfully",
        banner: response,
      };
    },
  },
};
