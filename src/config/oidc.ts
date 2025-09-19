export const oidcConfig = {
  authority: "https://auth.dreamstate.nu",
  client_id: "scale-story-visualizer-dev",
  client_secret:
    "89cd6e56b2646be8586d2ec20221918b77f19da2ce007a0635789dede6f7029d", // not sent with PKCE on browser flows, but keep for uniformity if needed
  redirect_uri: "http://localhost:8080/auth/callback",
  post_logout_redirect_uri: "http://localhost:8080/",
  response_type: "code",
  scope: "openid profile email",
};
