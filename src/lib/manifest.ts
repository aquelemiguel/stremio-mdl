import { Manifest } from "stremio-addon-sdk";
import { getBaseUrl } from "./config";

const BASE_MANIFEST: Manifest = {
  id: "com.aquelemiguel.stremio-mdl",
  version: "1.1.0",
  name: "MyDramaList",
  description: "Add MyDramaList lists as Stremio catalogs.",
  logo: `${getBaseUrl()}/logo.png`,
  contactEmail: "aquelemiguel@gmail.com",
  resources: ["catalog"],
  types: ["movie", "series"],
  catalogs: [],
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
        type: "MyDramaList" as never, // bypass the default type
        name: catalog,
        extra: [
          {
            name: "skip",
            isRequired: false,
          },
        ],
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
