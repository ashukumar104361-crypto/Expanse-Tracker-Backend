const expenseModel = require('../models/expenseModel');
const categoryModel = require('../models/categoryModel');

const expenseService = {
  async addExpense(userId, expenseData) {
    return await expenseModel.create({
      user_id: userId,
      ...expenseData
    });
  },

  async getExpenses(userId, query) {
    let startDate = query.startDate;
    let endDate = query.endDate;

    const now = new Date();

    // Preset timeframe helper
    if (query.timeframe === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      startDate = todayStr;
      endDate = todayStr;
    } else if (query.timeframe === 'this_week') {
      const firstDay = new Date(now);
      const day = now.getDay() || 7;
      firstDay.setDate(now.getDate() - day + 1);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (query.timeframe === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
    } else if (query.timeframe === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
    }

    return await expenseModel.findAll(userId, {
      ...query,
      startDate,
      endDate
    });
  },

  async getExpenseById(id, userId) {
    return await expenseModel.findById(id, userId);
  },

  async updateExpense(id, userId, updates) {
    return await expenseModel.update(id, userId, updates);
  },

  async deleteExpense(id, userId) {
    return await expenseModel.delete(id, userId);
  },

  /**
   * Aggregates and calculates spending metrics from actual expense data
   */
  async getSpendingAnalysis(userId, month, year) {
    const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    const allExpenses = await expenseModel.findAll(userId, {
      startDate: startOfMonth,
      endDate: endOfMonth
    });

    const totalSpent = allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const count = allExpenses.length;
    const avgExpense = count > 0 ? totalSpent / count : 0;

    let largestExpense = null;
    let smallestExpense = null;

    if (count > 0) {
      const sorted = [...allExpenses].sort((a, b) => b.amount - a.amount);
      largestExpense = sorted[0];
      smallestExpense = sorted[sorted.length - 1];
    }

    // Necessary vs Unnecessary
    const necessarySpent = allExpenses
      .filter((e) => e.is_necessary)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const unnecessarySpent = totalSpent - necessarySpent;

    // Category breakdown
    const categoryTotals = {};
    const categories = await categoryModel.findAll();

    categories.forEach((c) => {
      categoryTotals[c.id] = {
        id: c.id,
        name: c.name,
        icon: c.icon,
        total: 0,
        count: 0
      };
    });

    allExpenses.forEach((e) => {
      const catId = e.category_id || 10;
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          id: catId,
          name: e.categories?.name || 'Other',
          icon: e.categories?.icon || 'Tag',
          total: 0,
          count: 0
        };
      }
      categoryTotals[catId].total += parseFloat(e.amount);
      categoryTotals[catId].count += 1;
    });

    const categoryBreakdown = Object.values(categoryTotals)
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
    const leastCategory = categoryBreakdown.length > 0 ? categoryBreakdown[categoryBreakdown.length - 1] : null;

    // Daily breakdown for this month
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dailyAverage = totalSpent / (daysInMonth || 30);

    return {
      month: targetMonth,
      year: targetYear,
      totalSpent,
      expenseCount: count,
      averageExpense: Math.round(avgExpense * 100) / 100,
      largestExpense,
      smallestExpense,
      necessarySpent,
      unnecessarySpent,
      necessaryPercentage: totalSpent > 0 ? Math.round((necessarySpent / totalSpent) * 100) : 0,
      unnecessaryPercentage: totalSpent > 0 ? Math.round((unnecessarySpent / totalSpent) * 100) : 0,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      topCategory,
      leastCategory,
      categoryBreakdown
    };
  }
};

module.exports = expenseService;
