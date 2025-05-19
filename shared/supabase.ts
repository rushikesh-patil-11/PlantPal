import { createClient } from '@supabase/supabase-js';

// Supabase connection URL and anon key should be set in environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseKey);