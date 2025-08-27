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
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DELIVERED"],
      default: "PENDING",
    },

    // Order lifecycle
    orderStatus: {
      type: String,
      enum: [
        "CREATED", // jab order place hua
        "CONFIRMED", // COD (direct confirm) ya ONLINE (jab payment success)
        "APPROVED", // Superadmin/Subadmin approve karega
        "REJECTED", // Superadmin/Subadmin reject
        "SHIPPED", // Delivery boy pick karega
        "DELIVERED", // Delivery complete
        "CANCELLED", // Fail or user/admin cancel
        "RETURNED", // Refund after return
      ],
      default: "CREATED",
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
