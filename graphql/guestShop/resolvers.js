const crypto = require("crypto");
const Product = require("../../modals/Product");
const Order = require("../../modals/order");
const Discount = require("../../modals/discount");

const cleanContact = (contact) => ({
  name: String(contact.name || "").trim(),
  email: String(contact.email || "").trim().toLowerCase(),
  phone: String(contact.phone || "").trim(),
  address: String(contact.address || "").trim(),
});

const guestOrderPayload = (order) => ({
  orderNumber: order.orderNumber,
  status: order.orderStatus,
  items: order.items.map((item) => ({ productId: item.productId, name: item.name, image: item.image, unitPrice: item.price, quantity: item.quantity })),
  subtotal: order.totalAmount,
  delivery: order.deliveryCharge,
  total: order.finalAmount,
  createdAt: order.createdAt,
});

module.exports = {
  Query: {
    trackGuestOrder: async (_, { orderNumber, email, trackingToken }) => {
      const contact = cleanContact({ email });
      const order = await Order.findOne({ orderNumber, "contactInfo.email": contact.email });
      if (!order || !trackingToken) return null;
      const tokenHash = crypto.createHash("sha256").update(trackingToken).digest("hex");
      if (tokenHash !== order.guestTrackingTokenHash) return null;
      return {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        items: order.items.map((item) => ({ productId: item.productId, name: item.name, image: item.image, unitPrice: item.price, quantity: item.quantity })),
        subtotal: order.totalAmount,
        delivery: order.deliveryCharge,
        total: order.finalAmount,
        createdAt: order.createdAt,
      };
    },
  },
  Mutation: {
    checkoutAsGuest: async (_, { items, contact: rawContact, idempotencyKey }) => {
      const contact = cleanContact(rawContact);
      if (!contact.name || !/^\S+@\S+\.\S+$/.test(contact.email) || !contact.phone || !contact.address) {
        return { success: false, message: "Enter a valid name, email, phone, and delivery address." };
      }
      if (!Array.isArray(items) || !items.length || items.length > 30) {
        return { success: false, message: "Your cart must contain between 1 and 30 items." };
      }
      if (!/^[a-zA-Z0-9-]{12,100}$/.test(idempotencyKey)) {
        return { success: false, message: "Checkout session is invalid. Please refresh your cart." };
      }
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) return { success: true, message: "Order already placed.", order: guestOrderPayload(existing), trackingToken: idempotencyKey };

      const quantities = new Map();
      for (const item of items) {
        const id = String(item.productId);
        const quantity = Number(item.quantity);
        if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
          return { success: false, message: "One or more cart quantities or products are invalid." };
        }
        quantities.set(id, (quantities.get(id) || 0) + quantity);
      }

      const reserved = [];
      try {
        const orderLines = [];
        let storeOwner = null;
        for (const [productId, quantity] of quantities) {
          const product = await Product.findOneAndUpdate(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
          );
          if (!product) throw new Error("A product is unavailable or has insufficient stock. Refresh your cart and try again.");
          reserved.push({ productId: product._id, quantity });
          const owner = { subadminId: String(product.subadminId), superadminId: String(product.superadminId) };
          if (storeOwner && (storeOwner.subadminId !== owner.subadminId || storeOwner.superadminId !== owner.superadminId)) {
            throw new Error("Please place separate orders for products from different stores.");
          }
          storeOwner = owner;
          const discount = await Discount.findOne({ productId: product._id, subadminId: product.subadminId, superadminId: product.superadminId, isActive: true });
          let unitPrice = product.price;
          if (discount?.type === "percentage") unitPrice -= (unitPrice * discount.value) / 100;
          if (discount?.type === "flat") unitPrice -= discount.value;
          unitPrice = Math.max(0, Math.round(unitPrice * 100) / 100);
          orderLines.push({
            productId: product._id,
            name: product.name,
            image: product.images?.[0] || "",
            unitPrice: Number(unitPrice),
            quantity,
          });
        }
        const subtotal = Math.round(orderLines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100;
        const delivery = subtotal >= 999 ? 0 : 49;
        const token = idempotencyKey;
        const orderNumber = `GK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
        const order = await Order.create({
          orderNumber,
          idempotencyKey,
          guestTrackingTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
          subadminId: storeOwner.subadminId,
          superadminId: storeOwner.superadminId,
          contactInfo: contact,
          items: orderLines.map((item) => ({ productId: item.productId, name: item.name, image: item.image, price: item.unitPrice, quantity: item.quantity })),
          totalAmount: subtotal,
          deliveryCharge: delivery,
          finalAmount: subtotal + delivery,
          discountAmount: 0,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          orderStatus: "PLACED",
          sessionId: `guest:${contact.email}`,
          createdBy: { name: contact.name, role: "guest" },
        });
        return { success: true, message: "Your order is confirmed.", order: guestOrderPayload(order), trackingToken: token };
      } catch (error) {
        await Promise.all(reserved.map(({ productId, quantity }) => Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })));
        if (error.code === 11000) {
          const order = await Order.findOne({ idempotencyKey });
          if (order) return { success: true, message: "Order already placed.", order: guestOrderPayload(order), trackingToken: idempotencyKey };
        }
        return { success: false, message: error.message || "Checkout could not be completed." };
      }
    },
  },
};
