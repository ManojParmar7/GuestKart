const Size = require("../../modals/size");
const User = require("../../modals/User");

module.exports = {
  Query: {
    getSizes: async (
      _,
      { search, page = 1, limit = 10, superadminId, subadminId }
    ) => {
      try {
        const filter = { superadminId };
        if (subadminId) filter.subadminId = subadminId;
        if (search && search.trim() !== "") {
          filter.name = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [sizes, totalCount] = await Promise.all([
          Size.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
          Size.countDocuments(filter),
        ]);

        return {
          sizes,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        };
      } catch (err) {
        throw new Error("Error fetching sizes: " + err.message);
      }
    },

    getSize: async (_, { id }) => {
      return await Size.findById(id);
    },
  },

  Mutation: {
    createSize: async (_, { name, price, superadminId, subadminId }) => {
      try {
        const exists = await Size.findOne({ name, superadminId, subadminId });
        if (exists) {
          return {
            success: false,
            message: "Size with this name already exists.",
            size: null,
          };
        }

        // Determine who is creating
        const creatorId = subadminId || superadminId;
        const creatorUser = await User.findById(creatorId).populate("role");

        if (!creatorUser) {
          return {
            success: false,
            message: "Creator user not found.",
            size: null,
          };
        }

        const size = new Size({
          name,
          price,
          superadminId,
          subadminId,
          createdBy: {
            name: creatorUser.name,
            role: creatorUser.role?.name || "Unknown",
          },
        });

        const saved = await size.save();

        return {
          success: true,
          message: "Size created successfully",
          size: saved,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to create size",
          size: null,
        };
      }
    },

    updateSize: async (_, { id, name, price }) => {
      try {
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (price !== undefined) updateFields.price = price;

        const updated = await Size.findByIdAndUpdate(id, updateFields, {
          new: true,
        });

        return {
          success: true,
          message: "Size updated successfully",
          size: updated,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to update size",
          size: null,
        };
      }
    },

    deleteSize: async (_, { id }) => {
      try {
        const deleted = await Size.findByIdAndDelete(id);
        return {
          success: true,
          message: "Size deleted successfully",
          size: deleted,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete size",
          size: null,
        };
      }
    },
  },
};
