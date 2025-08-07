// In modals/banner.js (Mongoose schema)
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: String,
  subTitle: String,
  description: String,
  images: [String],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
