const crypto = require('crypto');

/**
 * Resilient In-Memory Data Store for local testing / before Supabase setup
 */
const users = [];
const expenses = [];
const budgets = [];

// Seed sample demo data for immediate testing if desired
const initSampleData = () => {
  if (users.length > 0) return;

  const demoUserId = '00000000-0000-0000-0000-000000000001';
  // Password is "password123" hashed with bcrypt:
  // $2a$10$wE90Kq4G5t3lD/y6lE4.reC9iN2P.V01l5Rz5k6W8.9t2XqJg4j8.
  users.push({
    id: demoUserId,
    name: 'Ashu Sharma',
    email: 'ashu@example.com',
    password_hash: '$2a$10$Ww4o5Z6mEwL1d9G3/90Vqe9991tO2X2z5a6b7c8d9e0f1g2h3i4j5',
    age: 18,
    monthly_income: 10000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Monthly overall budget: ₹7,000
  budgets.push({
    id: crypto.randomUUID(),
    user_id: demoUserId,
    category_id: null,
    amount: 7000,
    month: currentMonth,
    year: currentYear,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Category budgets
  budgets.push({
    id: crypto.randomUUID(),
    user_id: demoUserId,
    category_id: 1, // Food
    amount: 2500,
    month: currentMonth,
    year: currentYear,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  budgets.push({
    id: crypto.randomUUID(),
    user_id: demoUserId,
    category_id: 4, // Entertainment
    amount: 1500,
    month: currentMonth,
    year: currentYear,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Sample expenses
  const sampleExpenses = [
    { title: 'Pizza with Friends', amount: 350, category_id: 1, date: 0, payment: 'UPI', necessary: false, desc: 'Dominos outing' },
    { title: 'Bus Pass Monthly', amount: 450, category_id: 2, date: 1, payment: 'Card', necessary: true, desc: 'College travel' },
    { title: 'Notebooks & Pens', amount: 220, category_id: 5, date: 2, payment: 'Cash', necessary: true, desc: 'Stationery' },
    { title: 'Movie Ticket - IMAX', amount: 400, category_id: 4, date: 3, payment: 'UPI', necessary: false, desc: 'Weekend movie' },
    { title: 'Mobile Recharge', amount: 299, category_id: 6, date: 4, payment: 'UPI', necessary: true, desc: '5G Data pack' },
    { title: 'Gaming Battle Pass', amount: 650, category_id: 8, date: 5, payment: 'UPI', necessary: false, desc: 'Valorant pass' },
    { title: 'Burger & Shake', amount: 210, category_id: 1, date: 6, payment: 'Cash', necessary: false, desc: 'Evening snack' },
    { title: 'Gym Protein Bar', amount: 150, category_id: 7, date: 7, payment: 'UPI', necessary: true, desc: 'Post workout' },
    { title: 'Spotify Student Plan', amount: 59, category_id: 9, date: 10, payment: 'Card', necessary: false, desc: 'Music sub' },
    { title: 'Metro Smart Card Recharge', amount: 300, category_id: 2, date: 12, payment: 'UPI', necessary: true, desc: 'Travel' },
    { title: 'New T-Shirt', amount: 699, category_id: 3, date: 14, payment: 'Card', necessary: false, desc: 'Sale offer' }
  ];

  sampleExpenses.forEach((exp) => {
    const d = new Date();
    d.setDate(d.getDate() - exp.date);
    expenses.push({
      id: crypto.randomUUID(),
      user_id: demoUserId,
      category_id: exp.category_id,
      amount: exp.amount,
      title: exp.title,
      description: exp.desc,
      expense_date: d.toISOString().split('T')[0],
      payment_method: exp.payment,
      is_necessary: exp.necessary,
      created_at: d.toISOString(),
      updated_at: d.toISOString()
    });
  });
};

initSampleData();

module.exports = {
  users,
  expenses,
  budgets
};
