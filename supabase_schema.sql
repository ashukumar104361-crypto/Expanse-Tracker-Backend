-- ==============================================================================
-- TEENAGER EXPENSE TRACKER - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    age INT CHECK (age >= 10 AND age <= 100),
    monthly_income NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Tag',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer', 'Other')),
    is_necessary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Budgets Table (Supports both Overall Monthly Budget when category_id is NULL, or Category Budget)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category_month_year UNIQUE NULLS NOT DISTINCT (user_id, category_id, month, year)
);

-- 6. Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);

-- 7. Seed Default Teenager-Friendly Categories
INSERT INTO categories (name, description, icon) VALUES
('Food', 'Snacks, street food, lunch, cafe visits', 'Utensils'),
('Travel', 'Bus fares, metro, auto, cab, petrol', 'Bus'),
('Shopping', 'Clothes, footwear, personal items', 'ShoppingBag'),
('Entertainment', 'Movies, concerts, theme parks, outings', 'Film'),
('Education', 'Books, stationery, tuition, course materials', 'BookOpen'),
('Bills', 'Mobile recharge, Wi-Fi share, pocket bills', 'Receipt'),
('Health', 'Medicines, gym, sports supplements, checkups', 'HeartPulse'),
('Gaming', 'Game purchases, in-game skins, battle passes', 'Gamepad2'),
('Subscriptions', 'Spotify, Netflix, YouTube Premium, Discord Nitro', 'Tv'),
('Other', 'Miscellaneous and unexpected spending', 'CircleDollarSign')
ON CONFLICT (name) DO NOTHING;

-- 8. Row Level Security (RLS) Policies (Optional for direct client, enforced in backend via user_id)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can view default categories
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
