const User = require("../../modals/User"); // tumhara User model
const Roles = require("../../modals/roles"); // tumhara User model

const defaultUsers = [
  {
    _id: "688354932a05e53a0c3ab6e2",
    name: "ManojSuperAdmin",
    username: "manojsuperadmin",
    email: "manojsuperadmin@gmail.com",
    phone: "7038595952",
    website: "https://manojsuperadmin.com",
    role: "688326d5a1f7b1ab29864ae2",
    superadmin_id: null,
    createdAt: "2025-07-25T09:55:31.510+00:00",
    updatedAt: "2025-08-14T10:46:12.179+00:00",
    __v: 0,
    password: "manoj@1234567",
    image: "/uploads/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg",
  },
  {
    _id: "6878e96dbc96d338372b5f23",
    name: "Manoj",
    username: "manojsubadmin@gmail.com",
    email: "manojsubadmin@gmail.com",
    phone: "7038595952",
    website: "www.com",
    __v: 0,
    role: "68834193879abef2a86727fe",
    superadmin_id: "688354932a05e53a0c3ab6e2",
    updatedAt: "2025-08-14T10:47:33.276+00:00",
    password: "123456789",
    country: "IN",
    currency: "INR",
    image: "/uploads/premium_photo-1689568126014-06fea9d5d341.jfif",
  },
  {
    id: "6878e96dbc96d338372b5f23",
    name: "Manoj",
    username: "manojsubadmin@gmail.com",
    email: "manojsubadmin@gmail.com",
    phone: "7038595952",
    website: "www.com",
    __v: 0,
    role: "68834193879abef2a86727fe",
    superadmin_id: "688354932a05e53a0c3ab6e2",
    updatedAt: "2025-08-14T10:47:33.276+00:00",
    password: "123456789",
    country: "IN",
    currency: "INR",
    image: "/uploads/premium_photo-1689568126014-06fea9d5d341.jfif",
  },
  {
    _id: "688354cf2a05e53a0c3ab6e6",
    name: "sub admin",
    username: "manojsubadmin",
    email: "subadmin@example.com",
    phone: "1234567890",
    website: "https://manojsubadmin.com",
    role: "68834193879abef2a86727fe",
    superadmin_id: "688354932a05e53a0c3ab6e2",
    createdAt: "2025-07-25T09:56:31.622+00:00",
    updatedAt: "2025-08-06T12:52:34.805+00:00",
    __v: 0,
    password: "manojsubadmin@123",
    image: "/uploads/photo1.png",
  },
  {
    _id: "68ad701fad6e0d702eb4e3da",
    name: "delivery boy 1",
    username: "deliveryboy1@123",
    email: "deliveryboy1@gmail.com",
    phone: "7038595952",
    website: "deliveryboy1@gmail.com",
    password: "12345678",
    role: "68ad4f822e084212b5aeaa0f",
    superadmin_id: "688354932a05e53a0c3ab6e2",
    subadmin_id: "6878e96dbc96d338372b5f23",
    image: "/uploads/photo1.png",
    country: "IN",
    currency: "INR",
    createdAt: "2025-08-26T08:28:15.496+00:00",
    updatedAt: "2025-08-26T08:28:15.496+00:00",
  },

  {
    _id: "68ad6b275c15a7359176e45e",
    name: "delivery boy 2",
    username: "deliveryboy@123",
    email: "deliveryboy@gmail.com",
    phone: "7038595952",
    website: "deliveryboy@gmail.com",
    password: "12345678",
    role: "68ad4f822e084212b5aeaa0f",
    superadmin_id: "688354932a05e53a0c3ab6e2",
    subadmin_id: "6878e96dbc96d338372b5f23",
    image: "/uploads/photo1.png",
    country: "IN",
    currency: "INR",
    createdAt: "2025-08-26T08:07:03.047+00:00",
    updatedAt: "2025-08-26T08:07:03.047+00:00",
  },
];
const defaultRoles = [
  {
    _id: "688326d5a1f7b1ab29864ae2",
    name: "superadmin",
    description: "superadmin",
    createdAt: "2025-07-25T06:40:21.121Z",
    updatedAt: "2025-07-25T06:40:21.121Z",
    __v: 0,
  },
  {
    _id: "68834193879abef2a86727fe",
    name: "subadmin",
    description: "subadmin",
    createdAt: "2025-07-25T08:34:27.867Z",
    updatedAt: "2025-07-25T08:34:27.867Z",
    __v: 0,
  },
  {
    _id: "68ad4f822e084212b5aeaa0f",
    name: "deliveryBoy",
    description: "delivery Boy",
    createdAt: "2025-08-26T06:09:06.205Z",
    updatedAt: "2025-08-26T06:09:06.205Z",
    __v: 0,
  },
];
async function seedUsers() {
  for (const user of defaultUsers) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      await User.create(user);
      console.log(`✅ User created: ${user.email}`);
    }
  }

  for (const role of defaultRoles) {
    const exists = await Roles.findOne({ name: role.name });
    if (!exists) {
      await Roles.create(role);
      console.log(`✅ Role created: ${role.name}`);
    }
  }
}

module.exports = seedUsers;
