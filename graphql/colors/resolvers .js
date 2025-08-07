const Color = require("../../modals/colors");

module.exports = {
  Query: {
    getColorsByUser: async (_, { userId }) => {
      return await Color.find({ userId });
    },

    getColor: async (_, { id }) => {
      return await Color.findById(id);
    },
  },

  Mutation: {
    createColor: async (_, { name, price, userId }) => {
      try {
        const existing = await Color.findOne({ name, userId });

        if (existing) {
          return {
            success: false,
            message: "Color with this name already exists.",
            color: null,
          };
        }

        const color = new Color({ name, price, userId });
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

    updateColor: async (_, { id, name, price }) => {
      try {
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (price !== undefined) updateFields.price = price;

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
