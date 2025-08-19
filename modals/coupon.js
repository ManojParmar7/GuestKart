const mongoose = require("mongoose");

function todayDateOnly() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // ek hi coupon code do baar na ho
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0, // optional rule
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // optional (for percentage coupons)
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited usage
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    subadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subadmin",
    },
    superadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Superadmin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: todayDateOnly,
    },
    updatedAt: {
      type: Date,
      default: todayDateOnly,
    },
  },
  {
    timestamps: { currentTime: () => todayDateOnly() },
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
