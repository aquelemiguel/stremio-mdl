import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { addonBuilder, type Manifest } from "stremio-addon-sdk";
import { catalogHandler } from "./routes/catalog.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "OPTIONS"],
    maxAge: 24 * 60 * 60,
  })
);

const manifest = {
  id: "org.aquelemiguel.stremio-mdl",
  version: "1.0.0",

  name: "MyDramaList Catalog",
  description: "Add MyDramaList lists as Stremio catalogs",

  resources: ["catalog"], // todo: revisit this later
  types: ["series"], // todo: revisit this later

  catalogs: [
    {
      id: "mydramalist",
      type: "series",
      name: "Test MyDramaList catalog!!!",
    },
  ],

  config: [
    {
      key: "mdllist",
      type: "text",
    },
  ],

  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
} satisfies Manifest;

app.get("/configure", (c) => c.redirect("http://localhost:3000"));
app.get("/:prefix/configure", (c) => c.redirect("http://localhost:3000"));

app.get("/manifest.json", (c) => c.json(manifest));

app.get("/:mdllist/manifest.json", (c) => {
  const { mdllist } = c.req.param();
  console.log(`Installing addon with MDL list: ${mdllist}`);

  const customManifest = {
    ...manifest,
    behaviorHints: {
      ...manifest.behaviorHints,
      configurationRequired: false,
    },
  };

  return c.json(customManifest);
});

const builder = new addonBuilder(manifest);
builder.defineCatalogHandler(catalogHandler);

app.get("/:mdllist/catalog/:type/:id/:extra?.json", async (c) => {
  const { mdllist, type, id } = c.req.param();
  let extra = c.req.param("extra") || "";

  if (extra.endsWith(".json")) {
    extra = extra.replace(/\.json$/, "");
  }

  console.log(
    `Handling catalog request with config: mdllist=${mdllist}, type=${type}, id=${id}`
  );

  const result = await catalogHandler({
    type,
    id,
    config: { mdllist },
    extra: extra
      ? JSON.parse(decodeURIComponent(extra))
      : {
          search: "",
          genre: "",
          skip: 0,
        },
  });

  return c.json(result);
});

// Keep the original route for testing/compatibility
app.get("/catalog/:type/:id/:extra?.json", async (c) => {
  const type = c.req.param("type");
  const id = c.req.param("id");
  let extra = c.req.param("extra") || "";

  if (extra.endsWith(".json")) {
    extra = extra.replace(/\.json$/, "");
  }

  const result = await catalogHandler({
    type,
    id,
    extra: extra
      ? JSON.parse(decodeURIComponent(extra))
      : {
          search: "",
          genre: "",
          skip: 0,
        },
  });

  return c.json(result);
});

app.get("/:mdllist/catalog/:type/:id.json", async (c) => {
  const { mdllist, type } = c.req.param();
  const idWithJson = c.req.param("id.json");
  const id = idWithJson.replace(/\.json$/, "");

  console.log(
    `Handling legacy catalog request with config: mdllist=${mdllist}, type=${type}, id=${id}`
  );

  const result = await catalogHandler({
    type,
    id,
    config: { mdllist },
    extra: {
      search: "",
      genre: "",
      skip: 0,
    },
  });

  return c.json(result);
});

// Keep the original route for testing/compatibility
app.get("/catalog/:type/:id.json", async (c) => {
  const type = c.req.param("type");
  const idWithJson = c.req.param("id.json");
  const id = idWithJson.replace(/\.json$/, "");

  const result = await catalogHandler({
    type,
    id,
    extra: {
      search: "",
      genre: "",
      skip: 0,
    },
  });

  return c.json(result);
});

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log(`Install addon at http://127.0.0.1:${info.port}/manifest.json`);
  }
);
