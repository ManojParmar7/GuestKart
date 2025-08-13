const Role = require("../../modals/roles");

module.exports = {
  Query: {
    getAllRoles: async (_, { page, limit, search = "" }) => {
      try {
        let query = {};

        if (search) {
          query.name = { $regex: search, $options: "i" };
        }

        // Agar page ya limit nahi diya hai, to direct sabhi roles return karo
        if (!page || !limit) {
          const roles = await Role.find(query).sort({ createdAt: -1 });
          return {
            success: true,
            message: "Roles fetched successfully",
            total: roles.length,
            currentPage: null,
            totalPages: null,
            roles,
          };
        }

        // Pagination logic
        const skip = (page - 1) * limit;
        const total = await Role.countDocuments(query);
        const roles = await Role.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        return {
          success: true,
          message: "Roles fetched successfully",
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          roles,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to fetch roles",
          total: 0,
          currentPage: null,
          totalPages: null,
          roles: [],
        };
      }
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
