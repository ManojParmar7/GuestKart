// In modals/banner.js (Mongoose schema)
const mongoose = require("mongoose");
function todayDateOnly() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subTitle: String,
    description: String,
    image: String,
    subadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subadminId",
    },
    superadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "superadminId",
    },
    createdBy: {
      name: { type: String, required: true },
      role: { type: String, required: true },
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

module.exports = mongoose.model("Banner", bannerSchema);
