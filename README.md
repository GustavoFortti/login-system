
# 🔐 Complete Authentication System

This is a full authentication and user management system using **React**, **Node.js**, **MySQL**, and **Redis**, with support for:

- Email/password login
- Google login
- Email verification
- Password recovery and reset
- Token refresh

---

## 📂 Technologies Used

- **Front-end:** React
- **Back-end:** Node.js (Express)
- **Database:** MySQL
- **Cache / Token store:** Redis
- **Authentication:** JWT (with Refresh Token)
- **OAuth:** Google Login

---

## 📁 Directory Structure

### Front-End

- `Landing Page`
- `Login`
- `Register`
- `Reset Password`
- `Verify Email`
- `Lost Password`
- `ApiClient.js`

### Back-End

- `routes/`
- `controllers/`
- `services/`
- `models/`
- `middlewares/`
- `config/redis.js`, `config/mysql.js`

---

## 🔗 API Endpoints

### 🔑 Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/app/login/sign-in` | Login with email and password |
| POST | `/api/v1/app/login/google-login` | Login with Google account |
| POST | `/api/v1/app/login/refresh-token` | Token refresh (refresh token) |
| POST | `/api/v1/app/login/register` | Register new user |

### 🔁 Password Recovery
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/app/login/lost-password/request-reset` | Send email with reset link |
| POST | `/api/v1/app/login/lost-password/reset-password` | Reset password using link |

### 📩 Email Verification
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/app/login/verify-email` | Email verification (code/link) |

---

## 🧱 Database Structure

### Table: `users`
| Field | Type |
|-------|------|
| id | primary key |
| name | string |
| email | string |
| password | string (encrypted) |
| valid_user | boolean |
| date_of_birth | string |
| creation_date | string |
| last_location | string |

### Table: `email_validation`
| Field | Type |
|-------|------|
| id | primary key |
| user_id | foreign key |
| expire_datetime | datetime |
| email_change_link | string |

### Table: `password_reset`
| Field | Type |
|-------|------|
| id | primary key |
| user_id | foreign key |
| expire_datetime | datetime |
| password_change_link | string |

---

## 🚀 How to Run

1. Clone this repository
2. Set up the `.env` files for the backend (including JWT and Google OAuth keys)
3. Run the backend:
```bash
cd backend
npm install
npm start
```
4. Run the frontend:
```bash
cd frontend
npm install
npm start
```
5. Make sure MySQL and Redis are running and properly configured

---

## ✅ Extra Features

- Password encryption with `bcrypt`
- Refresh tokens stored in Redis
- Expiration validation for email links
- Authentication middleware using JWT
- Multi-device session control
