const mongoose = require("mongoose");

const SizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

SizeSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Size", SizeSchema);
