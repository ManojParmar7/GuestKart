// models/category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Category", categorySchema);
