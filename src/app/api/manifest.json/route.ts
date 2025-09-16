import { buildManifest } from "@/lib/manifest";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export async function GET() {
  const manifest = await buildManifest();

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
