// Supabase Edge Function: webauthn-options
// Returns options for registration or authentication and stores challenge
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function base64url(input: Uint8Array | string) {
  let str: string;
  if (typeof input === "string") {
    str = btoa(input);
  } else {
    str = btoa(String.fromCharCode(...input));
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateChallenge(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

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

    const {
      type,
      userId,
      rpID,
      rpName,
      userVerification,
      authenticatorAttachment,
      timeout,
    } = await req.json();
    if (type !== "registration" && type !== "authentication") {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const challenge = generateChallenge(32);
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabase
      .from("webauthn_challenges")
      .insert({
        user_id: userId ?? null,
        challenge,
        type,
        expires_at: expires,
      });

    if (type === "registration") {
      const options = {
        rp: { id: rpID, name: rpName },
        challenge,
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        timeout,
        authenticatorSelection: {
          userVerification,
          authenticatorAttachment,
        },
        attestation: "none",
      };
      return new Response(JSON.stringify({ options }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      let allowCredentials: Array<{
        type: string;
        id: string;
        transports?: string[];
      }> = [];
      if (userId) {
        const { data: creds } = await supabase
          .from("webauthn_credentials")
          .select("credential_id, transports")
          .eq("user_id", userId);
        allowCredentials = (creds || []).map((c: any) => ({
          type: "public-key",
          id: c.credential_id,
          transports: c.transports || undefined,
        }));
      }
      const options = {
        challenge,
        timeout,
        rpId: rpID,
        userVerification,
        allowCredentials,
      };
      return new Response(JSON.stringify({ options }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

