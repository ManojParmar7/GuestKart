const Role = require("../../modals/roles");

module.exports = {
  Query: {
    getAllRoles: async () => {
      return await Role.find();
    },
    getRole: async (_, { id }) => {
      return await Role.findById(id);
    },
  },

  Mutation: {
    createRole: async (_, { name, description, createdBy }) => {
      try {
        const exists = await Role.findOne({ name });

        if (exists) {
          return {
            success: false,
            message: "Role with this name already exists.",
            role: null,
          };
        }

        const role = new Role({ name, description, createdBy });
        const saved = await role.save();

        return {
          success: true,
          message: "Role created successfully",
          role: saved,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to create role",
          role: null,
        };
      }
    },

    updateRole: async (_, { id, name, description }) => {
      try {
        const updated = await Role.findByIdAndUpdate(
          id,
          { name, description },
          { new: true }
        );

        return {
          success: true,
          message: "Role updated successfully",
          role: updated,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to update role",
          role: null,
        };
      }
    },

    deleteRole: async (_, { id }) => {
      try {
        const deleted = await Role.findByIdAndDelete(id);

        return {
          success: true,
          message: "Role deleted successfully",
          role: deleted,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to delete role",
          role: null,
        };
      }
    },
  },
};
