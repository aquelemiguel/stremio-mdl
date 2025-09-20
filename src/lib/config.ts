import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

type ConfigUserData = {
  category: "user" | "custom";
  id: string;
  subcategory: string; // todo: make type more strict
};

// todo: move encode/decode somewhere else probably...
export function encode(userData: ConfigUserData): string {
  return compressToEncodedURIComponent(JSON.stringify(userData));
}

export function decode(str: string): ConfigUserData {
  return JSON.parse(decompressFromEncodedURIComponent(str));
}

export function getStremioDeepLink(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl().replace(/https?:\/\//, "");
  const encoded = encode(userData);

  return `stremio://${baseUrl}/api/${encoded}/manifest.json`;
}

// todo: maybe this is more of an util
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
