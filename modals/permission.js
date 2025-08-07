const mongoose = require("mongoose");

const crudSchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const modulesSchema = new mongoose.Schema(
  {
    products: crudSchema,
    categories: crudSchema,
    banners: crudSchema,
    orders: {
      view: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
    },
    users: {
      view: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const permissionSchema = new mongoose.Schema(
  {
    superadmin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subadmin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    modules: modulesSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
