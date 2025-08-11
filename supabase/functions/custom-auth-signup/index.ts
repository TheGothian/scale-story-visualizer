
// Supabase Edge Function: custom-auth-signup
// - Public endpoint (CORS enabled)
// - Creates a new account in public.accounts with bcrypt password hashing
// - Issues a signed JWT using CUSTOM_JWT_SECRET
//
// Logging is added for easier debugging in Supabase dashboard

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

// CORS headers for browser calls
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
  // Handle CORS preflight
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
    const body = await req.json().catch((e) => {
      console.error("signup: invalid JSON", e);
      throw new Error("bad_json");
    });
    const { email, password, display_name } = body || {};
    console.log("signup: parsed body", { hasEmail: !!email });

    if (!email || !password) {
      console.warn("signup: missing fields", { email: !!email, password: !!password });
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("signup: checking existing", { email });

    // Check if email already exists
    const { data: existing, error: findErr } = await supabase
      .from("accounts")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      console.error("Lookup error", findErr);
      return new Response(
        JSON.stringify({ error: "Failed to check existing user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("signup: hashing password");
    const password_hash = bcrypt.hashSync(password, 10);
    console.log("signup: inserting account");

    const { data: inserted, error: insertErr } = await supabase
      .from("accounts")
      .insert({ email, password_hash, display_name: display_name ?? null, is_verified: true })
      .select("id, email, display_name, created_at")
      .single();

    if (insertErr || !inserted) {
      console.error("Insert error", insertErr);
      return new Response(
        JSON.stringify({ error: "Failed to create account" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Issue JWT (7 days)
    console.log("signup: issuing jwt", { userId: inserted.id });
    const token = await signJWT({ sub: inserted.id, email: inserted.email }, CUSTOM_JWT_SECRET, 60 * 60 * 24 * 7);

    return new Response(
      JSON.stringify({
        token,
        user: { id: inserted.id, email: inserted.email, display_name: inserted.display_name },
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
