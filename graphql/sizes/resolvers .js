const Size = require("../../modals/size");

module.exports = {
  Query: {
    getSizesByUser: async (_, { userId }) => {
      return await Size.find({ userId });
    },

    getSize: async (_, { id }) => {
      return await Size.findById(id);
    },
  },

  Mutation: {
    createSize: async (_, { name, price, userId }) => {
      try {
        const existing = await Size.findOne({ name, userId });

        if (existing) {
          return {
            success: false,
            message: "Size with this name already exists.",
            size: null,
          };
        }

        const size = new Size({ name, price, userId });
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
