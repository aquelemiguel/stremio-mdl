import { BASE_MANIFEST } from "@/lib/manifest";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export async function GET() {
  const unlockedManifest = {
    ...BASE_MANIFEST,
    behaviorHints: {
      ...BASE_MANIFEST.behaviorHints,
      configurationRequired: false,
    },
  };

  return NextResponse.json(unlockedManifest, {
    headers: CORS_HEADERS,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
