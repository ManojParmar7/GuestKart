// In modals/banner.js (Mongoose schema)
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Banner", bannerSchema);
