const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validationMiddleware');

// All budget routes require authentication
router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.post('/', validateBudget, budgetController.setBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
