# COMP 3123 Assignment 1 – Secure RESTful Backend API

**Course:** COMP 3123  
**Assignment:** Backend (10%)  
**Due:** Sunday, October 18, 2026 at 11:59 PM

---

## 1. Project Purpose

This application is a secure RESTful backend API built with **Node.js**, **Express**, and **MongoDB**. It provides:

- User registration and authentication
- JWT-based authorization
- Employee CRUD operations with **per-user ownership**
- Input validation, password hashing, rate limiting, Helmet security headers
- Local application logging and a health-check endpoint

A user can only view, create, update, and delete employees that **they** created. Cross-user access is rejected.

---

## 2. Technologies Used

| Category        | Technology              |
|-----------------|-------------------------|
| Runtime         | Node.js (≥ 18)          |
| Framework       | Express.js              |
| Database        | MongoDB + Mongoose      |
| Authentication  | JWT (jsonwebtoken)      |
| Password Hashing| bcryptjs                |
| Validation      | express-validator       |
| Security        | Helmet, express-rate-limit |
| Logging         | Winston + Morgan        |
| Config          | dotenv                  |

---

## 3. Project Structure

```
COMP3123_Assignment1/
├── logs/                     # Local log files (app.log, error.log)
├── src/
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js
│   │   └── employeeController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── validate.js       # Validation result checker
│   │   └── errorHandler.js   # Centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   └── Employee.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── employeeRoutes.js
│   ├── validators/
│   │   ├── userValidators.js
│   │   └── employeeValidators.js
│   ├── utils/
│   │   └── logger.js         # Winston logger
│   ├── app.js                # Express app setup
│   └── server.js             # Entry point
├── .env.example
├── .gitignore
├── package.json
├── postman_collection.json
└── README.md
```

---

## 4. Installation & Setup

### 4.1 Prerequisites

- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas connection string
- Git

### 4.2 Clone the Repository

```bash
git clone https://github.com/<your-username>/Student#_COMP3123_Assignment1.git
cd Student#_COMP3123_Assignment1
```


### 4.3 Install Dependencies

```bash
npm install
```

### 4.4 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set at least:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/comp3123_assignment1
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=1h
```

**Never commit the real `.env` file.**

### 4.5 Start MongoDB

**Local:**

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/data
```

**Atlas:** Use the connection string from your Atlas cluster and put it in `MONGODB_URI`.

### 4.6 Start the Application

```bash
# Production-style
npm start

# Development (with auto-restart if nodemon is installed)
npm run dev
```

You should see log messages confirming MongoDB connection and server startup.

### 4.7 Verify Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": true,
  "message": "API is healthy and running",
  "timestamp": "...",
  "uptime": 12.345,
  "environment": "development"
}
```

---

## 5. Environment Variables

| Variable         | Required | Description                                      | Example |
|------------------|----------|--------------------------------------------------|---------|
| `PORT`           | No       | Server port (default 3000)                       | `3000` |
| `NODE_ENV`       | No       | `development` or `production`                    | `development` |
| `MONGODB_URI`    | **Yes**  | MongoDB connection string                       | `mongodb://127.0.0.1:27017/comp3123_assignment1` |
| `JWT_SECRET`     | **Yes**  | Secret key for signing JWTs (≥ 32 characters)    | (long random string) |
| `JWT_EXPIRES_IN` | No       | Token lifetime (default `1h`)                    | `1h` |

---

## 6. API Endpoints

Base URL: `http://localhost:3000`

### Health Check

| Method | Endpoint   | Auth | Status | Description          |
|--------|------------|------|--------|----------------------|
| GET    | `/health`  | No   | 200    | Server health status  |

### User APIs (`/api/v1/user`)

| # | Method | Endpoint              | Status | Description              |
|---|--------|-----------------------|--------|--------------------------|
| 1 | POST   | `/api/v1/user/signup` | 201    | Register a new user       |
| 2 | POST   | `/api/v1/user/login`  | 200    | Authenticate & get JWT   |

### Employee APIs (`/api/v1/emp`) – **Require JWT**

| # | Method | Endpoint                        | Status | Description                          |
|---|--------|---------------------------------|--------|--------------------------------------|
| 3 | GET    | `/api/v1/emp/employees`         | 200    | List employees owned by the user     |
| 4 | POST   | `/api/v1/emp/employees`         | 201    | Create employee for the user         |
| 5 | GET    | `/api/v1/emp/employees/{eid}`   | 200    | Get one employee (owned by user)     |
| 6 | PUT    | `/api/v1/emp/employees/{eid}`   | 200    | Update employee (owned by user)      |
| 7 | DELETE | `/api/v1/emp/employees?eid=xxx` | 204    | Delete employee (owned by user)      |

---

## 7. Authentication Flow

