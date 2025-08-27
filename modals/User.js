const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    email: String,
    phone: String,
    website: String,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    superadmin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    subadmin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    image: {
      type: String,
      default: "",
    },
    // ✅ Add these fields:
    country: {
      type: String,
      default: "IN", // Default India
    },
    currency: {
      type: String,
      default: "INR", // Default INR
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
