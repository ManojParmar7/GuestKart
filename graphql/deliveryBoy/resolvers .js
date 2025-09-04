const Order = require("../../modals/order");
const User = require("../../modals/User");
const Product = require("../../modals/Product");

const deliveryBoyResolvers = {
  Order: {
    deliveryBoy: async (parent) =>
      parent.deliveryBoy ? await User.findById(parent.deliveryBoy) : null,
    items: async (parent) =>
      parent.items.map(async (item) => ({
        ...item,
        product: await Product.findById(item.productId),
      })),
  },

  Query: {
    // ✅ Get all orders assigned to a delivery boy
    getOrdersForDeliveryBoy: async (_, { deliveryBoyId }) => {
      try {
        const orders = await Order.find({ deliveryBoy: deliveryBoyId })
          .populate("deliveryBoy")
          .populate("items.productId");

        return {
          success: true,
          message: "Orders fetched successfully",
          orders,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          orders: [],
        };
      }
    },
  },

  Mutation: {
    // acceptOrder: async (_, { orderId, subadminId, superadminId }, { user }) => {
    //   try {
    //     console.log("Payload:", { orderId, subadminId, superadminId });
    //     console.log("User from context:", user);

    //     // Step 1: Find order
    //     const order = await Order.findById(orderId);
    //     if (!order) {
    //       return {
    //         success: false,
    //         message: "Order not found",
    //         order: null,
    //       };
    //     }

    //     // Step 2: Superadmin check
    //     if (superadminId) {
    //       if (order.superadminId.toString() !== superadminId) {
    //         return {
    //           success: false,
    //           message: "Superadmin not authorized for this order",
    //           order: null,
    //         };
    //       }
    //     }

    //     // Step 3: Subadmin check
    //     if (subadminId) {
    //       if (order.subadminId.toString() !== subadminId) {
    //         return {
    //           success: false,
    //           message: "Subadmin not authorized for this order",
    //           order: null,
    //         };
    //       }
    //     }

    //     // Step 4: Update order status
    //     order.orderStatus = "CONFIRMED";
    //     await order.save();

    //     return {
    //       success: true,
    //       message: "Order accepted successfully",
    //       order,
    //     };
    //   } catch (error) {
    //     console.error("acceptOrder error:", error);
    //     return {
    //       success: false,
    //       message: "Something went wrong",
    //       order: null,
    //     };
    //   }
    // },
    acceptOrder: async (_, { orderId, subadminId, superadminId }, { user }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        // Sirf PLACED order hi accept hoga
        if (order.orderStatus !== "PLACED") {
          return {
            success: false,
            message: `Order cannot be accepted because it is already '${order.orderStatus}'`,
            order,
          };
        }

        // Superadmin check
        if (superadminId && order.superadminId.toString() !== superadminId) {
          return {
            success: false,
            message: "Superadmin not authorized for this order",
            order: null,
          };
        }

        // Subadmin check
        if (subadminId && order.subadminId.toString() !== subadminId) {
          return {
            success: false,
            message: "Subadmin not authorized for this order",
            order: null,
          };
        }

        // Update status
        order.orderStatus = "CONFIRMED";
        await order.save();

        return {
          success: true,
          message: "Order accepted successfully",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },

    assignOrderToDeliveryBoy: async (
      _,
      { orderId, deliveryBoyId },
      { user }
    ) => {
      try {
        if (!user) {
          throw new Error("Unauthorized");
        }
        console.log("-=-=-=user", user);
        // 🟢 Fetch order
        const order = await Order.findById(orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        // 🟢 Role-based check
        if (user.role === "subadmin") {
          if (order.subadminId.toString() !== user.id.toString()) {
            throw new Error(
              "You are not authorized to assign delivery boy for this order"
            );
          }
        } else if (user.role === "superadmin") {
          if (order.superadminId.toString() !== user.id.toString()) {
            throw new Error(
              "You are not authorized to assign delivery boy for this order"
            );
          }
        } else {
          throw new Error(
            "Only subadmin or superadmin can assign delivery boy"
          );
        }

        // 🟢 Update order with delivery boy
        order.deliveryBoy = deliveryBoyId;
        order.deliveryStatus = "PENDING"; // assigned but not yet accepted
        await order.save();

        return {
          success: true,
          message: "Delivery boy assigned successfully",
          order,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          order: null,
        };
      }
    },

    acceptOrderDeliveryBoy: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        // Check valid state
        if (order.deliveryStatus !== "PENDING") {
          return {
            success: false,
            message: "Order is not in pending state",
            order,
          };
        }

        // ✅ Make sure you use the ENUM values defined in schema
        order.deliveryStatus = "ACCEPTED";

        order.paymentStatus = "PENDING"; // check your enum spelling (PENDING or Pending?)

        await order.save();

        return {
          success: true,
          message: "Order accepted by delivery boy",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },

    // ✅ Delivery boy picks up the order from shop/warehouse
    pickUpOrder: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        if (order.deliveryStatus !== "ACCEPTED") {
          return {
            success: false,
            message: "Order must be accepted before pickup",
            order,
          };
        }

        // Delivery boy ne pickup kar liya
        order.deliveryStatus = "PICKED_UP";

        // Yaha orderStatus bhi update kar sakte ho
        order.orderStatus = "SHIPPED"; // ya "OUT_FOR_DELIVERY" aapke naming ke hisaab se

        await order.save();

        return {
          success: true,
          message: "Order picked up by delivery boy",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },

    // ✅ Delivery boy goes out for delivery
    outForDelivery: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        if (order.deliveryStatus !== "PICKED_UP") {
          return {
            success: false,
            message: "Order must be picked up before going out for delivery",
            order,
          };
        }
        order.orderStatus = "OUT_FOR_DELIVERY";

        order.deliveryStatus = "OUT_FOR_DELIVERY";
        await order.save();

        return {
          success: true,
          message: "Order is out for delivery",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },
    deliverOrder: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        if (order.deliveryStatus !== "OUT_FOR_DELIVERY") {
          return {
            success: false,
            message:
              "Order must be out for delivery before it can be delivered",
            order,
          };
        }

        // if (order.paymentStatus !== "PAID") {
        //   return {
        //     success: false,
        //     message: "Order cannot be delivered until payment is completed",
        //     order,
        //   };
        // }
        order.paymentStatus = "PAID";

        order.orderStatus = "DELIVERED";
        order.deliveryStatus = "DELIVERED";
        await order.save();

        return {
          success: true,
          message: "Order delivered successfully",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },
    cancelOrder: async (_, { orderId, subadminId, superadminId }, { user }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        // Agar already cancelled hai
        if (order.orderStatus === "CANCELLED") {
          return {
            success: false,
            message: "Order is already cancelled",
            order,
          };
        }

        // Sirf admin (superadmin/subadmin) hi cancel kar sakega
        if (
          superadminId &&
          order.superadminId.toString() !== superadminId &&
          subadminId &&
          order.subadminId.toString() !== subadminId
        ) {
          return {
            success: false,
            message: "Not authorized to cancel this order",
            order: null,
          };
        }

        // Cancel order
        order.orderStatus = "CANCELLED";
        order.deliveryStatus = "CANCELLED";
        order.deliveryBoy = null;

        await order.save();

        return {
          success: true,
          message: "Order cancelled successfully",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },

    rejectOrderDeliveryBoy: async (_, { orderId, deliveryBoyId }) => {
      try {
        // 🟢 Order find karo
        const order = await Order.findById(orderId);
        if (!order) {
          return {
            success: false,
            message: "Order not found",
            order: null,
          };
        }

        if (
          !order.deliveryBoy ||
          order.deliveryBoy.toString() !== deliveryBoyId
        ) {
          return {
            success: false,
            message: "This order is not assigned to this delivery boy",
            order,
          };
        }

        // 🟢 Reset delivery boy and status

        order.deliveryStatus = "CANCELLED";
        await order.save();

        return {
          success: true,
          message: "Order cancelled by delivery boy",
          order,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          order: null,
        };
      }
    },
  },
};

module.exports = deliveryBoyResolvers;
