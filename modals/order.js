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
    subadminId: { type: mongoose.Schema.Types.ObjectId, ref: "Subadmin" },
    sessionId: { type: String, default: null },
    superadminId: { type: mongoose.Schema.Types.ObjectId, ref: "Superadmin" },

    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },

    // Coupon
    couponCode: { type: String, default: null },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Order lifecycle
    orderStatus: {
      type: String,
      enum: [
        "created", // jab order place hua
        "confirmed", // COD (direct confirm) ya ONLINE (jab payment success)
        "approved", // Superadmin/Subadmin approve karega
        "rejected", // Superadmin/Subadmin reject
        "shipped", // Delivery boy pick karega
        "delivered", // Delivery complete
        "cancelled", // Fail or user/admin cancel
        "returned", // Refund after return
      ],
      default: "created",
    },

    createdBy: {
      name: { type: String, required: true },
      role: { type: String, required: true },
    },

    stripePaymentIntentId: String,
    clientSecret: String,
    contactInfo: contactInfoSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
