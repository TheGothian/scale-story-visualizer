export type WebAuthnSettings = {
  enabled: boolean;
  rpName: string;
  rpID: string;
  rpOrigins: string[];
  userVerification: "required" | "preferred" | "discouraged";
  authenticatorAttachment?: "platform" | "cross-platform";
  timeouts: { registration: number; authentication: number };
};

let cachedSettings: WebAuthnSettings | null = null;

export function getWebAuthnSettings(): WebAuthnSettings | null {
  if (cachedSettings !== null) return cachedSettings;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // Use require to allow optional file without breaking Vite build when missing
    // The file path is relative to this module
    // @ts-ignore - require is available in Vite via CJS compatibility during build
    const settings =
      require("./webauthn.settings.local.json") as WebAuthnSettings;
    if (!settings || settings.enabled !== true) {
      cachedSettings = null;
      return null;
    }
    cachedSettings = settings;
    return cachedSettings;
  } catch (e) {
    cachedSettings = null;
    return null;
  }
}

export function isWebAuthnEnabled(): boolean {
  return getWebAuthnSettings() !== null;
}
