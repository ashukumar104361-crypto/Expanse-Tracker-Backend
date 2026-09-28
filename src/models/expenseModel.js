const { supabase, isLiveSupabase } = require('../config/db');
const { expenses } = require('./localStore');
const categoryModel = require('./categoryModel');
const crypto = require('crypto');

const expenseModel = {
  async create({
    user_id,
    category_id,
    amount,
    title,
    description,
    expense_date,
    payment_method,
    is_necessary
  }) {
    const now = new Date().toISOString();
    const formattedDate = expense_date || now.split('T')[0];

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id,
            category_id: category_id ? parseInt(category_id, 10) : null,
            amount: parseFloat(amount),
            title: title.trim(),
            description: description ? description.trim() : null,
            expense_date: formattedDate,
            payment_method: payment_method || 'Cash',
            is_necessary: is_necessary !== undefined ? Boolean(is_necessary) : true,
            created_at: now,
            updated_at: now
          }
        ])
        .select('*, categories(id, name, icon)')
        .single();

      if (error) {
        throw new Error(`Database error creating expense: ${error.message}`);
      }
      return data;
    }

    const newExpense = {
      id: crypto.randomUUID(),
      user_id,
      category_id: category_id ? parseInt(category_id, 10) : null,
      amount: parseFloat(amount),
      title: title.trim(),
      description: description ? description.trim() : null,
      expense_date: formattedDate,
      payment_method: payment_method || 'Cash',
      is_necessary: is_necessary !== undefined ? Boolean(is_necessary) : true,
      created_at: now,
      updated_at: now
    };

    expenses.push(newExpense);
    const category = await categoryModel.findById(newExpense.category_id);
    return { ...newExpense, categories: category };
  },

  async findById(id, user_id) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, categories(id, name, icon)')
        .eq('id', id)
        .eq('user_id', user_id)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error finding expense: ${error.message}`);
      }
      return data || null;
    }

    const exp = expenses.find((e) => e.id === id && e.user_id === user_id);
    if (!exp) return null;
    const category = await categoryModel.findById(exp.category_id);
    return { ...exp, categories: category };
  },

  async findAll(user_id, filters = {}) {
    const {
      search,
      category_id,
      payment_method,
      is_necessary,
      startDate,
      endDate,
      sortBy = 'newest'
    } = filters;

    if (isLiveSupabase) {
      let query = supabase
        .from('expenses')
        .select('*, categories(id, name, icon)')
        .eq('user_id', user_id);

      if (category_id) {
        query = query.eq('category_id', parseInt(category_id, 10));
      }
      if (payment_method) {
        query = query.eq('payment_method', payment_method);
      }
      if (is_necessary !== undefined && is_necessary !== '') {
        query = query.eq('is_necessary', is_necessary === 'true' || is_necessary === true);
      }
      if (startDate) {
        query = query.gte('expense_date', startDate);
      }
      if (endDate) {
        query = query.lte('expense_date', endDate);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      // Sorting
      if (sortBy === 'oldest') {
        query = query.order('expense_date', { ascending: true });
      } else if (sortBy === 'highest') {
        query = query.order('amount', { ascending: false });
      } else if (sortBy === 'lowest') {
        query = query.order('amount', { ascending: true });
      } else {
        // Default newest
        query = query.order('expense_date', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error listing expenses: ${error.message}`);
      }
      return data || [];
    }

    // Local in-memory filtering
    let userExpenses = expenses.filter((e) => e.user_id === user_id);

    if (category_id) {
      userExpenses = userExpenses.filter((e) => Number(e.category_id) === Number(category_id));
    }
    if (payment_method) {
      userExpenses = userExpenses.filter((e) => e.payment_method === payment_method);
    }
    if (is_necessary !== undefined && is_necessary !== '') {
      const boolVal = is_necessary === 'true' || is_necessary === true;
      userExpenses = userExpenses.filter((e) => e.is_necessary === boolVal);
    }
    if (startDate) {
      userExpenses = userExpenses.filter((e) => e.expense_date >= startDate);
    }
    if (endDate) {
      userExpenses = userExpenses.filter((e) => e.expense_date <= endDate);
    }
    if (search) {
      const q = search.toLowerCase();
      userExpenses = userExpenses.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    userExpenses.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.expense_date) - new Date(b.expense_date);
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return new Date(b.expense_date) - new Date(a.expense_date) || new Date(b.created_at) - new Date(a.created_at);
    });

    // Attach categories
    const categories = await categoryModel.findAll();
    return userExpenses.map((exp) => ({
      ...exp,
      categories: categories.find((c) => Number(c.id) === Number(exp.category_id)) || null
    }));
  },

  async update(id, user_id, updates) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      const payload = { updated_at: now };
      if (updates.title !== undefined) payload.title = updates.title.trim();
      if (updates.amount !== undefined) payload.amount = parseFloat(updates.amount);
      if (updates.category_id !== undefined) payload.category_id = parseInt(updates.category_id, 10);
      if (updates.description !== undefined) payload.description = updates.description ? updates.description.trim() : null;
      if (updates.expense_date !== undefined) payload.expense_date = updates.expense_date;
      if (updates.payment_method !== undefined) payload.payment_method = updates.payment_method;
      if (updates.is_necessary !== undefined) payload.is_necessary = Boolean(updates.is_necessary);

      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user_id)
        .select('*, categories(id, name, icon)')
        .single();

      if (error) {
        throw new Error(`Database error updating expense: ${error.message}`);
      }
      return data;
    }

    const index = expenses.findIndex((e) => e.id === id && e.user_id === user_id);
    if (index === -1) return null;

    if (updates.title !== undefined) expenses[index].title = updates.title.trim();
    if (updates.amount !== undefined) expenses[index].amount = parseFloat(updates.amount);
    if (updates.category_id !== undefined) expenses[index].category_id = parseInt(updates.category_id, 10);
    if (updates.description !== undefined) expenses[index].description = updates.description ? updates.description.trim() : null;
    if (updates.expense_date !== undefined) expenses[index].expense_date = updates.expense_date;
    if (updates.payment_method !== undefined) expenses[index].payment_method = updates.payment_method;
    if (updates.is_necessary !== undefined) expenses[index].is_necessary = Boolean(updates.is_necessary);
    expenses[index].updated_at = now;

    const category = await categoryModel.findById(expenses[index].category_id);
    return { ...expenses[index], categories: category };
  },

  async delete(id, user_id) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id)
        .select('id')
        .single();

      if (error) {
        throw new Error(`Database error deleting expense: ${error.message}`);
      }
      return !!data;
    }

    const index = expenses.findIndex((e) => e.id === id && e.user_id === user_id);
    if (index === -1) return false;
    expenses.splice(index, 1);
    return true;
  }
};

module.exports = expenseModel;
