/**
 * Reusable input validation functions
 */

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const isValidAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
};

const isValidPaymentMethod = (method) => {
  const allowed = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
  return allowed.includes(method);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidAmount,
  isValidPaymentMethod
};
