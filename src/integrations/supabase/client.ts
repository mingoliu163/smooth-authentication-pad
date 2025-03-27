
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://smrgpmrjwosoyzxvibwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcmdwbXJqd29zb3l6eHZpYndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5ODI4OTYsImV4cCI6MjA1ODU1ODg5Nn0._Y_FipvyVIIfyvDN8jYUaoqRtKI09B1Mq9McTeU8KCs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});
