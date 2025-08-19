const mongoose = require("mongoose");
function todayDateOnly() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
const ColorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    superadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    subadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

module.exports = mongoose.model("Color", ColorSchema);
