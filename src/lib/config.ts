export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

type ConfigUserData = {
  category: "user" | "custom";
  id: string;
  subcategory: string; // todo: make type more strict
};

function encode(userData: ConfigUserData): string {
  return btoa(JSON.stringify(userData))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decode(str: string): ConfigUserData {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(b64));
}

export function getStremioDeepLink(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl().replace(/https?:\/\//, "");
  const encodedData = encode(userData);

  return `stremio://${baseUrl}/api/${encodedData}/manifest.json`;
}

// todo: maybe this is more of an util
export function getWebInstallLink(userData: ConfigUserData): string {
  const baseUrl = "http://web.stremio.com/#/addons";
  const addonUrl = getManifestUrl(userData);

  return `${baseUrl}?addon=${encodeURIComponent(addonUrl)}`;
}

export function getManifestUrl(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl();
  const encodedData = encode(userData);
  console.log(encodedData, userData);

  return `${baseUrl}/api/${encodedData}/manifest.json`;
}
