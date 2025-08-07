const jwt = require("jsonwebtoken");
const User = require("../../modals/User");

const SECRET = process.env.JWT_SECRET || "defaultSecretKey";

const login = async (_, { email, password }) => {
  const user = await User.findOne({ email }).populate("role");

  if (!user || user.password !== password) {
    return {
      success: false,
      message: "Invalid credentials",
      token: null,
      user: null,
    };
  }

  const payload = {
    id: user._id,
    role: user.role,
    superadmin_id: user.superadmin_id || null,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: "7d" });

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      superadmin_id: user.superadmin_id || null,
      token,
    },
  };
};

module.exports = {
  Mutation: { login },
};
