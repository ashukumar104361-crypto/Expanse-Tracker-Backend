const budgetModel = require('../models/budgetModel');
const expenseModel = require('../models/expenseModel');

const budgetService = {
  async setBudget(userId, data) {
    return await budgetModel.upsert({
      user_id: userId,
      ...data
    });
  },

  async getBudgetsForMonth(userId, month, year) {
    const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

    const budgets = await budgetModel.findByMonthAndYear(userId, targetMonth, targetYear);

    // Get expenses for this month to calculate spent vs budgeted
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    const monthlyExpenses = await expenseModel.findAll(userId, {
      startDate: startOfMonth,
      endDate: endOfMonth
    });

    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Find overall monthly budget (category_id is null)
    const overallBudgetRecord = budgets.find((b) => b.category_id === null);
    const overallBudgetAmount = overallBudgetRecord ? parseFloat(overallBudgetRecord.amount) : 0;

    let overallStatus = 'normal';
    const percentUsed =
      overallBudgetAmount > 0
        ? Math.round((totalSpent / overallBudgetAmount) * 100 * 10) / 10
        : 0;

    if (overallBudgetAmount > 0) {
      if (percentUsed > 100) {
        overallStatus = 'over_budget';
      } else if (percentUsed >= 90) {
        overallStatus = 'near_limit';
      } else if (percentUsed >= 70) {
        overallStatus = 'warning';
      } else {
        overallStatus = 'normal';
      }
    }

    // Category budgets with spent amounts
    const categoryBudgets = budgets
      .filter((b) => b.category_id !== null)
      .map((b) => {
        const catSpent = monthlyExpenses
          .filter((e) => Number(e.category_id) === Number(b.category_id))
          .reduce((sum, e) => sum + parseFloat(e.amount), 0);

        const bAmount = parseFloat(b.amount);
        const catPercent = bAmount > 0 ? Math.round((catSpent / bAmount) * 100 * 10) / 10 : 0;

        let status = 'normal';
        if (catPercent > 100) status = 'over_budget';
        else if (catPercent >= 90) status = 'near_limit';
        else if (catPercent >= 70) status = 'warning';

        return {
          id: b.id,
          category_id: b.category_id,
          category_name: b.categories?.name || 'Category',
          category_icon: b.categories?.icon || 'Tag',
          budget_amount: bAmount,
          spent_amount: catSpent,
          remaining_amount: Math.max(0, bAmount - catSpent),
          percent_used: catPercent,
          status
        };
      });

    return {
      month: targetMonth,
      year: targetYear,
      overallBudget: {
        id: overallBudgetRecord ? overallBudgetRecord.id : null,
        budgetAmount: overallBudgetAmount,
        totalSpent,
        remainingAmount: Math.max(0, overallBudgetAmount - totalSpent),
        percentUsed,
        status: overallStatus
      },
      categoryBudgets
    };
  },

  async deleteBudget(id, userId) {
    return await budgetModel.delete(id, userId);
  }
};

module.exports = budgetService;
