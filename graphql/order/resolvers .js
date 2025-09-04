const Order = require("../../modals/order");
const Cart = require("../../modals/cart");
const Product = require("../../modals/Product");
const Discount = require("../../modals/discount");
const User = require("../../modals/User");
const stripe = require("../../stripe/stripe");
const Coupon = require("../../modals/coupon");

const getsubadminIds = async (adminId) => {
  console.log("adminId: ", adminId);
  const subadmins = await User.find({ subadminId: adminId }, "_id");
  return subadmins.map((user) => user._id);
};
module.exports = {
  Order: {
    // 👇 Yeh add karo
    id: (parent) => parent._id.toString(),

    // ✅ User resolve
    user: async (parent) => {
      if (!parent.createdBy) return null;
      return await User.findById(parent.createdBy.id);
    },

    // ✅ Items resolve
    items: (parent) => {
      return parent.items.map((item) => ({
        product: item.productId, // populated Product
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        discountType: item.discountType,
        selectedOptions: item.selectedOptions || {}, // include selectedOptions
        totalOptionPrice: item.totalOptionPrice || 0, // include totalOptionPrice
      }));
    },
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

    getAllOrders: async (
      _,
      { page = 1, limit = 10, search, subadminId, superadminId, sessionId }
    ) => {
      try {
        const query = {};
        if (subadminId) query.subadminId = subadminId;
        if (superadminId) query.superadminId = superadminId;
        if (sessionId) query.sessionId = sessionId;

        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
          .populate("items.productId") // ✅ Product data populate
          .populate("deliveryBoy")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean();

        const total = await Order.countDocuments(query);

        return {
          data: orders,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    // placeOrder: async (
    //   _,
    //   { sessionId, contactInfo, coupon, paymentMethod }
    // ) => {
    //   try {
    //     const couponCode = coupon?.code || null;
    //     const cart = await Cart.findOne({ sessionId });

    //     if (!cart || cart.items.length === 0) {
    //       return { success: false, message: "Cart is empty", order: null };
    //     }

    //     let total = 0;
    //     let productDiscountAmount = 0;
    //     let couponDiscountAmount = 0;
    //     let appliedCouponId = null;
    //     let totalOptionPrice = 0;
    //     const orderItems = [];

    //     // ✅ Product level discount
    //     for (const item of cart.items) {
    //       const product = await Product.findById(item.productId);
    //       if (!product) continue;

    //       let productDiscount = 0;
    //       const discount = await Discount.findOne({
    //         productId: product._id,
    //         isActive: true,
    //       });

    //       if (discount) {
    //         productDiscount =
    //           discount.type === "percentage"
    //             ? (product.price * discount.value) / 100
    //             : discount.value;
    //       }

    //       total += product.price * item.quantity;
    //       productDiscountAmount += productDiscount * item.quantity;
    //       totalOptionPrice +=
    //         (item.selectedOptions?.totalOptionPrice || 0) * item.quantity; // ✅ (NEW) options price bhi add kiya

    //       // stock check
    //       if (product.stock < item.quantity) {
    //         return {
    //           success: false,
    //           message: `${product.name} is out of stock`,
    //           order: null,
    //         };
    //       }

    //       product.stock -= item.quantity;
    //       await product.save();

    //       orderItems.push({
    //         productId: product._id,
    //         quantity: item.quantity,
    //         price: product.price,
    //         discountType: discount?.type || null,
    //         discount: productDiscount,
    //       });
    //     }

    //     // ✅ Coupon discount
    //     if (couponCode) {
    //       const couponDoc = await Coupon.findOne({
    //         code: { $regex: new RegExp(`^${couponCode}$`, "i") },
    //         isActive: true,
    //       });

    //       if (couponDoc) {
    //         const today = new Date();
    //         if (
    //           today >= new Date(couponDoc.startDate) &&
    //           today <= new Date(couponDoc.endDate)
    //         ) {
    //           if (total >= (couponDoc.minOrderAmount || 0)) {
    //             if (
    //               !couponDoc.usageLimit ||
    //               couponDoc.usedCount < couponDoc.usageLimit
    //             ) {
    //               let cDiscount =
    //                 couponDoc.type === "percentage"
    //                   ? ((total - productDiscountAmount) * couponDoc.value) /
    //                     100
    //                   : couponDoc.value;

    //               if (
    //                 couponDoc.maxDiscountAmount &&
    //                 cDiscount > couponDoc.maxDiscountAmount
    //               ) {
    //                 cDiscount = couponDoc.maxDiscountAmount;
    //               }

    //               couponDiscountAmount = cDiscount;
    //               appliedCouponId = couponDoc._id;
    //               couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
    //               await couponDoc.save();
    //             } else {
    //               return {
    //                 success: false,
    //                 message: "Coupon usage limit exceeded",
    //                 order: null,
    //               };
    //             }
    //           }
    //         }
    //       }
    //     }

    //     // ✅ Final Amount
    //     const finalAmount =
    //       total - (productDiscountAmount || 0) - (couponDiscountAmount || 0);

    //     let paymentStatus = "PENDING";
    //     let orderStatus = "PLACED";
    //     let stripePaymentIntentId = null;
    //     let clientSecret = null;

    //     // ✅ Payment Flow
    //     if (paymentMethod === "ONLINE") {
    //       const paymentIntent = await stripe.paymentIntents.create({
    //         amount: Math.round(finalAmount * 100),
    //         currency: "usd",
    //         payment_method_types: ["card"],
    //         metadata: { sessionId },
    //       });
    //       stripePaymentIntentId = paymentIntent.id;
    //       clientSecret = paymentIntent.client_secret;
    //       paymentStatus = "PENDING";
    //       orderStatus = "PLACED";
    //     } else if (paymentMethod === "COD") {
    //       paymentStatus = "PENDING";
    //       orderStatus = "PLACED"; // COD direct confirm
    //     }

    //     const user = await User.findById(cart?.subadminId).populate("role");

    //     // ✅ Create Order
    //     const order = await Order.create({
    //       sessionId: cart?.sessionId,
    //       subadminId: cart?.subadminId,
    //       superadminId: cart?.superadminId,
    //       items: orderItems,
    //       totalAmount: total,
    //       discountAmount: productDiscountAmount + couponDiscountAmount,
    //       finalAmount,
    //       couponCode: couponCode || null,
    //       couponId: appliedCouponId,
    //       paymentMethod, // 👈 SAVE
    //       paymentStatus,
    //       orderStatus,
    //       stripePaymentIntentId,
    //       clientSecret,
    //       contactInfo,
    //       createdBy: {
    //         name: user?.name || null,
    //         role: user?.role?.name || null,
    //       },
    //     });

    //     // ✅ Clear cart
    //     cart.items = [];
    //     await cart.save();

    //     return {
    //       success: true,
    //       message:
    //         paymentMethod === "COD"
    //           ? "Order placed with Cash on Delivery."
    //           : "Order placed. Awaiting online payment.",
    //       order,
    //       clientSecret,
    //     };
    //   } catch (error) {
    //     console.error("Order place error:", error);
    //     return { success: false, message: error.message, order: null };
    //   }
    // },
    placeOrder: async (
      _,
      { sessionId, contactInfo, coupon, paymentMethod }
    ) => {
      try {
        const couponCode = coupon?.code || null;
        const cart = await Cart.findOne({ sessionId });

        if (!cart || cart.items.length === 0) {
          return { success: false, message: "Cart is empty", order: null };
        }

        let total = 0;
        let productDiscountAmount = 0;
        let couponDiscountAmount = 0;
        let appliedCouponId = null;
        const orderItems = [];
        let totalOptionPrice = 0;

        // ✅ Product + Options Price
        for (const item of cart.items) {
          const product = await Product.findById(item.productId);
          if (!product) continue;

          let productDiscount = 0;
          const discount = await Discount.findOne({
            productId: product._id,
            isActive: true,
          });

          if (discount) {
            productDiscount =
              discount.type === "percentage"
                ? (product.price * discount.value) / 100
                : discount.value;
          }

          // 👇 Product base price
          total += product.price * item.quantity;

          // 👇 Options price (per item bhi multiply hoga)
          totalOptionPrice +=
            (item.selectedOptions?.totalOptionPrice || 0) * item.quantity;

          productDiscountAmount += productDiscount * item.quantity;

          // stock check
          if (product.stock < item.quantity) {
            return {
              success: false,
              message: `${product.name} is out of stock`,
              order: null,
            };
          }

          product.stock -= item.quantity;
          await product.save();

          // ✅ Push product with selectedOptions
          orderItems.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.price,
            discountType: discount?.type || null,
            discount: productDiscount,
            selectedOptions: item.selectedOptions || {}, // 👈 FULL selectedOptions save
          });
        }

        // ✅ Coupon discount
        if (couponCode) {
          const couponDoc = await Coupon.findOne({
            code: { $regex: new RegExp(`^${couponCode}$`, "i") },
            isActive: true,
          });

          if (couponDoc) {
            const today = new Date();
            if (
              today >= new Date(couponDoc.startDate) &&
              today <= new Date(couponDoc.endDate)
            ) {
              if (total >= (couponDoc.minOrderAmount || 0)) {
                if (
                  !couponDoc.usageLimit ||
                  couponDoc.usedCount < couponDoc.usageLimit
                ) {
                  let cDiscount =
                    couponDoc.type === "percentage"
                      ? ((total + totalOptionPrice - productDiscountAmount) *
                          couponDoc.value) /
                        100
                      : couponDoc.value;

                  if (
                    couponDoc.maxDiscountAmount &&
                    cDiscount > couponDoc.maxDiscountAmount
                  ) {
                    cDiscount = couponDoc.maxDiscountAmount;
                  }

                  couponDiscountAmount = cDiscount;
                  appliedCouponId = couponDoc._id;
                  couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
                  await couponDoc.save();
                } else {
                  return {
                    success: false,
                    message: "Coupon usage limit exceeded",
                    order: null,
                  };
                }
              }
            }
          }
        }

        // ✅ Final Amount (include options)
        const finalAmount =
          total +
          totalOptionPrice -
          (productDiscountAmount || 0) -
          (couponDiscountAmount || 0);

        let paymentStatus = "PENDING";
        let orderStatus = "PLACED";
        let stripePaymentIntentId = null;
        let clientSecret = null;

        // ✅ Payment Flow
        if (paymentMethod === "ONLINE") {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalAmount * 100),
            currency: "usd",
            payment_method_types: ["card"],
            metadata: { sessionId },
          });
          stripePaymentIntentId = paymentIntent.id;
          clientSecret = paymentIntent.client_secret;
          paymentStatus = "PENDING";
          orderStatus = "PLACED";
        } else if (paymentMethod === "COD") {
          paymentStatus = "PENDING";
          orderStatus = "PLACED"; // COD direct confirm
        }

        const user = await User.findById(cart?.subadminId).populate("role");

        // ✅ Create Order
        const order = await Order.create({
          sessionId: cart?.sessionId,
          subadminId: cart?.subadminId,
          superadminId: cart?.superadminId,
          items: orderItems,
          totalAmount: total + totalOptionPrice, // 👈 include options here also
          discountAmount: productDiscountAmount + couponDiscountAmount,
          finalAmount,
          couponCode: couponCode || null,
          couponId: appliedCouponId,
          paymentMethod,
          paymentStatus,
          orderStatus,
          stripePaymentIntentId,
          clientSecret,
          contactInfo,
          createdBy: {
            name: user?.name || null,
            role: user?.role?.name || null,
          },
        });

        // ✅ Clear cart
        cart.items = [];
        await cart.save();

        return {
          success: true,
          message:
            paymentMethod === "COD"
              ? "Order placed with Cash on Delivery."
              : "Order placed. Awaiting online payment.",
          order,
          clientSecret,
        };
      } catch (error) {
        console.error("Order place error:", error);
        return { success: false, message: error.message, order: null };
      }
    },
  },
};
