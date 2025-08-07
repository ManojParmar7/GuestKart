const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  subAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      selectedOptions: {
        color: {
          _id: { type: mongoose.Schema.Types.ObjectId },
          name: String,
          price: Number,
        },
        size: {
          _id: { type: mongoose.Schema.Types.ObjectId },
          name: String,
          price: Number,
        },
        extras: [
          {
            _id: { type: mongoose.Schema.Types.ObjectId },
            name: String,
            price: Number,
          },
        ],
      },
      totalOptionPrice: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
