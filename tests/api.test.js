const { test, describe } = require('node:test');
const assert = require('node:assert');
const { hashPassword, comparePassword } = require('../src/utils/password');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const userModel = require('../src/models/userModel');
const expenseModel = require('../src/models/expenseModel');
const expenseService = require('../src/services/expenseService');
const budgetService = require('../src/services/budgetService');
const suggestionService = require('../src/services/suggestionService');

describe('Teenager Expense Tracker - Unit & Logic Tests', () => {
  test('Password Hashing: bcrypt hashes and compares accurately', async () => {
    const rawPass = 'Student@123';
    const hash = await hashPassword(rawPass);

    assert.notStrictEqual(hash, rawPass, 'Password must not be stored in plain text');
    assert.strictEqual(hash.startsWith('$2'), true, 'Password must be a valid bcrypt hash');

    const isValid = await comparePassword(rawPass, hash);
    assert.strictEqual(isValid, true, 'Correct password must validate');

    const isWrong = await comparePassword('WrongPassword', hash);
    assert.strictEqual(isWrong, false, 'Incorrect password must be rejected');
  });

  test('JWT: signs and verifies payload safely', () => {
    const payload = { id: 'u123', email: 'test@student.com', name: 'Tester' };
    const token = generateToken(payload);
    assert.strictEqual(typeof token, 'string');

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, 'u123');
    assert.strictEqual(decoded.email, 'test@student.com');
  });

  test('User Model: registers and fetches user without leaking password hash', async () => {
    const hash = await hashPassword('securePass123');
    const user = await userModel.create({
      name: 'Rohan Gupta',
      email: 'rohan.test@example.com',
      password_hash: hash,
      age: 17,
      monthly_income: 5000
    });

    assert.strictEqual(user.name, 'Rohan Gupta');
    assert.strictEqual(user.email, 'rohan.test@example.com');
    assert.strictEqual(user.password_hash, undefined, 'Created safe user must not contain password_hash');

    const fetched = await userModel.findById(user.id);
    assert.strictEqual(fetched.name, 'Rohan Gupta');
    assert.strictEqual(fetched.password_hash, undefined);
  });

  test('Expense Service: creates expense and aggregates spending analytics', async () => {
    const userId = 'test-user-analytics-01';

    await expenseService.addExpense(userId, {
      title: 'Math Workbook',
      amount: 400,
      category_id: 5, // Education
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'UPI',
      is_necessary: true
    });

    await expenseService.addExpense(userId, {
      title: 'Burger Combo',
      amount: 300,
      category_id: 1, // Food
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash',
      is_necessary: false
    });

    const analysis = await expenseService.getSpendingAnalysis(userId);
    assert.strictEqual(analysis.totalSpent, 700);
    assert.strictEqual(analysis.necessarySpent, 400);
    assert.strictEqual(analysis.unnecessarySpent, 300);
    assert.strictEqual(analysis.expenseCount, 2);
  });

  test('Budget Service: correctly calculates budget usage and status', async () => {
    const userId = 'test-user-budget-01';
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Set ₹1,000 monthly budget
    await budgetService.setBudget(userId, {
      category_id: null,
      amount: 1000,
      month,
      year
    });

    // Add ₹750 expense (75% used -> warning status)
    await expenseService.addExpense(userId, {
      title: 'Headphones',
      amount: 750,
      category_id: 8,
      expense_date: now.toISOString().split('T')[0],
      payment_method: 'Card',
      is_necessary: false
    });

    const overview = await budgetService.getBudgetsForMonth(userId, month, year);
    assert.strictEqual(overview.overallBudget.budgetAmount, 1000);
    assert.strictEqual(overview.overallBudget.totalSpent, 750);
    assert.strictEqual(overview.overallBudget.remainingAmount, 250);
    assert.strictEqual(overview.overallBudget.percentUsed, 75);
    assert.strictEqual(overview.overallBudget.status, 'warning');
  });

  test('Suggestion Service: generates data-driven tips and financial score', async () => {
    const userId = 'test-user-suggestions-01';
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Set budget
    await budgetService.setBudget(userId, {
      category_id: null,
      amount: 2000,
      month,
      year
    });

    // Heavy food spending (>30%)
    await expenseService.addExpense(userId, {
      title: 'Pizza Party',
      amount: 800,
      category_id: 1, // Food
      expense_date: now.toISOString().split('T')[0],
      payment_method: 'UPI',
      is_necessary: false
    });

    const suggestionsData = await suggestionService.generateSuggestions(userId, month, year);
    assert.ok(suggestionsData.healthScore > 0, 'Health score should be computed');
    assert.ok(suggestionsData.suggestions.length > 0, 'Suggestions should be produced');

    const foodTip = suggestionsData.suggestions.find((s) => s.category === 'Food');
    assert.ok(foodTip, 'Food warning should be generated when food spend is over 30%');
  });
});
