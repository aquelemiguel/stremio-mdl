import { NextResponse } from "next/server";
import type { Manifest } from "stremio-addon-sdk";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const BASE_MANIFEST: Manifest = {
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

function createResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: CORS_HEADERS,
  });
}

function createOptionsResponse() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

function getManifest(mdllist?: string): Manifest {
  if (!mdllist) {
    return BASE_MANIFEST;
  }

  return {
    ...BASE_MANIFEST,
    behaviorHints: {
      ...BASE_MANIFEST.behaviorHints,
      configurationRequired: false,
    },
  };
}

export async function GET() {
  return createResponse(getManifest());
}

export async function OPTIONS() {
  return createOptionsResponse();
}
