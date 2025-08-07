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
});

module.exports = mongoose.model("Banner", bannerSchema);
