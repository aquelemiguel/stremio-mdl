import { Manifest } from "stremio-addon-sdk";

export const BASE_MANIFEST: Manifest = {
  id: "org.aquelemiguel.stremio-mdl",
  version: "1.0.0",
  name: "MyDramaList Catalog",
  description: "Add MyDramaList lists as Stremio catalogs",
  resources: ["catalog"],
  types: ["series"],
  catalogs: [
    {
      id: "mydramalist",
      type: "series",
      name: "Test MyDramaList catalog!!!",
    },
  ],
  config: [{ key: "mdllist", type: "text" }],
  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
};
