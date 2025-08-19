const Extra = require("../../modals/extras");
const User = require("../../modals/User");

module.exports = {
  Query: {
    getExtras: async (_, { search, page, limit, superadminId, subadminId }) => {
      try {
        if (!superadminId) {
          throw new Error("superadminId is required");
        }

        const filter = { superadminId };

        if (subadminId) {
          filter.subadminId = subadminId;
        }

        if (search && search.trim() !== "") {
          filter.name = { $regex: search, $options: "i" };
        }

        let query = Extra.find(filter).sort({ createdAt: -1 });

        if (page && limit) {
          const skip = (page - 1) * limit;
          query = query.skip(skip).limit(limit);
        }

        const [extras, totalCount] = await Promise.all([
          query,
          Extra.countDocuments(filter),
        ]);

        return {
          extras,
          totalCount,
          totalPages: limit ? Math.ceil(totalCount / limit) : 1,
          currentPage: page || 1,
        };
      } catch (err) {
        throw new Error("Error fetching accessories: " + err.message);
      }
    },

    getExtra: async (_, { id }) => {
      return await Extra.findById(id);
    },
  },

  Mutation: {
    createExtra: async (_, { name, price, superadminId, subadminId }) => {
      try {
        const exists = await Extra.findOne({ name, superadminId, subadminId });

        if (exists) {
          return {
            success: false,
            message:
              "Accessories with this name already exists for this admin.",
            extra: null,
          };
        }

        // Find user who is creating this extra
        let creatorId = subadminId || superadminId;
        const user = await User.findById(creatorId).populate("role");

        const extra = new Extra({
          name,
          price,
          superadminId,
          subadminId,
          createdBy: {
            name: user?.name || null,
            role: user?.role?.name || null,
          },
        });

        const saved = await extra.save();

        return {
          success: true,
          message: "Accessories created successfully",
          extra: saved,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to create extra",
          extra: null,
        };
      }
    },

    updateExtra: async (_, { id, name, price }) => {
      try {
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (price !== undefined) updateFields.price = price;

        const updated = await Extra.findByIdAndUpdate(id, updateFields, {
          new: true,
        });

        return {
          success: true,
          message: "Accessories updated successfully",
          extra: updated,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to update accessories",
          extra: null,
        };
      }
    },

    deleteExtra: async (_, { id }) => {
      try {
        const deleted = await Extra.findByIdAndDelete(id);

        return {
          success: true,
          message: "Accessories deleted successfully",
          extra: deleted,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete accessories",
          extra: null,
        };
      }
    },
  },
};
