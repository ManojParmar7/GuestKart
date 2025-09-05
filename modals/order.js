const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
  price: Number,
  discount: Number,
  discountType: String,

  // ✅ total option price
  totalOptionPrice: { type: Number, default: 0 },

  // ✅ selected options
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

    // Delivery
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: [
        "PENDING", // assigned but not accepted
        "ACCEPTED", // delivery boy accepted
        "PICKED_UP", // pickup from store
        "OUT_FOR_DELIVERY", // en route
        "DELIVERED", // completed
        "CANCELLED", // cancelled
      ],
      default: "PENDING",
    },

    // ✅ Delivery process timestamps
    deliveryAssignedAt: Date,
    deliveryAcceptedAt: Date,
    deliveryPickedAt: Date,
    deliveryOutForDeliveryAt: Date,
    deliveryDeliveredAt: Date,
    deliveryCancelledAt: Date,
    deliveryCharge: { type: Number, default: 0 }, // customer से लिया जाने वाला charge

    // ✅ Delivery extra info
    deliveryEarnings: { type: Number, default: 0 }, // earning for this order
    deliveryRating: { type: Number, min: 1, max: 5 }, // customer rating
    deliveryNotes: String, // cancel reason / notes

    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "PENDING",
        "CONFIRMED",
        "APPROVED",
        "PACKED",
        "ASSIGNED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REJECTED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
        "FAILED",
        "SHIPPED",
      ],
      default: "PLACED",
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

// 👇 FIX: overwrite error se bachne ke liye
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
