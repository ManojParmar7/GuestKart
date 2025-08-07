const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: "",
  },
  description: {
    type: String,
  },
  userId: {
    type: String, // Store user ID as string
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
