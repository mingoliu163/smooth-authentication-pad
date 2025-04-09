
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

    // Fetch profiles first to get all user data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      throw profilesError;
    }

    // For each profile, get the corresponding user data from auth.users
    const enhancedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Query auth.users for this profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, raw_user_meta_data')
          .eq('id', profile.id)
          .single();
        
        if (userError) {
          console.error(`Error fetching user ${profile.id}:`, userError);
          return {
            ...profile,
            email: 'unknown@example.com',
            display_name: profile.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
              : 'Unknown User'
          };
        }
        
        // Get display name from raw_user_meta_data
        const display_name = userData.raw_user_meta_data?.name || 
          userData.raw_user_meta_data?.full_name ||
          userData.raw_user_meta_data?.display_name;
        
        return {
          ...profile,
          email: userData.email,
          display_name: display_name || 
            (profile.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
              : 'User')
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
