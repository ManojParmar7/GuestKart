const Extra = require("../../modals/extras");

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
        throw new Error("Error fetching extras: " + err.message);
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
            message: "Extra with this name already exists for this admin.",
            extra: null,
          };
        }

        const extra = new Extra({ name, price, superadminId, subadminId });
        const saved = await extra.save();

        return {
          success: true,
          message: "Extra created successfully",
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
          message: "Extra updated successfully",
          extra: updated,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to update extra",
          extra: null,
        };
      }
    },

    deleteExtra: async (_, { id }) => {
      try {
        const deleted = await Extra.findByIdAndDelete(id);

        return {
          success: true,
          message: "Extra deleted successfully",
          extra: deleted,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete extra",
          extra: null,
        };
      }
    },
  },
};
