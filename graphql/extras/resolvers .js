const Extra = require("../../modals/extras");

module.exports = {
  Query: {
    getExtrasByUser: async (_, { userId }) => {
      return await Extra.find({ userId });
    },
    getExtra: async (_, { id }) => {
      return await Extra.findById(id);
    },
  },

  Mutation: {
    createExtra: async (_, { name, price, userId }) => {
      try {
        const exists = await Extra.findOne({ name, userId });

        if (exists) {
          return {
            success: false,
            message: "Extra with this name already exists.",
            extra: null,
          };
        }

        const extra = new Extra({ name, price, userId });
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
