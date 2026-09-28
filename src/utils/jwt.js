const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generates a signed JWT token
 * @param {object} payload - Data to embed in the token (e.g. { id, email })
 * @returns {string} - Signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Verifies a JWT token
 * @param {string} token - Bearer JWT
 * @returns {object} - Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken
};
