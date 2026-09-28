const { supabase, isLiveSupabase } = require('../config/db');
const { users } = require('./localStore');
const crypto = require('crypto');

const userModel = {
  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
      }
      return data || null;
    }

    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    return user || null;
  },

  async findById(id) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, age, monthly_income, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      return data || null;
    }

    const user = users.find((u) => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, password_hash, age, monthly_income }) {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: name.trim(),
            email: normalizedEmail,
            password_hash,
            age: age ? parseInt(age, 10) : null,
            monthly_income: monthly_income ? parseFloat(monthly_income) : 0,
            created_at: now,
            updated_at: now
          }
        ])
        .select('id, name, email, age, monthly_income, created_at')
        .single();

      if (error) {
        throw new Error(`Database error creating user: ${error.message}`);
      }
      return data;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      age: age ? parseInt(age, 10) : null,
      monthly_income: monthly_income ? parseFloat(monthly_income) : 0,
      created_at: now,
      updated_at: now
    };

    users.push(newUser);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  async update(id, { name, age, monthly_income }) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      const updates = { updated_at: now };
      if (name !== undefined) updates.name = name.trim();
      if (age !== undefined) updates.age = parseInt(age, 10);
      if (monthly_income !== undefined) updates.monthly_income = parseFloat(monthly_income);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select('id, name, email, age, monthly_income, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Database error updating user: ${error.message}`);
      }
      return data;
    }

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    if (name !== undefined) users[userIndex].name = name.trim();
    if (age !== undefined) users[userIndex].age = parseInt(age, 10);
    if (monthly_income !== undefined) users[userIndex].monthly_income = parseFloat(monthly_income);
    users[userIndex].updated_at = now;

    const { password_hash, ...safeUser } = users[userIndex];
    return safeUser;
  },

  async updatePassword(id, password_hash) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      const { error } = await supabase
        .from('users')
        .update({ password_hash, updated_at: now })
        .eq('id', id);

      if (error) {
        throw new Error(`Database error updating password: ${error.message}`);
      }
      return true;
    }

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return false;
    users[userIndex].password_hash = password_hash;
    users[userIndex].updated_at = now;
    return true;
  }
};

module.exports = userModel;
