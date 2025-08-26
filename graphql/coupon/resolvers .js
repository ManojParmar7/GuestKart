const Coupon = require("../../modals/coupon");

const couponResolvers = {
  Query: {
    getAllCoupons: async (
      _,
      { page, limit, search = "", subadminId, superadminId }
    ) => {
      let query = {};

      if (superadminId) query.superadminId = superadminId;
      if (subadminId) query.subadminId = subadminId;
      if (search) {
        query.$or = [
          { code: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
        ];
      }

      if (!page || !limit) {
        const coupons = await Coupon.find(query).sort({ createdAt: -1 });
        return {
          success: true,
          message: "Coupons fetched successfully",
          total: coupons.length,
          currentPage: null,
          totalPages: null,
          coupons,
        };
      }

      const skip = (page - 1) * limit;
      const total = await Coupon.countDocuments(query);
      const coupons = await Coupon.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Coupons fetched successfully",
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        coupons,
      };
    },

    getCoupon: async (_, { id }) => {
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return {
          success: false,
          message: "Coupon not found",
          coupon: null,
        };
      }
      return {
        success: true,
        message: "Coupon fetched successfully",
        coupon,
      };
    },
  },

  Mutation: {
    createCoupon: async (
      _,
      {
        code,
        type,
        value,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        startDate,
        endDate,
        subadminId,
        superadminId,
      },
      { user }
    ) => {
      if (!user) {
        return { success: false, message: "Unauthorized access", coupon: null };
      }

      // role check
      if (user.role === "superadmin" && user.id.toString() !== superadminId) {
        return {
          success: false,
          message: "Unauthorized superadmin",
          coupon: null,
        };
      }
      if (user.role === "subadmin" && user.id.toString() !== subadminId) {
        return {
          success: false,
          message: "Unauthorized subadmin",
          coupon: null,
        };
      }

      // date check
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return {
          success: false,
          message: "End date cannot be earlier than start date",
          coupon: null,
        };
      }

      // duplicate check
      const existing = await Coupon.findOne({ code });
      if (existing) {
        return {
          success: false,
          message: "Coupon code already exists",
          coupon: null,
        };
      }

      const coupon = new Coupon({
        code,
        type,
        value,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        startDate: start,
        endDate: end,
        subadminId,
        superadminId,
        isActive: checkActiveStatus(start, end),
      });

      const saved = await coupon.save();
      return {
        success: true,
        message: "Coupon created successfully",
        coupon: saved,
      };
    },

    updateCoupon: async (_, { id, ...updates }, { user }) => {
      console.log("user: ", user);
      const coupon = await Coupon.findById(id);
      if (!coupon)
        return { success: false, message: "Coupon not found", coupon: null };

      if (
        user?.role === "superadmin" &&
        coupon.superadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized superadmin",
          coupon: null,
        };
      }
      if (
        user?.role === "subadmin" &&
        coupon.subadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized subadmin",
          coupon: null,
        };
      }

      if (updates.startDate && updates.endDate) {
        const start = new Date(updates.startDate);
        const end = new Date(updates.endDate);
        if (end < start) {
          return {
            success: false,
            message: "End date cannot be earlier than start date",
            coupon: null,
          };
        }
        updates.isActive = checkActiveStatus(start, end);
      }

      const updated = await Coupon.findByIdAndUpdate(id, updates, {
        new: true,
      });
      return {
        success: true,
        message: "Coupon updated successfully",
        coupon: updated,
      };
    },

    deleteCoupon: async (_, { id }, { user }) => {
      const coupon = await Coupon.findById(id);
      if (!coupon)
        return { success: false, message: "Coupon not found", coupon: null };

      if (
        user.role === "superadmin" &&
        coupon.superadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized superadmin",
          coupon: null,
        };
      }
      if (
        user.role === "subadmin" &&
        coupon.subadminId.toString() !== user.id
      ) {
        return {
          success: false,
          message: "Unauthorized subadmin",
          coupon: null,
        };
      }

      const deleted = await Coupon.findByIdAndDelete(id);
      return {
        success: true,
        message: "Coupon deleted successfully",
        coupon: deleted,
      };
    },
  },
};

function checkActiveStatus(start, end) {
  const now = new Date();
  return new Date(start) <= now && now <= new Date(end);
}

module.exports = couponResolvers;
