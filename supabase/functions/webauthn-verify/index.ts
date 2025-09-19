// Supabase Edge Function: webauthn-verify
// Verifies registration/authentication response against stored challenge.
// Note: For production, use a proper WebAuthn verification library.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { type, userId, response, expectedRpID } = await req.json();
    if (type !== "registration" && type !== "authentication") {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the last unconsumed challenge for this type (and user if provided)
    let query = supabase
      .from("webauthn_challenges")
      .select("id, challenge, expires_at")
      .eq("type", type)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1);
    if (userId) query = query.eq("user_id", userId);
    const { data: rows } = (await query) as any;
    const challengeRow = rows?.[0];
    if (!challengeRow) {
      return new Response(JSON.stringify({ error: "No challenge found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(challengeRow.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Challenge expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Minimal check: ensure clientDataJSON.challenge matches
    const clientDataJSON = JSON.parse(
      atob(response?.response?.clientDataJSON ?? "")
    );
    const rawChallenge = clientDataJSON?.challenge;
    if (!rawChallenge) {
      return new Response(
        JSON.stringify({ error: "Missing client challenge" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    // clientData challenge is base64url; compare directly
    if (rawChallenge !== challengeRow.challenge) {
      return new Response(JSON.stringify({ error: "Challenge mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "registration") {
      // Store credential minimally: id and transports; publicKey extraction omitted here
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Missing userId for registration" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const credentialId = response?.id;
      const transports =
        response?.transports ?? response?.response?.transports ?? null;
      if (!credentialId) {
        return new Response(
          JSON.stringify({ error: "Missing credential id" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      await supabase
        .from("webauthn_credentials")
        .upsert(
          {
            user_id: userId,
            credential_id: credentialId,
            public_key: "placeholder",
            transports,
          },
          { onConflict: "user_id,credential_id" }
        );
    } else {
      // On authentication, increment counter best-effort (placeholder)
      if (userId) {
        await supabase.rpc("noop");
      }
    }

    // consume challenge
    await supabase
      .from("webauthn_challenges")
      .update({ consumed: true })
      .eq("id", challengeRow.id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
