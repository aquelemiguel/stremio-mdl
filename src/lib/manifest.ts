import { Manifest } from "stremio-addon-sdk";
import { getBaseUrl } from "./config";

const BASE_MANIFEST: Manifest = {
  id: "com.aquelemiguel.stremio-mdl",
  version: "1.0.1",
  name: "MyDramaList",
  description: "Add MyDramaList lists as Stremio catalogs.",
  logo: `${getBaseUrl()}/logo.png`,
  contactEmail: "aquelemiguel@gmail.com",
  resources: ["catalog"],
  types: ["movie", "series"],
  catalogs: [],
  config: [{ key: "mdllist", type: "text" }],
  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
};

export async function buildManifest(catalog?: string): Promise<Manifest> {
  if (!catalog) {
    return BASE_MANIFEST;
  }

  return {
    ...BASE_MANIFEST,
    catalogs: [
      {
        id: "mydramalist",
        type: "series",
        name: `MyDramaList: ${catalog}`,
      },
    ],
    behaviorHints: {
      ...BASE_MANIFEST.behaviorHints,
      configurationRequired: false,
    },
  };
}

export function getVersion(): string {
  return `v${BASE_MANIFEST.version}`;
}
