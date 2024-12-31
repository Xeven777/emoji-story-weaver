import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the actual project URL and anon key
const supabaseUrl = 'https://kjgcicolorghveupiuby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZ2NpY29sb3JnaHZldXBpdWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4MjM5MTcsImV4cCI6MjAyMzM5OTkxN30.GYYQBwUm3Lkt6uZMGBwdRgXfL3Kc3dXgMHVGJCGH0Hs';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);