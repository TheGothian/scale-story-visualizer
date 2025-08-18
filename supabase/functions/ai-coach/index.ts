import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('AI Coach function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasOpenAIKey: !!openAIApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!supabaseServiceRoleKey
    });

    if (!openAIApiKey) {
      console.error('Missing OPENAI_API_KEY environment variable');
      throw new Error('OpenAI API key not configured');
    }

    // Get user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header found');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Processing request with token length:', token.length);
    
    // Create Supabase client for data operations
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Verify the custom JWT token
    const jwtSecret = Deno.env.get('CUSTOM_JWT_SECRET');
    if (!jwtSecret) {
      console.error('Missing CUSTOM_JWT_SECRET environment variable');
      throw new Error('JWT secret not configured');
    }
    
    try {
      // Verify JWT token manually
      const [header, payload, signature] = token.split('.');
      
      // Decode the payload
      const base64Url = payload;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      console.log('Decoded token payload:', { sub: decoded.sub, email: decoded.email });
      
      // Verify token signature using crypto
      const encoder = new TextEncoder();
      const keyData = encoder.encode(jwtSecret);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
      
      const dataToVerify = encoder.encode(`${header}.${payload}`);
      const signatureBuffer = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      
      const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBuffer, dataToVerify);
      
      if (!isValid) {
        throw new Error('Invalid token signature');
      }
      
      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token has expired');
      }
      
      if (!decoded.sub) {
        throw new Error('Invalid token: missing user ID');
      }
      
      const userId = decoded.sub;
      console.log(`AI Coach request for user: ${userId}`);

      // Fetch user's recent weight entries (last 30 days)
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('weight, date, unit')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(30);

    if (weightError) {
      console.error('Weight fetch error:', weightError);
      throw new Error('Failed to fetch weight data');
    }

      // Fetch user's recent body composition data (last 30 days)
      const { data: bodyCompositions, error: bodyError } = await supabase
        .from('body_compositions')
        .select('body_fat_percentage, muscle_mass, water_percentage, metabolic_age, measurements, date')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(10);

    if (bodyError) {
      console.error('Body composition fetch error:', bodyError);
      throw new Error('Failed to fetch body composition data');
    }

      // Fetch user's active goals
      const { data: goals, error: goalsError } = await supabase
        .from('bodybuilding_goals')
        .select('phase, target_weight, target_body_fat, weekly_weight_target, caloric_target, protein_target, target_date')
        .eq('user_id', userId)
        .eq('is_active', true);

    if (goalsError) {
      console.error('Goals fetch error:', goalsError);
    }

    // Prepare data summary for AI analysis
    const latestWeight = weightEntries?.[0];
    const latestBodyComp = bodyCompositions?.[0];
    const weightTrend = weightEntries?.slice(0, 7); // Last 7 entries for trend
    
    const dataContext = {
      currentWeight: latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : 'No recent data',
      weightTrend: weightTrend?.map(w => ({ weight: w.weight, date: w.date, unit: w.unit })) || [],
      bodyFat: latestBodyComp?.body_fat_percentage || null,
      muscleMass: latestBodyComp?.muscle_mass || null,
      waterPercentage: latestBodyComp?.water_percentage || null,
      metabolicAge: latestBodyComp?.metabolic_age || null,
      measurements: latestBodyComp?.measurements || null,
      activeGoals: goals || [],
      dataAvailable: {
        hasWeightData: weightEntries && weightEntries.length > 0,
        hasBodyCompData: bodyCompositions && bodyCompositions.length > 0,
        hasGoals: goals && goals.length > 0
      }
    };

    console.log('Data context prepared:', dataContext);

    // Create AI prompt based on available data
    const systemPrompt = `You are a professional fitness and nutrition coach. Analyze the user's body composition and weight data to provide personalized advice.

Your analysis should be:
1. Evidence-based and practical
2. Focused on sustainable changes
3. Specific about calorie and macro recommendations
4. Considerate of their goals and current progress

Provide advice in these areas:
- Current progress assessment
- Caloric intake recommendations (with specific daily targets)
- Macronutrient distribution (protein, carbs, fats)
- Practical diet suggestions
- Hydration and lifestyle tips

Keep your response concise but actionable, around 300-400 words.`;

    const userPrompt = `Here is my fitness data for analysis:

Current Status:
- Latest weight: ${dataContext.currentWeight}
- Body fat percentage: ${dataContext.bodyFat ? dataContext.bodyFat + '%' : 'Not measured'}
- Muscle mass: ${dataContext.muscleMass ? dataContext.muscleMass + ' kg' : 'Not measured'}
- Water percentage: ${dataContext.waterPercentage ? dataContext.waterPercentage + '%' : 'Not measured'}
- Metabolic age: ${dataContext.metabolicAge || 'Not measured'}

Recent Weight Trend (last 7 entries):
${dataContext.weightTrend.length > 0 ? 
  dataContext.weightTrend.map(w => `${w.date}: ${w.weight} ${w.unit}`).join('\n') : 
  'No recent weight data available'}

Active Goals:
${dataContext.activeGoals.length > 0 ? 
  dataContext.activeGoals.map(g => 
    `Phase: ${g.phase}, Target Weight: ${g.target_weight || 'Not set'}, Target Body Fat: ${g.target_body_fat || 'Not set'}%, Weekly Target: ${g.weekly_weight_target || 'Not set'} per week, Caloric Target: ${g.caloric_target || 'Not set'} calories, Protein Target: ${g.protein_target || 'Not set'}g`
  ).join('\n') : 
  'No active goals set'}

Please provide personalized coaching advice based on this data.`;

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    console.log('AI response received, processing...');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', aiData);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const coachingAdvice = aiData.choices[0].message.content;

    console.log('AI coaching advice generated successfully');

    return new Response(JSON.stringify({ 
      advice: coachingAdvice,
      dataUsed: dataContext.dataAvailable 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      throw new Error('Invalid authentication token');
    }

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    
    // Provide a detailed error response
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const statusCode = errorMessage.includes('OpenAI API error') ? 503 : 
                      errorMessage.includes('authentication') ? 401 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      advice: 'Unable to generate coaching advice at this time. Please try again later.',
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});