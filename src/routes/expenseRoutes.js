const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validationMiddleware');

// All expense routes require authentication
router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.post('/', validateExpense, expenseController.createExpense);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
