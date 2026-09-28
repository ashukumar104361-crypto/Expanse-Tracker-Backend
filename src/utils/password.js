const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid non-empty string');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password with an existing bcrypt hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};
