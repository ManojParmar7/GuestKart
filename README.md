# 🛒 GuestKart

**GuestKart** is a modern and flexible **e-commerce platform** that offers a **quick and hassle-free shopping experience**. With its **guest-first design**, users can **browse products, add to cart, and place orders without logging in** — ideal for casual shoppers or first-time buyers.

It also includes a **role-based admin management system** for efficiently handling products, categories, and orders.

[🔗 GitHub Repository](https://github.com/ManojParmar7/GuestKart.git)

---

## 🌐 Live Preview

_Coming soon or insert deployment link here_

---

## 🏗️ Tech Stack

### 🔹 Frontend
- **Next.js** with **TypeScript**
- **Tailwind CSS** (or your preferred styling library)
- Optimized for performance and scalability

### 🔹 Backend
- **Node.js** + **Express.js**
- **MongoDB** (NoSQL database)
- **GraphQL** for flexible API querying
- **JWT Authentication** for secure admin access

---

## 👥 Roles and Permissions

| Role         | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| 🧑‍💼 Super Admin | Full access — manage Sub Admins, products, categories, and system settings |
| 👨‍💻 Sub Admin    | Limited access — manage assigned products, categories, and orders         |
| 🧍 Guest User   | Can shop without login — browse, add to cart, and place orders             |

---

## 🛒 Guest Shopping Flow

1. **Homepage Browsing**  
   Guest lands on the homepage without logging in and sees all available products.

2. **Product Selection**  
   - Browse products by category  
   - View product details  
   - Add items to the cart  

3. **Checkout Without Login**  
   Guest proceeds to checkout by filling basic details (name, phone, address).

4. **Order Placement**  
   Order is placed and stored in the backend.

5. **Admin Notification**  
   Admins (Super/Sub) get real-time access to all orders in their dashboard.

---

## 🔐 Admin Features

The platform includes a secure and scalable **admin panel** with **role-based access control**, supporting both **Super Admin** and **Sub Admin** roles.

### 🧑‍💼 Super Admin
- **Secure login** with JWT authentication  
- Full access to the system  
- **Create and manage Sub Admins**  
- **Manage all products, categories, and orders**  
- View complete **guest activity**  
- Access to system-wide **analytics dashboard** (if implemented)

### 👨‍💻 Sub Admin
- **Secure login** with limited access  
- **Manage assigned products and categories**  
- **View and fulfill guest orders**  
- Cannot modify Super Admins or global settings

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ManojParmar7/GuestKart.git
cd GuestKart
