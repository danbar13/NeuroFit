// Follow Deno and Supabase Edge Function conventions
// Deploy command: supabase functions deploy exercise-dda

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// DDA Configuration Thresholds (Senior-friendly bias towards success)
const DDA_CONFIG = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 10,
  PROMOTE_ACCURACY_THRESHOLD: 0.85, // 85% accuracy needed to level up
  PROMOTE_TIME_THRESHOLD_MS: 3000,  // Under 3 seconds avg response
  DEMOTE_ACCURACY_THRESHOLD: 0.60,  // Drop below 60% causes level down
  DEMOTE_TIME_THRESHOLD_MS: 6000,   // Over 6 seconds avg response causes level down
};

interface DDAExercisePayload {
  userId: string;
  category: 'memory' | 'attention' | 'speed' | 'language';
  accuracy: number; // 0.0 - 1.0 or 0 - 100
  avgResponseTimeMs: number;
  sessionId?: string;
}

/**
 * Calculates next level adhering strictly to senior ergonomics:
 * - Bias towards success: easy to step down to avoid frustration
 * - Demotion triggered if accuracy is low OR if user took too long
 * - Promotion requires BOTH high accuracy and reasonable speed
 */
function calculateNextLevel(
  currentLevel: number,
  accuracy: number,
  avgResponseTimeMs: number
): number {
  // Normalize accuracy to 0.0 - 1.0
  const normAccuracy = accuracy > 1 ? accuracy / 100 : accuracy;
  let nextLevel = currentLevel;

  // Rule 1: Check for Promotion (Level Up)
  if (
    normAccuracy >= DDA_CONFIG.PROMOTE_ACCURACY_THRESHOLD &&
    avgResponseTimeMs <= DDA_CONFIG.PROMOTE_TIME_THRESHOLD_MS
  ) {
    nextLevel += 1;
  }
  // Rule 2: Check for Demotion (Level Down)
  else if (
    normAccuracy <= DDA_CONFIG.DEMOTE_ACCURACY_THRESHOLD ||
    avgResponseTimeMs >= DDA_CONFIG.DEMOTE_TIME_THRESHOLD_MS
  ) {
    nextLevel -= 1;
  }

  // Rule 3: Enforce Boundaries (Min 1, Max 10)
  if (nextLevel < DDA_CONFIG.MIN_LEVEL) return DDA_CONFIG.MIN_LEVEL;
  if (nextLevel > DDA_CONFIG.MAX_LEVEL) return DDA_CONFIG.MAX_LEVEL;

  // Rule 4: Flow State
  return nextLevel;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: DDAExercisePayload = await req.json();
    const { userId, category, accuracy, avgResponseTimeMs, sessionId } = body;

    if (!userId || !category || accuracy === undefined || avgResponseTimeMs === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: userId, category, accuracy, avgResponseTimeMs' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Fetch user's current cognitive profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('cognitive_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User cognitive profile not found', details: profileError }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const categoryColumn = `${category}_level`;
    const currentCategoryLevel = profile[categoryColumn] ?? 1;

    // 2. Calculate new level via DDA logic
    const newLevel = calculateNextLevel(currentCategoryLevel, accuracy, avgResponseTimeMs);

    // 3. Log exercise result in exercise_logs
    const { error: logError } = await supabaseClient.from('exercise_logs').insert({
      user_id: userId,
      session_id: sessionId || null,
      category,
      level_played: currentCategoryLevel,
      accuracy_score: accuracy > 1 ? accuracy : Math.round(accuracy * 100),
      avg_response_time_ms: Math.round(avgResponseTimeMs),
    });

    if (logError) {
      console.error('Error logging exercise metrics:', logError);
    }

    // 4. If level changed, update the DB
    let levelUpdated = false;
    if (newLevel !== currentCategoryLevel) {
      const { error: updateError } = await supabaseClient
        .from('cognitive_profiles')
        .update({
          [categoryColumn]: newLevel,
          last_assessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
      levelUpdated = true;
    }

    return new Response(
      JSON.stringify({
        success: true,
        category,
        previousLevel: currentCategoryLevel,
        newLevel,
        levelUpdated,
        flowStatePreserved: newLevel === currentCategoryLevel,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
