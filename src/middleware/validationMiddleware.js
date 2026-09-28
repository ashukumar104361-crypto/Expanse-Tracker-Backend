const {
  isValidEmail,
  isValidPassword,
  isValidAmount,
  isValidPaymentMethod
} = require('../utils/validators');

const validateRegister = (req, res, next) => {
  const { name, email, password, age, monthlyIncome } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  if (age !== undefined && age !== null) {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      return res.status(400).json({ success: false, message: 'Age must be between 10 and 100.' });
    }
  }

  if (monthlyIncome !== undefined && monthlyIncome !== null) {
    const incomeNum = Number(monthlyIncome);
    if (isNaN(incomeNum) || incomeNum < 0) {
      return res.status(400).json({ success: false, message: 'Monthly income cannot be negative.' });
    }
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
};

const validateExpense = (req, res, next) => {
  const { title, amount, category_id, expense_date, payment_method } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Expense title is required.' });
  }

  if (!isValidAmount(amount)) {
    return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0.' });
  }

  if (!category_id) {
    return res.status(400).json({ success: false, message: 'Category must be selected.' });
  }

  if (expense_date && isNaN(Date.parse(expense_date))) {
    return res.status(400).json({ success: false, message: 'A valid date is required (YYYY-MM-DD).' });
  }

  if (payment_method && !isValidPaymentMethod(payment_method)) {
    return res.status(400).json({
      success: false,
      message: 'Payment method must be one of: Cash, UPI, Card, Bank Transfer, Other.'
    });
  }

  next();
};

const validateBudget = (req, res, next) => {
  const { amount, month, year } = req.body;

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) < 0) {
    return res.status(400).json({ success: false, message: 'Budget amount must be a non-negative number.' });
  }

  const monthNum = parseInt(month, 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ success: false, message: 'Month must be between 1 and 12.' });
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
    return res.status(400).json({ success: false, message: 'Year must be a valid 4-digit year.' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateExpense,
  validateBudget
};
