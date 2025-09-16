import { Manifest } from "stremio-addon-sdk";

const BASE_MANIFEST: Manifest = {
  id: "org.aquelemiguel.stremio-mdl",
  version: "1.0.0",
  name: "MyDramaList Catalog",
  description: "Add MyDramaList lists as Stremio catalogs",
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
