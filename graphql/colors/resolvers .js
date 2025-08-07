const Color = require("../../modals/colors");

module.exports = {
  Query: {
    getAllColors: async (
      _,
      { page = 1, limit = 10, search = "", subadminId, superadminId }
    ) => {
      try {
        const skip = (page - 1) * limit;
        const query = {};

        if (superadminId) query.superadminId = superadminId;
        if (subadminId) query.subadminId = subadminId;
        if (search) query.name = { $regex: search, $options: "i" };

        const total = await Color.countDocuments(query);
        const colors = await Color.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        return {
          success: true,
          message: "Colors fetched successfully",
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          colors,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch colors",
          total: 0,
          currentPage: page,
          totalPages: 0,
          colors: [],
        };
      }
    },

    getColor: async (_, { id }) => {
      return await Color.findById(id);
    },
  },

  Mutation: {
    createColor: async (
      _,
      { name, price, colorCode, userId, subadminId, superadminId }
    ) => {
      try {
        // Check for uniqueness based on name + subadminId + superadminId
        const existing = await Color.findOne({
          name: name.trim(),
          subadminId,
          superadminId,
        });

        if (existing) {
          return {
            success: false,
            message:
              "Color with this name already exists for this subadmin and superadmin.",
            color: null,
          };
        }

        const color = new Color({
          name: name.trim(),
          price,
          colorCode,
          userId,
          subadminId,
          superadminId,
        });

        const saved = await color.save();

        return {
          success: true,
          message: "Color created successfully",
          color: saved,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to create color",
          color: null,
        };
      }
    },

    updateColor: async (_, { id, name, price, colorCode }) => {
      try {
        const updateFields = {};
        if (name !== undefined) updateFields.name = name.trim();
        if (price !== undefined) updateFields.price = price;
        if (colorCode !== undefined) updateFields.colorCode = colorCode;

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
