# Expense Tracker

A simple, lightweight, and secure Expense Tracker web application built with **Node.js, Express, Lowdb**, and **Vanilla HTML/CSS/JavaScript**. It features JWT-based user authentication and full CRUD operations for managing expenses.

## 🔗 Live Demo
You can view the live demo here:  
👉 **[Live Demo Link](YOUR_LIVE_DEMO_LINK_HERE)**

---

## 🚀 Features
- **User Authentication**: Secure Sign Up and Log In utilizing password hashing (`bcryptjs`) and JSON Web Tokens (`jsonwebtoken`).
- **Expense Management (CRUD)**: Create, Read, Update, and Delete expenses.
- **Local Data Persistence**: Uses `lowdb` (a lightweight JSON database) to store users and expenses locally in a `db.json` file.
- **Interactive UI**: Sleek, single-page application frontend served statically from the `public/` directory.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Lowdb (local JSON file-based database)
- **Security**: JSON Web Tokens (JWT) for session management, bcryptjs for password encryption

---

## 📦 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v14 or higher recommended).

### 2. Clone and Install Dependencies
Navigate to the project root directory and run:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You can copy the template from `.env.example`:
```bash
cp .env.example .env
```
Open the `.env` file and configure your values:
```env
PORT=5001
JWT_SECRET=your_jwt_secret_here
```

### 4. Running the Application
Start the server by running:
```bash
node server.js
```
The application will be accessible at: **`http://localhost:5001`** (or whichever port you configured).

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Registers a new user.
* `POST /api/auth/login` - Authenticates user and returns a JWT token.

### Expenses (`/api/expenses`)
* `GET /api/expenses` - Retrieve all expenses for the authenticated user (requires Authorization header).
* `POST /api/expenses` - Add a new expense (requires Authorization header).
* `PUT /api/expenses/:id` - Update an existing expense (requires Authorization header).
* `DELETE /api/expenses/:id` - Delete an expense (requires Authorization header).