```
Signup  →  Login  →  JWT generated  →  Client sends
Authorization: Bearer <jwt>  →  Auth middleware verifies
token & loads user  →  Ownership check  →  Employee operation
```

### Signup Request

```http
POST /api/v1/user/signup
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Password1"
}
```

### Login Request (username or email)

```http
POST /api/v1/user/login
Content-Type: application/json

{
  "username": "alice",
  "password": "Password1"
}
```

or

```json
{
  "email": "alice@example.com",
  "password": "Password1"
}
```

Successful login returns:

```json
{
  "status": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

### Using the Token

All employee endpoints require the header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 8. Authorization & Ownership

- Every employee document has a `user` field (ObjectId reference to the User who created it).
- On **create**, the owner is taken from `req.user._id` (the authenticated user). The client cannot supply or change the owner.
- On **read / update / delete**, the query always includes `{ user: req.user._id }`.
- Therefore a user can never retrieve, modify, or delete another user’s employees, even if they know the employee ID.

**Test scenario (required):**

1. Create User A and User B.
2. Login as User A → create employees.
3. Login as User B → create different employees.
4. As User A try to `GET /api/v1/emp/employees/<UserB_employee_id>` → **404**.
5. Same for PUT and DELETE → **404**.
6. Repeat the other way around.

---

## 9. Security Features

### 9.1 Password Hashing

- Passwords are hashed with **bcryptjs** (salt rounds = 12) before storage.
- The password field has `select: false` so it is never returned in queries by default.
- Passwords are never included in API responses.

### 9.2 JWT

- Tokens are signed with `JWT_SECRET`.
- Contain only the user `_id`.
- Expired or invalid tokens are rejected with **401**.

### 9.3 Helmet

Helmet sets security-related HTTP headers (e.g. `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, etc.) to reduce common web vulnerabilities such as XSS, clickjacking, and MIME sniffing.

### 9.4 Rate Limiting

| Scope              | Window     | Max Requests | Status on Exceed |
|--------------------|------------|--------------|------------------|
| Auth endpoints (signup / login) | 15 min | 10           | **429**          |
| All other routes   | 15 min     | 100          | **429**          |

When the limit is exceeded the API returns:

```json
{
  "status": false,
  "message": "Too many authentication attempts from this IP. Please try again after 15 minutes."
}
```

### 9.5 Input Validation

All user-controlled input is validated with **express-validator**:

- Required fields, length limits, email format, positive salary, valid dates, valid MongoDB ObjectIds.
- Validation failures return **400** with a clear list of errors.

### 9.6 Environment Variables

Secrets (`MONGODB_URI`, `JWT_SECRET`) are loaded from `.env` and never committed to Git.

---

## 10. Logging

Logs are written to:

- `logs/app.log` – all levels
- `logs/error.log` – errors only
- Console (colorized in development)

Logged events include:

- Server startup / MongoDB connection
- HTTP requests (method, path, status)
- Successful and failed authentication
- Validation failures
- Authorization / ownership failures
- Application errors

**Intentionally never logged:**

- Passwords
- JWT secrets
- Full tokens
- Database credentials

---

## 11. Error Handling & HTTP Status Codes

| Code | Meaning                | Typical Use                                      |
|------|------------------------|--------------------------------------------------|
| 200  | OK                     | Successful GET / PUT                              |
| 201  | Created                | Successful signup / employee creation            |
| 204  | No Content             | Successful DELETE                                |
| 400  | Bad Request            | Validation failure, malformed body                 |
| 401  | Unauthorized            | Missing / invalid / expired JWT, bad credentials |
| 404  | Not Found              | Employee not found **or** belongs to another user |
| 409  | Conflict               | Duplicate username or email                      |
| 429  | Too Many Requests      | Rate limit exceeded                              |
| 500  | Internal Server Error  | Unexpected server error                          |

Error responses follow a consistent JSON shape:

```json
{
  "status": false,
  "message": "Human-readable message",
  "errors": [ { "field": "...", "message": "..." } ]   // when applicable
}
```

---

## 12. Sample Credentials for Marking

Use these non-sensitive test accounts:

| Username | Email                 | Password    |
|----------|-----------------------|-------------|
| alice    | alice@example.com     | Password1   |
| bob      | bob@example.com       | Password1   |

---

## 13. Testing with Postman

1. Import `postman_collection.json` into Postman.
2. Create an environment variable `baseUrl` = `http://localhost:3000`.
3. Run the **Signup** and **Login** requests; the collection automatically stores the JWT.
4. Subsequent employee requests use the stored token.
5. Test both success and error cases (duplicate user, invalid token, cross-user access, rate limiting, validation failures).

---

## 14. MongoDB Evidence

After running the application and creating users/employees you should see:

- Database name: `comp3123_assignment1`
- Collections: `users`, `employees`
- User documents with **hashed** passwords (never plain text)
- Employee documents containing a `user` field that matches the owner’s `_id`

