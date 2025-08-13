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
});

ExtraSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Extra", ExtraSchema);
