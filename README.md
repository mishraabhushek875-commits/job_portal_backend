# 🔍 Lost & Found — Backend API

A RESTful backend for the Lost & Found application, built with Node.js, Express, and MongoDB. Supports user authentication, item management, and real-time features via Socket.io.

---

## 🛠️ Tech Stack

| Package | Version | Purpose |
|---|---|---|
| express | ^5.2.1 | Web framework |
| mongoose | ^9.3.0 | MongoDB ODM |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| bcryptjs | ^3.0.3 | Password hashing |
| cors | ^2.8.6 | Cross-origin requests |
| dotenv | ^17.3.1 | Environment variables |
| express-validator | ^7.3.1 | Input validation |
| socket.io | ^4.8.3 | Real-time communication |
| nodemon | ^3.1.14 | Dev auto-restart |

---

## 📁 Project Structure

```
backend/
├── server.js           # Entry point
├── .env                # Environment variables (not committed)
├── .env.example        # Env template
├── package.json
└── src/
    ├── config/
    │   └── db.js       # MongoDB connection
    ├── routes/
    │   ├── auth.js     # /auth/login, /auth/signup
    │   └── items.js    # /items CRUD routes
    ├── controllers/
    │   ├── authController.js
    │   └── itemController.js
    ├── models/
    │   ├── User.js
    │   └── Item.js
    └── middleware/
        └── authMiddleware.js
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lost-and-found
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 4. Start the server

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

Server will run on: `http://localhost:5000`

---

## 🔐 API Endpoints

### Auth Routes — `/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/signup` | Register new user | ❌ |
| POST | `/auth/login` | Login user/admin | ❌ |

#### POST `/auth/signup`
```json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "64abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### POST `/auth/login`
```json
// Request Body
{
  "email": "john@example.com",
  "password": "yourpassword"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "64abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"   // "user" | "admin"
    }
  }
}
```

---

### Item Routes — `/items`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/items` | Get all items (paginated) | ✅ |
| GET | `/items/:id` | Get single item by ID | ✅ |
| POST | `/items` | Create new item | ✅ |
| PUT | `/items/:id` | Update item | ✅ Admin |
| DELETE | `/items/:id` | Delete item | ✅ Admin |

#### Query Params for GET `/items`

```
GET /items?page=1&status=lost
GET /items?page=2&status=found
```

| Param | Type | Default | Description |
|---|---|---|---|
| page | Number | 1 | Page number |
| status | String | all | `lost` or `found` |

---

## 🔑 Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| `user` | Can view items, submit reports, manage own claims |
| `admin` | Full access — manage all items, view claims, edit/delete |

---

## 🌐 CORS Configuration

Allowed origin is set via `CLIENT_URL` in `.env`.

```js
// Default allowed origin
http://localhost:5173
```

---

## 🔴 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials"
  }
}
```

| Status Code | Meaning |
|---|---|
| 400 | Bad request / Validation error |
| 401 | Unauthorized — invalid or missing token |
| 403 | Forbidden — insufficient role |
| 404 | Resource not found |
| 500 | Internal server error |

---

## 🚀 Scripts

```bash
npm run dev     # Start with nodemon (development)
npm start       # Start normally (production)
npm test        # Run tests
```

---

## 📦 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: 5000) |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |

---

## 📝 Notes

- This project uses **ES Modules** (`"type": "module"` in package.json) — use `import/export` syntax, not `require()`
- JWT tokens expire in **1 day** by default
- Passwords are hashed using **bcryptjs** before storing in DB
- Input validation is handled by **express-validator**

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

ISC