const budgetService = require('../services/budgetService');

const budgetController = {
  /**
   * Set or update budget
   * POST /api/budgets
   */
  async setBudget(req, res, next) {
    try {
      const budget = await budgetService.setBudget(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Budget saved successfully.',
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get budgets and spending breakdown for a specific month/year
   * GET /api/budgets
   */
  async getBudgets(req, res, next) {
    try {
      const { month, year } = req.query;
      const budgetOverview = await budgetService.getBudgetsForMonth(req.user.id, month, year);
      res.status(200).json({
        success: true,
        data: budgetOverview
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a budget target
   * DELETE /api/budgets/:id
   */
  async deleteBudget(req, res, next) {
    try {
      const deleted = await budgetService.deleteBudget(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or access denied.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Budget deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = budgetController;
