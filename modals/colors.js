const mongoose = require("mongoose");

const ColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
   
  }, // e.g., "Red", "Blue"
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

ColorSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Color", ColorSchema);
