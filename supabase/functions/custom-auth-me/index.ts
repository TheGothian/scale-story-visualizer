// Supabase Edge Function: custom-auth-me
// - Public endpoint (CORS enabled)
// - Verifies JWT from Authorization header and returns the corresponding account

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64urlDecode(input: string) {
  const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const str = atob(base64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function verifyJWT(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [headerB64, payloadB64, sigB64] = parts;
  const enc = new TextEncoder();
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signature = base64urlDecode(sigB64);
  const ok = await crypto.subtle.verify("HMAC", key, signature, enc.encode(data));
  if (!ok) throw new Error("Signature verification failed");

  const payloadBytes = base64urlDecode(payloadB64);
  const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) throw new Error("Token expired");
  return payload;
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

  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing bearer token" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const token = auth.split(" ")[1];

  try {
    const payload = await verifyJWT(token, CUSTOM_JWT_SECRET);
    const userId = payload.sub as string;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: account, error } = await supabase
      .from("accounts")
      .select("id, email, display_name, created_at, last_sign_in_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Lookup error", error);
      return new Response(
        JSON.stringify({ error: "Failed to load user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!account) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ user: account }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("JWT error", e);
    return new Response(
      JSON.stringify({ error: "Invalid token" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
