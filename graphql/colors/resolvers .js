const Color = require("../../modals/colors");

module.exports = {
  Query: {
    getColors: async (_, { search, page, limit, superadminId, subadminId }) => {
      try {
        if (!superadminId) {
          throw new Error("superadminId is required");
        }

        const filter = { superadminId };

        if (subadminId) {
          filter.subadminId = subadminId;
        }

        // search filter
        if (search && search.trim() !== "") {
          filter.name = { $regex: search, $options: "i" };
        }

        // Pagination logic
        let query = Color.find(filter).sort({ createdAt: -1 });

        if (page && limit) {
          const skip = (page - 1) * limit;
          query = query.skip(skip).limit(limit);
        }

        // Parallel queries for performance
        const [colors, totalCount] = await Promise.all([
          query,
          Color.countDocuments(filter),
        ]);

        return {
          colors,
          totalCount,
          totalPages: limit ? Math.ceil(totalCount / limit) : 1,
          currentPage: page || 1,
        };
      } catch (err) {
        throw new Error("Error fetching colors: " + err.message);
      }
    },
    getColor: async (_, { id }) => {
      return await Color.findById(id);
    },
  },

  Mutation: {
    createColor: async (_, { name, price, superadminId, subadminId }) => {
      try {
        const existing = await Color.findOne({
          name: { $regex: `^${name}$`, $options: "i" }, // case-insensitive match
          superadminId,
          subadminId,
        });

        if (existing) {
          return {
            success: false,
            message:
              "Color with this name already exists for this Superadmin & Subadmin.",
            color: null,
          };
        }

        const color = new Color({ name, price, superadminId, subadminId });
        const saved = await color.save();

        return {
          success: true,
          message: "Color created successfully",
          color: saved,
        };
      } catch (err) {
        console.log("err: ", err);
        return {
          success: false,
          message: "Failed to create color",
          color: null,
        };
      }
    },
    updateColor: async (_, { id, name, price, superadminId, subadminId }) => {
      try {
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (price !== undefined) updateFields.price = price;
        if (superadminId !== undefined)
          updateFields.superadminId = superadminId;
        if (subadminId !== undefined) updateFields.subadminId = subadminId;

        const updated = await Color.findByIdAndUpdate(id, updateFields, {
          new: true,
        });

        return {
          success: true,
          message: "Color updated successfully",
          color: updated,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to update color",
          color: null,
        };
      }
    },

    deleteColor: async (_, { id }) => {
      try {
        const deleted = await Color.findByIdAndDelete(id);
        return {
          success: true,
          message: "Color deleted successfully",
          color: deleted,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete color",
          color: null,
        };
      }
    },
  },
};
