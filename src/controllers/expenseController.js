const expenseService = require('../services/expenseService');

const expenseController = {
  /**
   * Create a new expense
   * POST /api/expenses
   */
  async createExpense(req, res, next) {
    try {
      const expense = await expenseService.addExpense(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Expense added successfully.',
        data: { expense }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all expenses for the authenticated user with filters and search
   * GET /api/expenses
   */
  async getExpenses(req, res, next) {
    try {
      const expenses = await expenseService.getExpenses(req.user.id, req.query);
      res.status(200).json({
        success: true,
        data: {
          count: expenses.length,
          expenses
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single expense by ID
   * GET /api/expenses/:id
   */
  async getExpenseById(req, res, next) {
    try {
      const expense = await expenseService.getExpenseById(req.params.id, req.user.id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or access denied.'
        });
      }

      res.status(200).json({
        success: true,
        data: { expense }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update expense
   * PUT /api/expenses/:id
   */
  async updateExpense(req, res, next) {
    try {
      const updated = await expenseService.updateExpense(req.params.id, req.user.id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or access denied.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Expense updated successfully.',
        data: { expense: updated }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete expense
   * DELETE /api/expenses/:id
   */
  async deleteExpense(req, res, next) {
    try {
      const deleted = await expenseService.deleteExpense(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or access denied.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = expenseController;
