const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback_dev_secret_teen_tracker_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  useMockDb: process.env.USE_MOCK_DB || 'auto'
};

module.exports = config;
