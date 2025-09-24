// OIDC Configuration that automatically selects between development and production
// based on environment variables set in .env.development and .env.production files
export const oidcConfig = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY || "https://auth.dreamstate.nu",
  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID || "scale-story-visualizer-dev",
  client_secret:
    import.meta.env.VITE_OIDC_CLIENT_SECRET ||
    "89cd6e56b2646be8586d2ec20221918b77f19da2ce007a0635789dede6f7029d", // not sent with PKCE on browser flows, but keep for uniformity if needed
  redirect_uri:
    import.meta.env.VITE_OIDC_REDIRECT_URI ||
    "http://localhost:8080/auth/callback",
  post_logout_redirect_uri:
    import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ||
    "http://localhost:8080/",
  response_type: import.meta.env.VITE_OIDC_RESPONSE_TYPE || "code",
  scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile email",
};
