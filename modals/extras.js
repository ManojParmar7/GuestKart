const mongoose = require("mongoose");

const ExtraSchema = new mongoose.Schema({
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

ExtraSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Extra", ExtraSchema);
