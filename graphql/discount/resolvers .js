const Discount = require("../../modals/discount");
const Product = require("../../modals/Product");
const User = require("../../modals/User");

const discountResolvers = {
  Discount: {
    product: async (parent) => {
      return await Product.findById(parent.productId);
    },
    user: async (user) => await User.findById(user.userId),
  },
  Query: {
    getAllDiscounts: async () => await Discount.find(),
    getDiscount: async (_, { id }) => {
      const discount = await Discount.findById(id);
      if (!discount) {
        return {
          success: true,
          message: "Discount not found. Please verify the ID and try again.",
          discount: discount,
        };
      }
      return {
        success: true,
        message: "Discount fetch successfully",
        discount: discount,
      };
    },
  },

  Mutation: {
    createDiscount: async (
      _,
      { userId, productId, type, value, startDate, endDate }
    ) => {
      const isActive = checkActiveStatus(startDate, endDate);
      const newDiscount = new Discount({
        productId,
        userId,
        type,
        value,
        startDate,
        endDate,
        isActive,
      });
      await newDiscount.save();

      return {
        success: true,
        message: "Discount created successfully",
        discount: newDiscount,
      };
    },

    updateDiscount: async (_, { id, ...updates }) => {
      if (updates.startDate && updates.endDate) {
        updates.isActive = checkActiveStatus(
          updates.startDate,
          updates.endDate
        );
      }
      const updated = await Discount.findByIdAndUpdate(id, updates, {
        new: true,
      });
      return {
        success: true,
        message: "Discount updated successfully",
        discount: updated,
      };
    },

    deleteDiscount: async (_, { id }) => {
      const deleted = await Discount.findByIdAndDelete(id);
      return {
        success: true,
        message: "Discount deleted successfully",
        discount: deleted,
      };
    },
  },
};

// Helper function
function checkActiveStatus(start, end) {
  const now = new Date();
  return new Date(start) <= now && now <= new Date(end);
}

module.exports = discountResolvers;
