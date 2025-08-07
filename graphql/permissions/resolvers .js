const GraphQLJSON = require("graphql-type-json");
const Permission = require("../../modals/permission");
const { GraphQLError } = require("graphql");

module.exports = {
  JSON: GraphQLJSON, // <-- register JSON scalar

  Query: {
    getSubAdminPermissions: async (_, { subadminId }, { user }) => {
      if (!user) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: "UNAUTHORIZED",
            http: { status: 401 },
          },
        });
      }

      // Only allow access if the logged-in user is the subadmin requesting their own permissions
      if (user.role !== "subadmin" || user.id !== subadminId) {
        throw new GraphQLError(
          "Access denied: You are not authorized to view this permission.",
          {
            extensions: {
              code: "FORBIDDEN",
              http: { status: 403 },
            },
          }
        );
      }

      const permission = await Permission.findOne({ subadmin_id: subadminId });

      if (!permission) {
        throw new GraphQLError("Permission not found", {
          extensions: {
            code: "NOT_FOUND",
            http: { status: 404 },
          },
        });
      }

      return permission;
    },

    getPermission: async (_, { superadminId, subadminId }, { user }) => {
      console.log("user: ", user);
      if (!user) throw new Error("Unauthorized");

      // ✅ Only allow superadmin to access this query
      if (user.role !== "superadmin") {
        throw new Error("Forbidden: Only superadmin can access this");
      }

      // ✅ Also ensure the superadminId matches logged-in user
      if (user.id !== superadminId) {
        throw new Error(
          "Forbidden: You are not authorized for this superadmin ID"
        );
      }

      const permission = await Permission.findOne({
        superadmin_id: superadminId,
        subadmin_id: subadminId,
      });

      if (!permission) throw new Error("Permission not found");

      return permission;
    },

    getAllPermissions: async (_, __, { user }) => {
      if (!user || user.role !== "superadmin") {
        throw new Error("Access denied");
      }
      return await Permission.find();
    },
  },

  Mutation: {
    createOrUpdatePermissions: async (
      _,
      { subadmin_id, superadmin_id, modules },
      { user }
    ) => {
      if (!user || user.role !== "superadmin") {
        throw new Error("Only superadmin can set permissions");
      }

      let existing = await Permission.findOne({ subadmin_id });

      if (existing) {
        existing.modules = modules;
        return await existing.save();
      } else {
        const newPermission = new Permission({
          subadmin_id,
          superadmin_id,
          modules,
        });
        return await newPermission.save();
      }
    },
  },
};
