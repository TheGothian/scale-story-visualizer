import { useEffect, useRef } from "react";
import { userManager } from "@/lib/oidc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const { setAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) {
      console.log("Callback already processed, skipping...");
      return;
    }
    hasProcessed.current = true;

    (async () => {
      try {
        console.log("=== OIDC CALLBACK DEBUG START ===");
        console.log("Current URL:", window.location.href);
        console.log("URL Search params:", window.location.search);
        console.log("URL Hash:", window.location.hash);

        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        console.log(
          "Authorization code:",
          urlParams.get("code")?.substring(0, 20) + "..."
        );
        console.log("State parameter:", urlParams.get("state"));
        console.log("Error parameter:", urlParams.get("error"));
        console.log("Error description:", urlParams.get("error_description"));

        // Check both sessionStorage and localStorage for OIDC state
        console.log("SessionStorage keys:", Object.keys(sessionStorage));
        console.log("LocalStorage keys:", Object.keys(localStorage));

        const sessionOidcKeys = Object.keys(sessionStorage).filter((k) =>
          k.includes("oidc")
        );
        const localOidcKeys = Object.keys(localStorage).filter((k) =>
          k.includes("oidc")
        );

        console.log("OIDC-related sessionStorage keys:", sessionOidcKeys);
        console.log("OIDC-related localStorage keys:", localOidcKeys);

        [...sessionOidcKeys, ...localOidcKeys].forEach((key) => {
          const value =
            sessionStorage.getItem(key) || localStorage.getItem(key);
          const storage = sessionStorage.getItem(key) ? "session" : "local";
          console.log(`${key} (${storage}):`, value);
          if (key.includes("state")) {
            try {
              const parsed = JSON.parse(value || "{}");
              console.log(`Parsed ${key}:`, parsed);
            } catch (e) {
              console.log(`Failed to parse ${key}:`, e);
            }
          }
        });

        // Check if the state from URL matches any stored states
        const stateParam = urlParams.get("state");
        if (stateParam) {
          const expectedStateKey = `oidc.${stateParam}`;
          console.log("Looking for state key:", expectedStateKey);
          const storedStateSession = sessionStorage.getItem(expectedStateKey);
          const storedStateLocal = localStorage.getItem(expectedStateKey);
          console.log("Found stored state in session:", !!storedStateSession);
          console.log("Found stored state in local:", !!storedStateLocal);
          const storedState = storedStateSession || storedStateLocal;
          if (storedState) {
            try {
              console.log("Stored state content:", JSON.parse(storedState));
            } catch (e) {
              console.log("Failed to parse stored state:", e);
            }
          }
        }

        console.log("About to call userManager.signinRedirectCallback()...");

        const user = await userManager.signinRedirectCallback();

        console.log("=== OIDC USER OBJECT ===");
        console.log("Full user object:", user);
        console.log("ID token present:", !!user.id_token);
        console.log("ID token length:", user.id_token?.length);
        console.log("Access token present:", !!user.access_token);
        console.log("Profile object:", user.profile);
        console.log("Expires at:", user.expires_at);
        console.log("Token type:", user.token_type);
        console.log("Scope:", user.scope);

        if (!user.id_token) {
          throw new Error("No ID token received from Authelia");
        }

        // Decode and log ID token payload
        try {
          const idTokenParts = user.id_token.split(".");
          console.log("ID token parts count:", idTokenParts.length);
          if (idTokenParts.length === 3) {
            const payload = JSON.parse(atob(idTokenParts[1]));
            console.log("ID token payload:", payload);
            console.log("Token issuer:", payload.iss);
            console.log("Token audience:", payload.aud);
            console.log("Token subject:", payload.sub);
            console.log("Token email:", payload.email);
            console.log("Token name:", payload.name);
            console.log("Token expiry:", new Date(payload.exp * 1000));
          }
        } catch (tokenError) {
          console.error("Failed to decode ID token:", tokenError);
        }

        console.log("Exchanging id_token for app token...");
        try {
          const { data, error } = await supabase.functions.invoke(
            "authelia-token-exchange",
            {
              body: { id_token: user.id_token },
            }
          );

          if (error || !data?.token || !data?.user) {
            console.error("token-exchange failed", error, data);
            throw new Error(error?.message || "Token exchange failed");
          }
          console.log("Setting auth with exchanged token...");
          setAuth(data.token as string, data.user as any);
        } catch (ex) {
          console.error("Token exchange error", ex);
          throw ex;
        }

        console.log("Auth set successfully, will redirect to / in 2 seconds");
        toast({
          title: "Success!",
          description: "Logged in with Authelia",
        });
      } catch (e) {
        console.error("=== OIDC CALLBACK ERROR ===");
        console.error("Error type:", e?.constructor?.name);
        console.error(
          "Error message:",
          e instanceof Error ? e.message : String(e)
        );
        console.error(
          "Error stack:",
          e instanceof Error ? e.stack : "No stack trace"
        );
        console.error("Full error object:", e);

        // Check if it's a network error
        if (e instanceof TypeError && e.message.includes("fetch")) {
          console.error(
            "This appears to be a network/CORS error during token exchange"
          );
          console.error(
            "Check if Authelia CORS is properly configured for:",
            window.location.origin
          );
        }

        toast({
          title: "OIDC error",
          description: `Login failed: ${
            e instanceof Error ? e.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      } finally {
        console.log("=== OIDC CALLBACK DEBUG END ===");
        // Increased delay to read logs
        setTimeout(() => {
          console.log("Redirecting to home page...");
          window.location.replace("/");
        }, 2000);
      }
    })();
  }, [setAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 mb-4">
          Processing Login...
        </div>
        <div className="text-gray-600">
          Please wait while we complete your authentication.
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Check the browser console for detailed logs.
        </div>
        <div className="mt-4 text-xs text-red-500">
          Current URL: {window.location.href}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Callback page loaded at: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
