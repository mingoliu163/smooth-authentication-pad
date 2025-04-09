
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all profiles first
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      throw profilesError;
    }

    // For each profile, get the auth user data to get the display name
    const enhancedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Get user data directly from auth.users using admin API
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (userError || !userData.user) {
          console.error(`Error fetching auth user ${profile.id}:`, userError);
          return {
            ...profile,
            email: 'unknown@example.com',
            display_name: profile.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
              : 'Unknown User'
          };
        }
        
        // Explicitly prioritize getting display name from user metadata
        const user = userData.user;
        const display_name = 
          user.user_metadata?.display_name || 
          user.user_metadata?.name || 
          user.user_metadata?.full_name;
        
        console.log(`User ${profile.id} metadata:`, user.user_metadata);
        console.log(`Display name extracted:`, display_name);
        
        return {
          ...profile,
          email: user.email || 'unknown@example.com',
          display_name: display_name || 
            (profile.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
              : 'Unknown User')
        };
      })
    );

    return new Response(JSON.stringify(enhancedProfiles), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400,
    });
  }
});
