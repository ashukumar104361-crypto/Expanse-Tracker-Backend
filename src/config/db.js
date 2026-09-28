const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

const isSupabaseConfigured =
  config.supabaseUrl &&
  !config.supabaseUrl.includes('your-project') &&
  (config.supabaseServiceRoleKey || config.supabaseAnonKey) &&
  !config.supabaseAnonKey.includes('your_supabase');

let supabase = null;

if (isSupabaseConfigured && config.useMockDb !== 'true') {
  try {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    supabase = createClient(config.supabaseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    console.log('✅ [Database] Supabase client initialized successfully.');
  } catch (err) {
    console.error('⚠️ [Database] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ [Database] Running in Local Development Storage mode.');
  console.log('   (To connect to live Supabase, update SUPABASE_URL and keys in backend/.env)');
}

module.exports = {
  supabase,
  isLiveSupabase: !!supabase
};
