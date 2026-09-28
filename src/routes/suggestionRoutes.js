const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', suggestionController.getSuggestions);

module.exports = router;
