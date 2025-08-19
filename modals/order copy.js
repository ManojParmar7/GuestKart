// // Order Schema (Order.js)

// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//       quantity: Number,
//       price: Number,
//       discount: Number,
//     },
//   ],
//   totalAmount: Number,
//   paymentStatus: {
//     type: String,
//     enum: ["pending", "paid", "failed", "refunded"],
//     default: "pending",
//   },
//   orderStatus: {
//     type: String,
//     enum: ["created", "confirmed", "shipped", "delivered", "cancelled"],
//     default: "created",
//   },
//   stripePaymentIntentId: String,
//   clientSecret: String,

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Order", orderSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
  price: Number,
  discount: Number,
  discountType: String,
});

const contactInfoSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
});

const orderSchema = new Schema(
  {
    subAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      default: null,
    },
    superadminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["created", "processing", "shipped", "delivered", "cancelled"],
      default: "created",
    },
    stripePaymentIntentId: String,
    clientSecret: String,
    contactInfo: contactInfoSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
