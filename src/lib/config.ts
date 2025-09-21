import { encode } from "./utils";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

export type ConfigUserData = {
  category: "user" | "custom";
  id: string;
  subcategory: string; // todo: make type more strict
};

export function getStremioDeepLink(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl().replace(/https?:\/\//, "");
  const encoded = encode(userData);

  return `stremio://${baseUrl}/api/${encoded}/manifest.json`;
}

export function getWebInstallLink(userData: ConfigUserData): string {
  const baseUrl = "http://web.stremio.com/#/addons";
  const addonUrl = getManifestUrl(userData);

  return `${baseUrl}?addon=${encodeURIComponent(addonUrl)}`;
}

export function getManifestUrl(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl();
  const encoded = encode(userData);

  return `${baseUrl}/api/${encoded}/manifest.json`;
}
