// Supabase Edge Function: custom-auth-login
// - Public endpoint (CORS enabled)
// - Authenticates a user from public.accounts using bcrypt
// - Issues a signed JWT using CUSTOM_JWT_SECRET

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

async function signJWT(payload: Record<string, unknown>, secret: string, expiresInSec: number) {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSec;
  const fullPayload = { ...payload, iat, exp, iss: "custom-auth" };

  const enc = new TextEncoder();
  const headerPart = base64url(enc.encode(JSON.stringify(header)));
  const payloadPart = base64url(enc.encode(JSON.stringify(fullPayload)));
  const data = `${headerPart}.${payloadPart}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(data))
  );
  const sigPart = base64url(signature);
  return `${data}.${sigPart}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://nfwthtzncrnyvwqsqncw.supabase.co";
  const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
  const CUSTOM_JWT_SECRET = Deno.env.get("CUSTOM_JWT_SECRET");

  if (!SERVICE_ROLE_KEY || !CUSTOM_JWT_SECRET) {
    console.error("Missing SERVICE_ROLE_KEY or CUSTOM_JWT_SECRET");
    return new Response(
      JSON.stringify({ error: "Server not configured. Missing secrets." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: account, error: findErr } = await supabase
      .from("accounts")
      .select("id, email, password_hash, display_name")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      console.error("Lookup error", findErr);
      return new Response(
        JSON.stringify({ error: "Failed to find user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!account) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ok = bcrypt.compareSync(password, account.password_hash as string);
    if (!ok) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update last_sign_in_at (best-effort)
    await supabase
      .from("accounts")
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq("id", account.id);

    const token = await signJWT({ sub: account.id, email: account.email }, CUSTOM_JWT_SECRET, 60 * 60 * 24 * 7);

    return new Response(
      JSON.stringify({
        token,
        user: { id: account.id, email: account.email, display_name: account.display_name },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("Unhandled error", e);
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
