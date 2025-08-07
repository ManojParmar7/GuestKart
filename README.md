# 🛒 GuestKart

**GuestKart** is a modern digital shopping cart platform tailored for the hospitality industry — hotels, resorts, and service apartments — to enhance the guest experience. It supports **seamless shopping without login for guests**, along with a robust **admin authorization system**.

[🔗 GitHub Repository](https://github.com/ManojParmar7/GuestKart.git)

---

## 🌐 Live Preview

_Coming soon or insert deployment link here_

---

## 🏗️ Tech Stack

### 🔹 Frontend
- **Next.js** with **TypeScript**
- **Tailwind CSS** (or your styling library)
- Optimized for performance and scalability

### 🔹 Backend
- **Node.js** + **Express.js**
- **MongoDB** (NoSQL database)
- **GraphQL** for flexible API querying
- **JWT Authentication** for Admin access

---

## 👥 Roles and Permissions

| Role         | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| 🧑‍💼 Super Admin | Full access — manages Sub Admins and system-wide settings.              |
| 👨‍💻 Sub Admin    | Limited access — manages products, categories, and order flow.         |
| 🧍 Guest        | Can browse and shop without login, like a real hotel/resort guest.       |

---

## 🔄 Guest Shopping Flow

1. **Homepage Browsing**  
   Guest lands on the home page without logging in and sees a range of available products/services.

2. **Product Selection**  
   Guest can:
   - View product details
   - Add items to cart
   - View cart summary

3. **No Login Required**  
   Guest proceeds with the cart without creating an account or logging in — reflecting real-world hospitality behavior.

4. **Order Placement**  
   Guest places an order with minimal required details (e.g., room number, name).

5. **Admin Notification**  
   Admins (Super/Sub) receive the order in real-time in their dashboard.

---

## 🔐 Admin Features

- **Login & Secure Access** via JWT
- **Role-Based Authorization**
- **Manage Products**
- **Manage Orders**
- **View Guest Activity**
- **Dashboard Analytics (if implemented)**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ManojParmar7/GuestKart.git
cd GuestKart
