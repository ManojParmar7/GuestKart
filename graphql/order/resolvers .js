// const Order = require("../../modals/Order");
// const Cart = require("../../modals/cart");
// const Product = require("../../modals/Product");
// const Discount = require("../../modals/discount");
// const User = require("../../modals/User");
// const stripe = require("../../stripe/stripe");

// module.exports = {
//   Order: {
//     user: async (parent) => await User.findById(parent.userId),
//     items: async (parent) =>
//       parent.items.map(async (item) => ({
//         product: await Product.findById(item.productId),
//         quantity: item.quantity,
//         price: item.price,
//         discount: item.discount,
//       })),
//   },

//   Query: {
//     getUserOrders: async (_, { userId }) => {
//       return await Order.find({ userId });
//     },
//   },

//   Mutation: {
//     placeOrder: async (_, { userId }) => {
//       const cart = await Cart.findOne({ userId });
//       if (!cart || cart.items.length === 0) {
//         return { success: false, message: "Cart is empty", order: null };
//       }

//       let total = 0;
//       const orderItems = [];

//       for (const item of cart.items) {
//         const product = await Product.findById(item.productId);
//         if (!product) continue;

//         let discountValue = 0;
//         const discount = await Discount.findOne({
//           productId: product._id,
//           isActive: true,
//         });

//         if (discount) {
//           discountValue =
//             discount.type === "percentage"
//               ? (product.price * discount.value) / 100
//               : discount.value;
//         }

//         const finalPrice = product.price - discountValue;
//         total += finalPrice * item.quantity;

//         if (product.stock < item.quantity) {
//           return {
//             success: false,
//             message: `${product.name} is out of stock`,
//             order: null,
//           };
//         }
//         product.stock -= item.quantity;
//         await product.save();
//         orderItems.push({
//           productId: product._id,
//           quantity: item.quantity,
//           price: product.price,
//           discountType: discount.type,
//           discount: discountValue,
//         });
//       }

//       // Stripe payment intent

//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(total * 100), // cents
//         currency: "usd",
//         payment_method_types: ["card"],

//         metadata: { userId },
//       });
//       // Create order
//       const order = await Order.create({
//         userId,
//         items: orderItems,
//         totalAmount: total,
//         paymentStatus: "pending",
//         orderStatus: "created",
//         stripePaymentIntentId: paymentIntent.id,
//         clientSecret: paymentIntent.client_secret,
//       });

//       // Optionally: clear cart
//       cart.items = [];
//       await cart.save();

//       return {
//         success: true,
//         message: "Order placed. Awaiting payment.",
//         order,
//         clientSecret: paymentIntent.client_secret,
//       };
//     },
//   },
// };
const Order = require("../../modals/Order");
const Cart = require("../../modals/cart");
const Product = require("../../modals/Product");
const Discount = require("../../modals/discount");
const User = require("../../modals/User");
const stripe = require("../../stripe/stripe");

const getSubAdminIds = async (adminId) => {
  console.log("adminId: ", adminId);
  const subadmins = await User.find({ subAdminId: adminId }, "_id");
  return subadmins.map((user) => user._id);
};
module.exports = {
  Order: {
    user: async (parent) => await User.findById(parent.userId),
    items: async (parent) =>
      Promise.all(
        parent.items.map(async (item) => ({
          product: await Product.findById(item.productId),
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          discountType: item.discountType,
        }))
      ),
  },

  Query: {
    getGuestOrders: async (_, { sessionId, email, phone }) => {
      if (!email && !phone) {
        throw new Error("At least email or phone is required");
      }

      const query = {
        sessionId,
        $or: [],
      };

      if (email) query.$or.push({ "contactInfo.email": email });
      if (phone) query.$or.push({ "contactInfo.phone": phone });

      if (query.$or.length === 0) delete query.$or;

      const result = await Order.find(query);

      return result;
    },

    getAdminOrders: async (_, __, { user }) => {
      console.log("user: ", user);
      if (!user || user.role !== "subadmin") {
        throw new Error("Unauthorized");
      }

      return await Order.find({
        subAdminId: { $in: user?.id },
      });
    },
    getSuperAdminOrders: async (_, __, { user }) => {
      console.log("user: ", user);
      if (!user || user.role !== "superadmin") {
        throw new Error("Unauthorized");
      }

      // Find all subadmins under this superadmin
      const subAdmins = await User.find({
        superadmin_id: user?.id,
      });
      const subAdminIds = subAdmins.map((sub) => sub._id);
      // Get orders for all subadmins
      return await Order.find({
        subAdminId: { $in: subAdminIds },
      });
    },
  },

  Mutation: {
    placeOrder: async (_, { sessionId, contactInfo }) => {
      const cart = await Cart.findOne({ sessionId: sessionId });
      if (!cart || cart.items.length === 0) {
        return { success: false, message: "Cart is empty", order: null };
      }

      let total = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        let discountValue = 0;
        const discount = await Discount.findOne({
          productId: product._id,
          isActive: true,
        });

        if (discount) {
          discountValue =
            discount.type === "percentage"
              ? (product.price * discount.value) / 100
              : discount.value;
        }

        const finalPrice = product.price - discountValue;
        total += finalPrice * item.quantity;

        if (product.stock < item.quantity) {
          return {
            success: false,
            message: `${product.name} is out of stock`,
            order: null,
          };
        }

        product.stock -= item.quantity;
        await product.save();

        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          discountType: discount?.type || null,
          discount: discountValue,
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        payment_method_types: ["card"],
        metadata: { sessionId },
      });

      const order = await Order.create({
        sessionId: cart?.sessionId,
        subAdminId: cart?.subAdminId,
        items: orderItems,
        totalAmount: total,
        paymentStatus: "pending",
        orderStatus: "created",
        stripePaymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        contactInfo,
      });

      cart.items = [];
      await cart.save();

      return {
        success: true,
        message: "Order placed. Awaiting payment.",
        order,
        clientSecret: paymentIntent.client_secret,
      };
    },
  },
};
