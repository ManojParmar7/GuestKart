const Order = require("../../modals/Order");
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
    // ✅ Assign order to delivery boy (done by subadmin)
    assignOrderToDeliveryBoy: async (_, { orderId, deliveryBoyId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        order.deliveryBoy = deliveryBoyId;
        order.deliveryStatus = "PENDING"; // assigned but not accepted
        await order.save();

        return {
          success: true,
          message: "Order assigned to delivery boy",
          order,
        };
      } catch (error) {
        return { success: false, message: error.message, order: null };
      }
    },

    // ✅ Delivery boy accepts assigned order
    acceptOrder: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        if (order.deliveryStatus !== "PENDING") {
          return {
            success: false,
            message: "Order already accepted or delivered",
            order,
          };
        }

        order.deliveryStatus = "ACCEPTED";
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

    // ✅ Delivery boy marks order as delivered
    deliverOrder: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return { success: false, message: "Order not found", order: null };
        }

        if (order.deliveryStatus !== "ACCEPTED") {
          return {
            success: false,
            message: "Order must be accepted first",
            order,
          };
        }

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
  },
};

module.exports = deliveryBoyResolvers;
