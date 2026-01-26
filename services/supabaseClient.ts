import { createClient } from '@supabase/supabase-js';

// NOTE: These should ideally be stored in environment variables (.env.local)
const supabaseUrl = 'https://nepzrmlzexivxibjnpdu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcHpybWx6ZXhpdnhpYmpucGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTA1NDcsImV4cCI6MjA4NDkyNjU0N30.5QH_jQiRsTg_bC3W-m5PjitbkIhRDkdb_BG_i93svZU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
