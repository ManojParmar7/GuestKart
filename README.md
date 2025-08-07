# 🛒 GuestKart

**GuestKart** is a modern and flexible **e-commerce platform** that offers a **quick and hassle-free shopping experience**. With its **guest-first design**, users can **browse products, add to cart, and place orders without logging in** — ideal for casual shoppers or first-time buyers.

It also includes a **role-based admin management system** with a **dynamic dashboard** for managing and tracking products, orders, and performance.

[🔗 GitHub Repository](https://github.com/ManojParmar7/GuestKart.git)

---

## 🌐 Live Preview

_Coming soon or insert deployment link here_

---

## 🏗️ Tech Stack

### 🔹 Frontend
- **Next.js** with **TypeScript**
- **Tailwind CSS**
- **Material UI**

### 🔹 Backend
- **Node.js** + **Express.js**
- **MongoDB**
- **GraphQL**
- **JWT Authentication**
- **Stripe payamnet gatway**


---

## 👥 Roles and Permissions

| Role         | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| 🧑‍💼 Super Admin | Full access — manage Sub Admins, products, orders, and view system dashboard |
| 👨‍💻 Sub Admin    | Limited access — manage assigned products and orders, view limited dashboard |
| 🧍 Guest User   | Shop without login — browse, add to cart, and place orders                |

---

## 🛒 Guest Shopping Flow

1. Browse homepage (no login)
2. View products and add to cart
3. Checkout with name, phone, and address
4. Order placed → visible to admins instantly

---

## 🔐 Admin Features

### 🧑‍💼 Super Admin
- JWT-based secure login
- Manage Sub Admins, Products, Categories, Orders
- Access **dynamic dashboard**:
  - ✅ Total Orders  
  - ✅ Latest Orders  
  - ✅ Total Guests  
  - ✅ Total Products Sold  
  - ✅ Sub Admin Count  
  - ✅ Revenue Stats *(if implemented)*

### 👨‍💻 Sub Admin
- Secure login (restricted access)
- Manage assigned products/orders
- View dashboard **limited to their data only**

---

## 🚀 Getting Started

```bash
git clone https://github.com/ManojParmar7/GuestKart.git
cd GuestKart
