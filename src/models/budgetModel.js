const { supabase, isLiveSupabase } = require('../config/db');
const { budgets } = require('./localStore');
const categoryModel = require('./categoryModel');
const crypto = require('crypto');

const budgetModel = {
  async upsert({ user_id, category_id, amount, month, year }) {
    const now = new Date().toISOString();
    const parsedCatId = category_id ? parseInt(category_id, 10) : null;
    const parsedAmount = parseFloat(amount);
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isLiveSupabase) {
      // Check existing
      let checkQuery = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user_id)
        .eq('month', parsedMonth)
        .eq('year', parsedYear);

      if (parsedCatId === null) {
        checkQuery = checkQuery.is('category_id', null);
      } else {
        checkQuery = checkQuery.eq('category_id', parsedCatId);
      }

      const { data: existing } = await checkQuery.maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('budgets')
          .update({
            amount: parsedAmount,
            updated_at: now
          })
          .eq('id', existing.id)
          .select('*, categories(id, name, icon)')
          .single();

        if (error) throw new Error(`Database error updating budget: ${error.message}`);
        return data;
      } else {
        const { data, error } = await supabase
          .from('budgets')
          .insert([
            {
              user_id,
              category_id: parsedCatId,
              amount: parsedAmount,
              month: parsedMonth,
              year: parsedYear,
              created_at: now,
              updated_at: now
            }
          ])
          .select('*, categories(id, name, icon)')
          .single();

        if (error) throw new Error(`Database error inserting budget: ${error.message}`);
        return data;
      }
    }

    // Local in-memory upsert
    const existingIndex = budgets.findIndex(
      (b) =>
        b.user_id === user_id &&
        b.month === parsedMonth &&
        b.year === parsedYear &&
        (parsedCatId === null ? b.category_id === null : Number(b.category_id) === parsedCatId)
    );

    if (existingIndex !== -1) {
      budgets[existingIndex].amount = parsedAmount;
      budgets[existingIndex].updated_at = now;
      const cat = parsedCatId ? await categoryModel.findById(parsedCatId) : null;
      return { ...budgets[existingIndex], categories: cat };
    }

    const newBudget = {
      id: crypto.randomUUID(),
      user_id,
      category_id: parsedCatId,
      amount: parsedAmount,
      month: parsedMonth,
      year: parsedYear,
      created_at: now,
      updated_at: now
    };

    budgets.push(newBudget);
    const cat = parsedCatId ? await categoryModel.findById(parsedCatId) : null;
    return { ...newBudget, categories: cat };
  },

  async findByMonthAndYear(user_id, month, year) {
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, categories(id, name, icon)')
        .eq('user_id', user_id)
        .eq('month', parsedMonth)
        .eq('year', parsedYear);

      if (error) throw new Error(`Database error fetching budgets: ${error.message}`);
      return data || [];
    }

    const userBudgets = budgets.filter(
      (b) => b.user_id === user_id && b.month === parsedMonth && b.year === parsedYear
    );

    const categories = await categoryModel.findAll();
    return userBudgets.map((b) => ({
      ...b,
      categories: b.category_id
        ? categories.find((c) => Number(c.id) === Number(b.category_id)) || null
        : null
    }));
  },

  async delete(id, user_id) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id)
        .select('id')
        .single();

      if (error) throw new Error(`Database error deleting budget: ${error.message}`);
      return !!data;
    }

    const index = budgets.findIndex((b) => b.id === id && b.user_id === user_id);
    if (index === -1) return false;
    budgets.splice(index, 1);
    return true;
  }
};

module.exports = budgetModel;
