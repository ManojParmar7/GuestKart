const Cart = require("../../modals/cart");
const Product = require("../../modals/Product");
const User = require("../../modals/User");

const cartResolvers = {
  CartItem: {
    product: async (parent) => await Product.findById(parent.productId),
  },

  Cart: {
    user: async (parent) => await User.findById(parent.subadminId),
  },

  Query: {
    getCartBySession: async (_, { sessionId, subadminId }) => {
      const query = {};

      if (sessionId) query.sessionId = sessionId;
      if (subadminId) query.subadminId = subadminId;

      return await Cart.find(query);
    },
  },

  Mutation: {
    // addToCart: async (
    //   _,
    //   { subadminId, sessionId, productId, quantity = 1, selectedOptions }
    // ) => {
    //   const product = await Product.findById(productId);
    //   if (!product) {
    //     return {
    //       success: false,
    //       message: "Product not found",
    //       cart: null,
    //     };
    //   }

    //   if (quantity > product.stock) {
    //     return {
    //       success: false,
    //       message: `Only ${product.stock} items in stock`,
    //       cart: null,
    //     };
    //   }

    //   let cart = await Cart.findOne({ sessionId });

    //   if (!cart) {
    //     cart = new Cart({ subadminId, sessionId, items: [] });
    //   }

    //   // Check if same product with same selectedOptions already exists
    //   const existingItem = cart.items.find(
    //     (item) =>
    //       item.productId.equals(productId) &&
    //       JSON.stringify(item.selectedOptions || {}) ===
    //         JSON.stringify(selectedOptions || {})
    //   );

    //   if (existingItem) {
    //     existingItem.quantity += quantity;
    //   } else {
    //     cart.items.push({ productId, quantity, selectedOptions });
    //   }

    //   await cart.save();

    //   return {
    //     success: true,
    //     message: "Product added to cart",
    //     cart,
    //   };
    // },

    addToCart: async (
      _,
      { subadminId, sessionId, productId, quantity = 1, selectedOptions }
    ) => {
      const product = await Product.findById(productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found",
          cart: null,
        };
      }

      if (quantity > product.stock) {
        return {
          success: false,
          message: `Only ${product.stock} items in stock`,
          cart: null,
        };
      }

      let cart = await Cart.findOne({ sessionId });
      let superadmin_id = null;
      if (subadminId) {
        const subadminUser = await User.findById(subadminId).select(
          "superadmin_id"
        );
        if (subadminUser) {
          superadmin_id = subadminUser.superadmin_id;
        }
      }
      if (!cart) {
        cart = new Cart({
          subadminId,
          sessionId,
          superadminId: superadmin_id,
          items: [],
        });
      }

      let totalOptionPrice = 0;
      if (selectedOptions) {
        if (selectedOptions.color?.price)
          totalOptionPrice += selectedOptions.color.price;
        if (selectedOptions.size?.price)
          totalOptionPrice += selectedOptions.size.price;
        if (Array.isArray(selectedOptions.extras)) {
          selectedOptions.extras.forEach((extra) => {
            if (extra.price) totalOptionPrice += extra.price;
          });
        }
      }

      const existingItem = cart.items.find(
        (item) =>
          item.productId.equals(productId) &&
          JSON.stringify(item.selectedOptions || {}) ===
            JSON.stringify(selectedOptions || {})
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          selectedOptions,
          totalOptionPrice,
        });
      }

      await cart.save();

      return {
        success: true,
        message: "Product added to cart",
        cart,
      };
    },

    removeFromCart: async (_, { sessionId, productId }) => {
      const cart = await Cart.findOne({ sessionId });

      if (!cart) {
        return {
          success: false,
          message: "Cart not found",
          cart: null,
        };
      }

      cart.items = cart.items.filter(
        (item) => !item.productId.equals(productId)
      );

      await cart.save();

      return {
        success: true,
        message: "Product removed from cart",
        cart,
      };
    },

    clearCart: async (_, { sessionId }) => {
      const cart = await Cart.findOne({ sessionId });

      if (!cart) {
        return {
          success: false,
          message: "Cart not found",
          cart: null,
        };
      }

      cart.items = [];

      await cart.save();

      return {
        success: true,
        message: "Cart cleared",
        cart,
      };
    },
  },
};

module.exports = cartResolvers;
