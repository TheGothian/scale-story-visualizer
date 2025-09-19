import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { oidcConfig } from "@/config/oidc";

export const userManager = new UserManager({
  authority: oidcConfig.authority,
  client_id: oidcConfig.client_id,
  client_secret: oidcConfig.client_secret,
  redirect_uri: oidcConfig.redirect_uri,
  post_logout_redirect_uri: oidcConfig.post_logout_redirect_uri,
  response_type: oidcConfig.response_type,
  scope: oidcConfig.scope,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});
