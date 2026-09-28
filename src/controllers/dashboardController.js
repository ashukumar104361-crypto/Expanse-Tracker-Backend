const expenseService = require('../services/expenseService');
const budgetService = require('../services/budgetService');
const expenseModel = require('../models/expenseModel');

const dashboardController = {
  /**
   * Get high-level KPI metrics for the student dashboard
   * GET /api/dashboard/summary
   */
  async getSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const todayStr = now.toISOString().split('T')[0];

      // Monthly spending analysis
      const analysis = await expenseService.getSpendingAnalysis(userId, currentMonth, currentYear);

      // Today's spending
      const todayExpenses = await expenseModel.findAll(userId, {
        startDate: todayStr,
        endDate: todayStr
      });
      const todaySpent = todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // Monthly budget status
      const budgetData = await budgetService.getBudgetsForMonth(userId, currentMonth, currentYear);
      const overallBudget = budgetData.overallBudget;

      // Recent 5 transactions
      const recentExpenses = await expenseModel.findAll(userId, {
        sortBy: 'newest'
      });

      res.status(200).json({
        success: true,
        data: {
          todaySpent,
          totalThisMonth: analysis.totalSpent,
          monthlyBudget: overallBudget.budgetAmount,
          remainingBudget: overallBudget.remainingAmount,
          budgetUsedPercent: overallBudget.percentUsed,
          budgetStatus: overallBudget.status,
          largestExpense: analysis.largestExpense,
          expenseCount: analysis.expenseCount,
          recentExpenses: recentExpenses.slice(0, 5)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get category spending summary for Pie / Donut Chart
   * GET /api/dashboard/category-summary
   */
  async getCategorySummary(req, res, next) {
    try {
      const { month, year } = req.query;
      const analysis = await expenseService.getSpendingAnalysis(req.user.id, month, year);

      res.status(200).json({
        success: true,
        data: {
          totalSpent: analysis.totalSpent,
          categories: analysis.categoryBreakdown,
          necessarySpent: analysis.necessarySpent,
          unnecessarySpent: analysis.unnecessarySpent
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get spending trend (weekly and daily) for Bar / Line Charts
   * GET /api/dashboard/monthly-summary
   */
  async getMonthlySummary(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const targetMonth = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
      const targetYear = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

      const startOfMonth = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

      const expenses = await expenseModel.findAll(userId, {
        startDate: startOfMonth,
        endDate: endOfMonth
      });

      // Daily aggregated spending for Bar Chart
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      const dailyMap = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dailyMap[dateStr] = {
          date: dateStr,
          day: `Day ${day}`,
          amount: 0
        };
      }

      expenses.forEach((e) => {
        if (dailyMap[e.expense_date]) {
          dailyMap[e.expense_date].amount += parseFloat(e.amount);
        }
      });

      // Weekly aggregated spending for Line Chart (Week 1, Week 2, Week 3, Week 4, etc.)
      const weeklyData = [
        { week: 'Week 1', label: '1st - 7th', amount: 0 },
        { week: 'Week 2', label: '8th - 14th', amount: 0 },
        { week: 'Week 3', label: '15th - 21st', amount: 0 },
        { week: 'Week 4', label: '22nd - 28th', amount: 0 },
        { week: 'Week 5', label: '29th - End', amount: 0 }
      ];

      expenses.forEach((e) => {
        const day = parseInt(e.expense_date.split('-')[2], 10);
        const amt = parseFloat(e.amount);
        if (day <= 7) weeklyData[0].amount += amt;
        else if (day <= 14) weeklyData[1].amount += amt;
        else if (day <= 21) weeklyData[2].amount += amt;
        else if (day <= 28) weeklyData[3].amount += amt;
        else weeklyData[4].amount += amt;
      });

      // Day of Week spending (Monday -> Sunday)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeekData = [
        { day: 'Mon', amount: 0 },
        { day: 'Tue', amount: 0 },
        { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 0 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 }
      ];

      expenses.forEach((e) => {
        const d = new Date(e.expense_date);
        const dayName = dayNames[d.getDay()];
        const item = dayOfWeekData.find((x) => x.day === dayName);
        if (item) item.amount += parseFloat(e.amount);
      });

      res.status(200).json({
        success: true,
        data: {
          month: targetMonth,
          year: targetYear,
          daily: Object.values(dailyMap),
          weekly: weeklyData.filter((w, i) => i < 4 || (i === 4 && daysInMonth > 28)),
          dayOfWeek: dayOfWeekData
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
