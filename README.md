# Teenager Expense Tracker — Backend API

Production-ready REST API built with Node.js, Express, Supabase (PostgreSQL), and MVC Architecture.

---

## 🚀 Features
- **MVC Architecture**: Clean separation between Models, Services, Controllers, and Routes.
- **bcrypt Password Hashing**: Passwords are never stored in plain text. Salt rounds = 10.
- **JWT Authentication**: Secure Bearer tokens with user ownership enforcement on all data routes.
- **Expense CRUD**: Complete management with date presets, filtering, category tagging, search, and sorting.
- **Budget Tracking**: Overall monthly budgets and individual category budgets with visual status alerts (`normal`, `warning`, `near_limit`, `over_budget`).
- **Data-Driven Smart Suggestions**: Actionable spending tips for teenagers and students (e.g. food threshold alerts, impulse/unnecessary spending analysis, week-over-week trends).
- **Supabase PostgreSQL & Local Dev Fallback**: Works directly with Supabase, and provides immediate local storage if Supabase credentials are not yet configured.

---

## 📁 Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # Supabase client & connection handler
│   │   └── env.js                # Environment variable validation
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile, Password
│   │   ├── budgetController.js   # Monthly and category budgets
│   │   ├── categoryController.js # Categories list
│   │   ├── dashboardController.js# Summary metrics, charts data
│   │   ├── expenseController.js  # Expense CRUD
│   │   └── suggestionController.js# Smart spending tips
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer JWT verification
│   │   ├── errorMiddleware.js    # 404 & Centralized error handler
│   │   └── validationMiddleware.js# Request payload validation
│   ├── models/
│   │   ├── budgetModel.js        # Budget data access
│   │   ├── categoryModel.js      # Category data access
│   │   ├── expenseModel.js       # Expense data access
│   │   ├── userModel.js          # User data access
│   │   └── localStore.js         # Local dev store & seed demo data
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── suggestionRoutes.js
│   ├── services/
│   │   ├── budgetService.js      # Budget status calculations
│   │   ├── expenseService.js     # Analytics and calculations
│   │   └── suggestionService.js  # Recommendation rules engine
│   ├── utils/
│   │   ├── jwt.js                # JWT sign & verify
│   │   ├── password.js           # bcrypt hash & compare
│   │   └── validators.js         # Input sanitization
│   ├── app.js                    # Express app configuration
│   └── server.js                 # HTTP bootstrap
├── tests/
│   └── api.test.js               # Comprehensive unit & logic tests
├── supabase_schema.sql           # Complete Supabase PostgreSQL schema
├── .env.example
├── package.json
└── README.md
```

---

## 🛠️ Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)
- (Optional for cloud DB) Free [Supabase](https://supabase.com) account

---

## ⚙️ Installation & Running

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Supabase Database Setup:**
   - Log in to your Supabase Dashboard.
   - Go to the **SQL Editor**.
   - Copy and paste the entire contents of `backend/supabase_schema.sql` and click **Run**.
   - Copy your Project URL, Anon Key, and Service Role Key from **Settings > API**.
   - Add them to `backend/.env`.

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Or production mode:
   ```bash
   npm start
   ```

5. **Run Tests:**
   ```bash
   npm test
   ```

---

## 📡 API Endpoints Summary

### Auth
- `POST /api/auth/register` - Create new student account
- `POST /api/auth/login` - Authenticate & receive JWT
- `GET /api/auth/me` - Get profile of logged-in user
- `PUT /api/auth/profile` - Update name, age, monthly income
- `PUT /api/auth/change-password` - Change password securely with bcrypt

### Expenses (Protected)
- `GET /api/expenses` - List user expenses with filters (`timeframe`, `category_id`, `is_necessary`, `search`, `sortBy`)
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/:id` - Get specific expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Remove expense

### Budgets (Protected)
- `GET /api/budgets?month=X&year=Y` - Get monthly & category budget statuses
- `POST /api/budgets` - Set monthly or category budget
- `DELETE /api/budgets/:id` - Delete budget limit

### Dashboard & Analytics (Protected)
- `GET /api/dashboard/summary` - KPIs: Today, This Month, Remaining, Largest Expense
- `GET /api/dashboard/category-summary` - Category breakdown for Pie Chart
- `GET /api/dashboard/monthly-summary` - Daily, weekly, day-of-week trends for Bar/Line Charts

### Smart Suggestions (Protected)
- `GET /api/suggestions` - Personalized tips and financial awareness score
