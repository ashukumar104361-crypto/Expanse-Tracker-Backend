const expenseService = require('./expenseService');
const budgetService = require('./budgetService');
const expenseModel = require('../models/expenseModel');

const suggestionService = {
  async generateSuggestions(userId, month, year) {
    const analysis = await expenseService.getSpendingAnalysis(userId, month, year);
    const budgetData = await budgetService.getBudgetsForMonth(userId, month, year);

    const suggestions = [];
    const totalSpent = analysis.totalSpent;

    if (totalSpent === 0) {
      return {
        healthScore: 100,
        badge: 'Fresh Start 🚀',
        summary: 'No expenses recorded for this month yet. Add your daily spending to get personalized tips!',
        suggestions: [
          {
            type: 'info',
            title: 'Start Tracking',
            message: 'Track every snack, travel fare, and purchase to see where your money actually goes.'
          }
        ]
      };
    }

    // 1. Food Check
    const foodCat = analysis.categoryBreakdown.find(
      (c) => c.name.toLowerCase() === 'food' || c.name.toLowerCase() === 'snacks'
    );
    if (foodCat && totalSpent > 0 && foodCat.total / totalSpent > 0.3) {
      const pct = Math.round((foodCat.total / totalSpent) * 100);
      suggestions.push({
        type: 'warning',
        category: 'Food',
        title: 'High Food & Snack Spending',
        message: `You spent ${pct}% of this month's money on Food. You could review restaurant, cafe, and food delivery purchases.`
      });
    }

    // 2. Entertainment Check
    const entCat = analysis.categoryBreakdown.find(
      (c) => c.name.toLowerCase() === 'entertainment' || c.name.toLowerCase() === 'gaming'
    );
    if (entCat && totalSpent > 0 && entCat.total / totalSpent > 0.25) {
      const pct = Math.round((entCat.total / totalSpent) * 100);
      suggestions.push({
        type: 'warning',
        category: 'Entertainment',
        title: 'Entertainment & Gaming Alert',
        message: `Entertainment spending is taking ${pct}% of your budget. Consider setting a category limit for next month.`
      });
    }

    // 3. Unnecessary vs Necessary Check
    if (analysis.unnecessaryPercentage > 35) {
      suggestions.push({
        type: 'warning',
        category: 'Wants',
        title: 'High Unnecessary Spending',
        message: `You marked ${analysis.unnecessaryPercentage}% of your spending as unnecessary (₹${Math.round(
          analysis.unnecessarySpent
        )}). Review these purchases before making similar impulse buys next month.`
      });
    } else if (analysis.necessaryPercentage >= 75) {
      suggestions.push({
        type: 'success',
        category: 'Needs',
        title: 'Disciplined Spending',
        message: `Great job! ${analysis.necessaryPercentage}% of your spending went toward essential needs.`
      });
    }

    // 4. Week-over-week spending trend check
    try {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - 7);
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - 14);

      const [thisWeekExpenses, lastWeekExpenses] = await Promise.all([
        expenseModel.findAll(userId, {
          startDate: thisWeekStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }),
        expenseModel.findAll(userId, {
          startDate: lastWeekStart.toISOString().split('T')[0],
          endDate: thisWeekStart.toISOString().split('T')[0]
        })
      ]);

      const thisWeekTotal = thisWeekExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      const lastWeekTotal = lastWeekExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

      if (lastWeekTotal > 0 && thisWeekTotal > lastWeekTotal * 1.2) {
        const increasePct = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
        suggestions.push({
          type: 'warning',
          category: 'Trend',
          title: 'Weekly Spending Increased',
          message: `Your spending increased by ${increasePct}% compared with the previous week. Check your recent expenses to see what caused the bump.`
        });
      }
    } catch (e) {
      // Non-critical, continue
    }

    // 5. Budget Adherence Check
    const overallBudget = budgetData.overallBudget;
    if (overallBudget.budgetAmount > 0) {
      if (overallBudget.percentUsed > 100) {
        suggestions.push({
          type: 'danger',
          category: 'Budget',
          title: 'Over Monthly Budget',
          message: `You have spent ₹${Math.round(totalSpent)} which is above your ₹${Math.round(
            overallBudget.budgetAmount
          )} budget. Limit non-essential purchases for the rest of the month.`
        });
      } else if (overallBudget.percentUsed >= 85) {
        suggestions.push({
          type: 'warning',
          category: 'Budget',
          title: 'Approaching Budget Limit',
          message: `You have used ${overallBudget.percentUsed}% of your budget with ₹${Math.round(
            overallBudget.remainingAmount
          )} remaining.`
        });
      } else {
        suggestions.push({
          type: 'success',
          category: 'Budget',
          title: 'On Track with Budget',
          message: `You are currently below your monthly budget (${overallBudget.percentUsed}% used). Continue monitoring your spending!`
        });
      }
    } else {
      suggestions.push({
        type: 'info',
        category: 'Budget',
        title: 'Set a Monthly Target',
        message: 'Setting a monthly spending budget helps you keep track of your pocket money and savings.'
      });
    }

    // Calculate a transparent, gamified financial awareness score (0 - 100)
    let score = 70; // baseline

    // Budget points
    if (overallBudget.budgetAmount > 0) {
      if (overallBudget.percentUsed <= 80) score += 15;
      else if (overallBudget.percentUsed <= 100) score += 5;
      else score -= 20;
    }

    // Necessary spending points
    if (analysis.necessaryPercentage >= 70) score += 15;
    else if (analysis.necessaryPercentage < 40) score -= 15;

    // Normalize between 10 and 100
    const healthScore = Math.max(10, Math.min(100, Math.round(score)));

    let badge = 'Smart Spender 🌟';
    if (healthScore >= 85) badge = 'Money Ninja 🥷';
    else if (healthScore >= 70) badge = 'Smart Saver 🌟';
    else if (healthScore >= 50) badge = 'Budget Apprentice 🎯';
    else badge = 'Spender in Training 🌱';

    return {
      healthScore,
      badge,
      summary: `Your spending awareness score is ${healthScore}/100 based on your current month habits.`,
      suggestions
    };
  }
};

module.exports = suggestionService;
