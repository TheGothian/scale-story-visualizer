// Supabase Edge Function: authelia-token-exchange
// - Accepts an Authelia OIDC id_token (RS256)
// - Verifies signature using Authelia JWKS
// - Upserts user in public.accounts
// - Issues HS256 JWT using CUSTOM_JWT_SECRET compatible with custom-auth-* functions

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function base64urlDecode(input: string): Uint8Array {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  const raw = atob(input);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function base64url(input: Uint8Array | string): string {
  let str: string;
  if (typeof input === "string") {
    str = btoa(input);
  } else {
    str = btoa(String.fromCharCode(...input));
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signHS256JWT(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSec: number
) {
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
    ["sign"]
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(data))
  );
  const sigPart = base64url(signature);
  return `${data}.${sigPart}`;
}

async function getOidcDiscovery(issuer: string) {
  const res = await fetch(
    `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`
  );
  if (!res.ok) throw new Error(`Discovery fetch failed: ${res.status}`);
  return await res.json();
}

async function fetchJwks(jwksUri: string) {
  const res = await fetch(jwksUri);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  return await res.json();
}

async function importRsaPublicKeyFromJwk(jwk: JsonWebKey) {
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

async function verifyRS256(
  idToken: string,
  jwks: any
): Promise<Record<string, any>> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(
    new TextDecoder().decode(base64urlDecode(headerB64))
  );
  const payload = JSON.parse(
    new TextDecoder().decode(base64urlDecode(payloadB64))
  );
  const signature = base64urlDecode(signatureB64);

  if (header.alg !== "RS256") throw new Error(`Unsupported alg: ${header.alg}`);
  const kid = header.kid as string | undefined;
  const key = (jwks.keys as any[] | undefined)?.find(
    (k) => !kid || k.kid === kid
  );
  if (!key) throw new Error("Matching JWKS key not found");
  const publicKey = await importRsaPublicKeyFromJwk(key);

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    data
  );
  if (!ok) throw new Error("Signature invalid");

  // Exp check
  if (
    typeof payload.exp === "number" &&
    payload.exp < Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Token expired");
  }
  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL =
      Deno.env.get("SUPABASE_URL") ??
      "https://nfwthtzncrnyvwqsqncw.supabase.co";
    const SERVICE_ROLE_KEY =
      Deno.env.get("SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const CUSTOM_JWT_SECRET = Deno.env.get("CUSTOM_JWT_SECRET");
    const OIDC_ISSUER =
      Deno.env.get("OIDC_ISSUER") ?? "https://auth.dreamstate.nu";

    if (!SERVICE_ROLE_KEY || !CUSTOM_JWT_SECRET) {
      return new Response(JSON.stringify({ error: "Missing server secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const id_token = body?.id_token as string | undefined;
    if (!id_token) {
      return new Response(JSON.stringify({ error: "id_token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Discover and verify id_token
    const discovery = await getOidcDiscovery(OIDC_ISSUER);
    const jwks = await fetchJwks(discovery.jwks_uri);
    const payload = await verifyRS256(id_token, jwks);

    const subject = payload.sub as string | undefined;
    if (!subject) throw new Error("Token missing sub");
    const email =
      (payload.email as string | undefined) ?? `${subject}@authelia.local`;
    const displayName = (payload.name as string | undefined) ?? null;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Upsert account keyed by subject from Authelia
    const { data: existing, error: findErr } = await supabase
      .from("accounts")
      .select("id, email, display_name")
      .eq("id", subject)
      .maybeSingle();

    if (findErr) throw findErr;

    let account = existing;
    if (!account) {
      const { data: inserted, error: insertErr } = await supabase
        .from("accounts")
        .insert({
          id: subject,
          email,
          password_hash: "oidc-user-no-password", // Dummy hash for OIDC users
          display_name: displayName,
          is_verified: true,
        })
        .select("id, email, display_name")
        .single();
      if (insertErr) throw insertErr;
      account = inserted;
    } else {
      // Best-effort update email/display_name if provided
      const updates: Record<string, unknown> = {};
      if (email && email !== account.email) updates.email = email;
      if (displayName && displayName !== account.display_name)
        updates.display_name = displayName;
      if (Object.keys(updates).length) {
        await supabase.from("accounts").update(updates).eq("id", existing.id);
        account = { ...account, ...updates } as typeof account;
      }
    }

    // Mint custom JWT for our app (7 days)
    const appToken = await signHS256JWT(
      { sub: subject, email },
      CUSTOM_JWT_SECRET,
      60 * 60 * 24 * 7
    );

    return new Response(JSON.stringify({ token: appToken, user: account }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("authelia-token-exchange error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
