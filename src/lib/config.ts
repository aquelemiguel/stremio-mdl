export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

export function getStremioDeepLink(mdlList: string): string {
  const baseUrl = getBaseUrl().replace(/https?:\/\//, "");
  return `stremio://${baseUrl}/api/${mdlList}/manifest.json`;
}

export function getManifestUrl(mdlList: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/${mdlList}/manifest.json`;
}
