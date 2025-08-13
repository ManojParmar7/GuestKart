// seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Role from "../modals/roles.js";
import User from "../modals/User.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Roles list
    const roles = ["superadmin", "subadmin", "user"];

    for (let role of roles) {
      const exists = await Role.findOne({ name: role });
      if (!exists) {
        await Role.create({ name: role });
        console.log(`Role created: ${role}`);
      }
    }

    // Superadmin user create
    const superAdminRole = await Role.findOne({ name: "superadmin" });
    const superAdminExists = await User.findOne({ email: "admin@example.com" });

    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      await User.create({
        name: "Main Superadmin",
        email: "admin@example.com",
        password: hashedPassword,
        role: superAdminRole._id,
      });
      console.log("Superadmin created!");
    }

    console.log("✅ Seeding complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
