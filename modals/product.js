// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Product name is required"],
//       trim: true,
//     },
//     price: {
//       type: Number,
//       required: [true, "Price is required"],
//       min: [0, "Price must be a positive number"],
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     stock: {
//       type: Number,
//       required: [true, "Stock quantity is required"],
//       min: [0, "Stock cannot be negative"],
//     },
//     images: {
//       type: [String],
//       default: [],
//     },
//     categoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt fields automatically
//   }
// );

// module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    description: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    sizes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
      },
    ],
    colors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
      },
    ],
    extras: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Extra",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
