const User = require("../../modals/User");
const Role = require("../../modals/roles"); // Import Role model
const { getCurrencyFromCountry } = require("../utils/countryToCurrency");
const Permission = require("../../modals/permission");
const { saveImage } = require("../../shared/uploadImage");
const { GraphQLUpload } = require("graphql-upload");

module.exports = {
  Query: {
    getAllUsers: async (_, __, { user }) => {
      console.log("user: ", user);
      if (!user) {
        return {
          success: false,
          message: "Unauthorized",
          users: [],
        };
      }

      try {
        let users;

        if (user.role?.name === "superadmin") {
          users = await User.find().populate("role");
        } else {
          users = await User.find({ superadmin_id: user.id }).populate("role");
        }

        return {
          success: true,
          message: "Users fetched successfully",
          users: users,
        };
      } catch (error) {
        console.error("Error fetching users:", error);
        return {
          success: false,
          message: "Failed to fetch users",
          users: [],
        };
      }
    },
    getUser: async (_, { id }) => {
      return await User.findById(id).populate("role");
    },
    // getUsersBySuperadmin: async (
    //   _,
    //   {
    //     superadmin_id,
    //     subadmin_id,
    //     page = 1,
    //     limit = 10,
    //     filters = {},
    //     roleName,
    //   },
    //   { user }
    // ) => {
    //   if (!user) {
    //     return {
    //       success: false,
    //       message: "Unauthorized access",
    //       users: [],
    //     };
    //   }

    //   // ✅ Sirf superadmin khud ke hi data dekh sake
    //   if (user.role !== "superadmin" || user.id !== superadmin_id) {
    //     return {
    //       success: false,
    //       message: "Forbidden: You are not authorized to access this data",
    //       users: [],
    //     };
    //   }

    //   try {
    //     const superadmin = await User.findById(superadmin_id);
    //     if (!superadmin) {
    //       return {
    //         success: false,
    //         message: "Superadmin does not exist",
    //         users: [],
    //       };
    //     }

    //     const query = { superadmin_id };

    //     // ✅ Agar subadmin_id bheja hai toh uske hisaab se filter karo
    //     if (subadmin_id) {
    //       query.subadmin_id = subadmin_id;
    //     }

    //     // ✅ Role filter (subadmin ya deliveryBoy)
    //     if (roleName) {
    //       const roleDoc = await Role.findOne({ name: roleName });
    //       if (!roleDoc) {
    //         return {
    //           success: false,
    //           message: "Invalid role name provided",
    //           users: [],
    //         };
    //       }
    //       query.role = roleDoc._id;
    //     }

    //     // ✅ Extra filters
    //     if (filters.name) {
    //       query.name = { $regex: filters.name, $options: "i" };
    //     }
    //     if (filters.email) {
    //       query.email = { $regex: filters.email, $options: "i" };
    //     }

    //     const skip = (page - 1) * limit;
    //     const users = await User.find(query)
    //       .populate("role")
    //       .skip(skip)
    //       .limit(limit);

    //     const totalUsers = await User.countDocuments(query);

    //     return {
    //       success: true,
    //       message: `${roleName ? roleName : "Users"} fetched successfully`,
    //       users,
    //       total: totalUsers,
    //       page,
    //       limit,
    //     };
    //   } catch (error) {
    //     console.error("Error fetching users by superadmin:", error);
    //     return {
    //       success: false,
    //       message: "Error fetching users",
    //       users: [],
    //     };
    //   }
    // },
    getUsersBySuperadmin: async (
      _,
      {
        superadmin_id,
        subadmin_id,
        page = 1,
        limit = 10,
        filters = {},
        roleName,
      },
      { user }
    ) => {
      if (!user) {
        return {
          success: false,
          message: "Unauthorized access",
          users: [],
        };
      }

      try {
        const query = {};

        // ✅ Agar superadmin login hai
        if (user.role === "superadmin") {
          query.superadmin_id = superadmin_id;
          if (subadmin_id) {
            query.subadmin_id = subadmin_id;
          }
        }
        // ✅ Agar subadmin login hai
        else if (user.role === "subadmin") {
          query.superadmin_id = superadmin_id;
          query.subadmin_id = user.id; // <- logged in subadmin ka id fix hoga
        }
        // ✅ Baaki koi role allowed nahi
        else {
          return {
            success: false,
            message: "Forbidden: You are not authorized to access this data",
            users: [],
          };
        }

        // ✅ Role filter (subadmin ya deliveryBoy)
        if (roleName) {
          const roleDoc = await Role.findOne({ name: roleName });
          if (!roleDoc) {
            return {
              success: false,
              message: "Invalid role name provided",
              users: [],
            };
          }
          query.role = roleDoc._id;
        }

        // ✅ Extra filters
        if (filters.name) {
          query.name = { $regex: filters.name, $options: "i" };
        }
        if (filters.email) {
          query.email = { $regex: filters.email, $options: "i" };
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query)
          .populate("role")
          .skip(skip)
          .limit(limit);

        const totalUsers = await User.countDocuments(query);

        return {
          success: true,
          message: `${roleName ? roleName : "Users"} fetched successfully`,
          users,
          total: totalUsers,
          page,
          limit,
        };
      } catch (error) {
        console.error("Error fetching users by superadmin:", error);
        return {
          success: false,
          message: "Error fetching users",
          users: [],
        };
      }
    },

    // getUsersBySuperadmin: async (_, { superadmin_id }, { user }) => {
    //   if (!user) {
    //     return {
    //       success: false,
    //       message: "Unauthorized access",
    //       users: [],
    //     };
    //   }

    //   // If the user is not superadmin, restrict access
    //   if (user.role !== "superadmin" || user.id !== superadmin_id) {
    //     return {
    //       success: false,
    //       message: "Forbidden: You are not authorized to access this data",
    //       users: [],
    //     };
    //   }

    //   try {
    //     const superadmin = await User.findOne({ _id: superadmin_id }).populate(
    //       "role"
    //     );

    //     if (!superadmin) {
    //       return {
    //         success: false,
    //         message: "Superadmin does not exist",
    //         users: [],
    //       };
    //     }

    //     const users = await User.find({ superadmin_id }).populate("role");

    //     return {
    //       success: true,
    //       message: "Sub admins fetched successfully",
    //       users: users || [],
    //     };
    //   } catch (error) {
    //     console.error("Error fetching subadmins:", error);
    //     return {
    //       success: false,
    //       message: "Error fetching subadmins",
    //       users: [],
    //     };
    //   }
    // },
  },
  Upload: GraphQLUpload,
  Mutation: {
    // createUser: async (
    //   _,
    //   {
    //     name,
    //     username,
    //     email,
    //     phone,
    //     website,
    //     password,
    //     role,
    //     superadmin_id,
    //     country = "IN",
    //     image, // 👈 add this
    //   }
    // ) => {
    //   try {
    //     const currency = getCurrencyFromCountry(country);
    //     const roleDoc = await Role.findById(role);

    //     if (!roleDoc) {
    //       return {
    //         success: false,
    //         message: "Invalid role ID",
    //         users: null,
    //       };
    //     }

    //     // ✅ Handle image upload
    //     let imagePath = null;
    //     if (image) {
    //       imagePath = await saveImage(image); // 👈 Save image using your utility
    //     }

    //     // Create user
    //     const newUser = new User({
    //       name,
    //       username,
    //       email,
    //       phone,
    //       website,
    //       password,
    //       country,
    //       currency,
    //       image: imagePath, // 👈 add image path
    //       role: roleDoc._id,
    //       superadmin_id: roleDoc.name === "subadmin" ? superadmin_id : null,
    //     });

    //     const savedUser = await newUser.save();

    //     // (Subadmin permission logic remains unchanged...)

    //     const populatedUser = await savedUser.populate("role");

    //     return {
    //       success: true,
    //       message: `${
    //         roleDoc.name === "superadmin" ? "Super Admin" : "Sub Admin"
    //       } created successfully.`,
    //       users: [populatedUser],
    //     };
    //   } catch (error) {
    //     console.error("Error in createUser:", error);
    //     return {
    //       success: false,
    //       message: "Something went wrong while creating the user",
    //       users: [],
    //     };
    //   }
    // },
    createUser: async (
      _,
      {
        name,
        username,
        email,
        phone,
        website,
        password,
        role,
        superadmin_id, // ❌ direct use nahi karenge delivery boy ke liye
        subadmin_id, // ✅ frontend se aayega delivery boy create karte waqt
        country = "IN",
        image,
      },
      { user }
    ) => {
      try {
        const currency = getCurrencyFromCountry(country);
        const roleDoc = await Role.findById(role);

        if (!roleDoc) {
          return {
            success: false,
            message: "Invalid role ID",
            users: null,
          };
        }

        // ✅ Only superadmin can create subadmin
        if (roleDoc.name === "subadmin") {
          if (!user || user.role !== "superadmin") {
            return {
              success: false,
              message:
                "Unauthorized access: Please login as a superadmin to create a subadmin.",
              users: null,
            };
          }
        }

        // ✅ Handle image upload
        let imagePath = null;
        if (image) {
          imagePath = await saveImage(image);
        }

        let finalSuperadminId = null;
        let finalSubadminId = null;

        // --- SUPERADMIN creation ---
        if (roleDoc.name === "superadmin") {
          // Check duplicate for superadmin scope
          const existing = await User.findOne({
            role: roleDoc._id,
            $or: [{ username }, { email }],
          });
          if (existing) {
            return {
              success: false,
              message:
                "Username or Email already exists under this role (superadmin)",
              users: null,
            };
          }

          // --- SUBADMIN creation ---
        } else if (roleDoc.name === "subadmin") {
          finalSuperadminId = superadmin_id;

          // Check duplicate for subadmin scope
          const existing = await User.findOne({
            role: roleDoc._id,
            superadmin_id: superadmin_id,
            $or: [{ username }, { email }],
          });
          if (existing) {
            return {
              success: false,
              message: "Username or Email already exists under this subadmin",
              users: null,
            };
          }

          // --- DELIVERY BOY creation ---
        } else if (roleDoc.name === "deliveryBoy") {
          if (!subadmin_id) {
            return {
              success: false,
              message: "Subadmin ID is required to create a delivery boy",
              users: null,
            };
          }

          const subadmin = await User.findById(subadmin_id);
          if (!subadmin || !subadmin.superadmin_id) {
            return {
              success: false,
              message:
                "Invalid subadmin ID or subadmin does not belong to any superadmin",
              users: null,
            };
          }

          finalSubadminId = subadmin_id;
          finalSuperadminId = subadmin.superadmin_id;

          // Check duplicate for delivery boy scope
          const existing = await User.findOne({
            role: roleDoc._id,
            subadmin_id: subadmin_id,
            $or: [{ username }, { email }],
          });
          if (existing) {
            return {
              success: false,
              message:
                "Username or Email already exists under this delivery boy",
              users: null,
            };
          }
        }

        const newUser = new User({
          name,
          username,
          email,
          phone,
          website,
          password,
          country,
          currency,
          image: imagePath,
          role: roleDoc._id,
          superadmin_id: finalSuperadminId,
          subadmin_id: finalSubadminId,
        });

        const savedUser = await newUser.save();
        const populatedUser = await savedUser.populate("role");

        return {
          success: true,
          message: `${
            roleDoc.name === "superadmin"
              ? "Super Admin"
              : roleDoc.name === "subadmin"
              ? "Sub Admin"
              : "Delivery Boy"
          } created successfully.`,
          users: [populatedUser],
        };
      } catch (error) {
        console.error("Error in createUser:", error);
        return {
          success: false,
          message: "Something went wrong while creating the user",
          users: [],
        };
      }
    },

    updateUser: async (_, args) => {
      try {
        const {
          id,
          name,
          username,
          email,
          phone,
          website,
          password,
          role,
          createdBy,
          superadmin_id,
          country,
          image,
        } = args;

        if (!id) {
          return {
            success: false,
            message: "User ID is required",
            users: null,
          };
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (website !== undefined) updateData.website = website;
        if (password !== undefined) updateData.password = password;
        if (role !== undefined) updateData.role = role;
        if (createdBy !== undefined) updateData.createdBy = createdBy;
        if (superadmin_id !== undefined)
          updateData.superadmin_id = superadmin_id;
        if (country !== undefined) {
          updateData.country = country;
          updateData.currency = getCurrencyFromCountry(country);
        }

        if (image) {
          console.log("image: ", image);
          const imagePath = await saveImage(image);
          console.log("imagePath: ", imagePath);
          updateData.image = imagePath;
        }

        const updated = await User.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updated) {
          return {
            success: false,
            message: "Failed to update user",
            users: [],
          };
        }

        const populatedUser = await updated.populate("role");

        return {
          success: true,
          message: `${populatedUser?.role?.name} updated successfully`,
          users: [populatedUser],
        };
      } catch (error) {
        // error handling (same as yours)
      }
    },

    deleteUser: async (_, { id }) => {
      console.log("id: ", id);
      try {
        const deleted = await User.findByIdAndDelete(id);
        console.log("deleted: ", deleted);

        // Check if user was found and deleted
        if (!deleted) {
          return {
            success: false,
            message: "User not found",
            users: [], // Return empty array instead of [null]
          };
        }

        return {
          success: true,
          message: "User deleted successfully",
          users: [deleted], // This will now always contain a valid user object
        };
      } catch (error) {
        console.error("Delete user error:", error);
        return {
          success: false,
          message: "Failed to delete user",
          users: [], // Return empty array on error
        };
      }
    },
  },
};
