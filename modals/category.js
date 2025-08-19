// models/category.js
const mongoose = require("mongoose");
function todayDateOnly() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: String,
    description: String,
    subadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subadmin",
    },
    superadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Superadmin",
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

module.exports = mongoose.model("Category", categorySchema);
