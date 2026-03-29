# Auth API – JWT Bearer Token Authentication

A RESTful API built with **Node.js**, **Express.js**, **Mongoose (MongoDB)**, and **JWT** that implements secure user authentication and authorization using Bearer tokens.

---

## 📁 Project Structure

```
auth-api/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register & Login logic
│   └── userController.js     # Profile management
├── middleware/
│   └── authMiddleware.js     # JWT verification + role guard
├── models/
│   └── User.js               # Mongoose User schema
├── routes/
│   ├── authRoutes.js         # /api/auth/*
│   └── userRoutes.js         # /api/user/* (protected)
├── .env.example              # Environment variable template
├── .gitignore
├── package.json
├── README.md
└── server.js                 # Entry point
```
## 📡 API Endpoints

| Method | Endpoint              | Auth Required | Description             |
|--------|-----------------------|---------------|-------------------------|
| POST   | /api/auth/register    | ❌            | Register new user       |
| POST   | /api/auth/login       | ❌            | Login & receive token   |
| GET    | /api/user/profile     | ✅ Bearer     | Get own profile         |
| PUT    | /api/user/profile     | ✅ Bearer     | Update own profile      |
| GET    | /api/user/all         | ✅ Admin only | List all users          |

---

## 🔑 How JWT Auth Works

1. User logs in → server verifies credentials → signs a JWT with `{ id }` payload
2. Client stores the token and sends it in every protected request:
   ```
   Authorization: Bearer eyJhbGci...
   ```
3. The `protect` middleware verifies the token, fetches the user, and attaches them to `req.user`
4. Route handler runs with full access to the authenticated user

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose
- **Auth**: JSON Web Tokens (jsonwebtoken)
- **Password hashing**: bcryptjs

---
