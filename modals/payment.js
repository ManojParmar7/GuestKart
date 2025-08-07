const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  paymentIntentId: String,
  amount: Number,
  currency: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
