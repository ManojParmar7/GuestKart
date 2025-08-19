const Discount = require("../../modals/discount");
const Product = require("../../modals/Product");
const User = require("../../modals/User");

const discountResolvers = {
  Discount: {
    product: async (parent) => await Product.findById(parent.productId),
    user: async (parent) => await User.findById(parent.userId),
  },

  Query: {
    getAllDiscounts: async (
      _,
      { page, limit, search = "", subadminId, superadminId }
    ) => {
      let query = {};

      if (superadminId) query.superadminId = superadminId;
      if (subadminId) query.subadminId = subadminId;
      if (search) {
        query.$or = [
          { type: { $regex: search, $options: "i" } },
          { value: { $regex: search, $options: "i" } },
        ];
      }

      // no pagination case
      if (!page || !limit) {
        const discounts = await Discount.find(query).sort({ createdAt: -1 });
        return {
          success: true,
          message: "Discounts fetched successfully",
          total: discounts.length,
          currentPage: null,
          totalPages: null,
          discounts,
        };
      }

      // with pagination
      const skip = (page - 1) * limit;
      const total = await Discount.countDocuments(query);
      const discounts = await Discount.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Discounts fetched successfully",
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        discounts,
      };
    },

    getDiscount: async (_, { id }) => {
      const discount = await Discount.findById(id);
      if (!discount) {
        return {
          success: false,
          message: "Discount not found",
          discount: null,
        };
      }
      return {
        success: true,
        message: "Discount fetched successfully",
        discount,
      };
    },
  },

  Mutation: {
    // createDiscount: async (
    //   _,
    //   { productId, type, value, startDate, endDate, subadminId, superadminId },
    //   { user }
    // ) => {
    //   if (!user) {
    //     return {
    //       success: false,
    //       message: "Unauthorized access",
    //       discount: null,
    //     };
    //   }

    //   // role check
    //   if (user.role === "superadmin" && user.id.toString() !== superadminId) {
    //     return {
    //       success: false,
    //       message: "Unauthorized superadmin",
    //       discount: null,
    //     };
    //   }
    //   if (user.role === "subadmin" && user.id.toString() !== subadminId) {
    //     return {
    //       success: false,
    //       message: "Unauthorized subadmin",
    //       discount: null,
    //     };
    //   }

    //   // duplicate check
    //   const existing = await Discount.findOne({
    //     productId,
    //     subadminId,
    //     superadminId,
    //     type,
    //     value,
    //   });
    //   if (existing) {
    //     return {
    //       success: false,
    //       message:
    //         "Discount already exists for this product under same account",
    //       discount: null,
    //     };
    //   }

    //   const isActive = checkActiveStatus(startDate, endDate);

    //   const discount = new Discount({
    //     productId,
    //     type,
    //     value,
    //     startDate,
    //     endDate,
    //     isActive,
    //     subadminId,
    //     superadminId,
    //   });

    //   const saved = await discount.save();
    //   return {
    //     success: true,
    //     message: "Discount created successfully",
    //     discount: saved,
    //   };
    // },

    // updateDiscount: async (_, { id, ...updates }, { user }) => {
    //   const discount = await Discount.findById(id);
    //   if (!discount)
    //     return {
    //       success: false,
    //       message: "Discount not found",
    //       discount: null,
    //     };

    //   if (
    //     user.role === "superadmin" &&
    //     discount.superadminId.toString() !== user.id
    //   ) {
    //     return {
    //       success: false,
    //       message: "Unauthorized superadmin",
    //       discount: null,
    //     };
    //   }
    //   if (
    //     user.role === "subadmin" &&
    //     discount.subadminId.toString() !== user.id
    //   ) {
    //     return {
    //       success: false,
    //       message: "Unauthorized subadmin",
    //       discount: null,
    //     };
    //   }

    //   if (updates.startDate && updates.endDate) {
    //     updates.isActive = checkActiveStatus(
    //       updates.startDate,
    //       updates.endDate
    //     );
    //   }

    //   const updated = await Discount.findByIdAndUpdate(id, updates, {
    //     new: true,
    //   });
    //   return {
    //     success: true,
    //     message: "Discount updated successfully",
    //     discount: updated,
    //   };
    // },
    createDiscount: async (
      _,
      { productId, type, value, startDate, endDate, subadminId, superadminId },
      { user }
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access",
          discount: null,
        };
      }

      // role check
      if (user.role === "superadmin" && user.id.toString() !== superadminId) {
        return {
          success: false,
          message: "Unauthorized superadmin",
          discount: null,
        };
      }
      if (user.role === "subadmin" && user.id.toString() !== subadminId) {
        return {
          success: false,
          message: "Unauthorized subadmin",
          discount: null,
        };
      }

      // date validation
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start < now.setHours(0, 0, 0, 0)) {
        return {
          success: false,
          message: "Start date cannot be in the past",
          discount: null,
        };
      }

      if (end < start) {
        return {
          success: false,
          message: "End date cannot be earlier than start date",
          discount: null,
        };
      }

      // duplicate check
      const existing = await Discount.findOne({
        productId,
        subadminId,
        superadminId,
        type,
        value,
      });
      if (existing) {
        return {
          success: false,
          message:
            "Discount already exists for this product under same account",
          discount: null,
        };
      }

      const isActive = checkActiveStatus(start, end);

      const discount = new Discount({
        productId,
        type,
        value,
        startDate: start,
        endDate: end,
        isActive,
        subadminId,
        superadminId,
      });

      const saved = await discount.save();
      return {
        success: true,
        message: "Discount created successfully",
        discount: saved,
      };
    },

    updateDiscount: async (_, { id, ...updates }, { user }) => {
      const discount = await Discount.findById(id);
      if (!discount)
        return {
          success: false,
          message: "Discount not found",
          discount: null,
        };

      // ownership check
      if (
        user.role === "superadmin" &&
        discount.superadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized superadmin",
          discount: null,
        };
      }
      if (
        user.role === "subadmin" &&
        discount.subadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized subadmin",
          discount: null,
        };
      }

      // date validation if dates are updated
      if (updates.startDate && updates.endDate) {
        const start = new Date(updates.startDate);
        const end = new Date(updates.endDate);
        const now = new Date();

        if (start < now.setHours(0, 0, 0, 0)) {
          return {
            success: false,
            message: "Start date cannot be in the past",
            discount: null,
          };
        }

        if (end < start) {
          return {
            success: false,
            message: "End date cannot be earlier than start date",
            discount: null,
          };
        }

        updates.isActive = checkActiveStatus(start, end);
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

    deleteDiscount: async (_, { id }, { user }) => {
      const discount = await Discount.findById(id);
      if (!discount)
        return {
          success: false,
          message: "Discount not found",
          discount: null,
        };

      if (
        user.role === "superadmin" &&
        discount.superadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized superadmin",
          discount: null,
        };
      }
      if (
        user.role === "subadmin" &&
        discount.subadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized subadmin",
          discount: null,
        };
      }

      const deleted = await Discount.findByIdAndDelete(id);
      return {
        success: true,
        message: "Discount deleted successfully",
        discount: deleted,
      };
    },
  },
};

function checkActiveStatus(start, end) {
  const now = new Date();
  return new Date(start) <= now && now <= new Date(end);
}

module.exports = discountResolvers;
