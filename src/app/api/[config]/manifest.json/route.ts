import { decode } from "@/lib/config";
import { buildManifest } from "@/lib/manifest";
import { getSimpleListMeta } from "@/lib/parsers/mdl-custom-lists";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ config: string }> }
) {
  const { config } = await params;
  const { id } = decode(config);

  const { title } = await getSimpleListMeta(id);
  const manifest = await buildManifest(title);

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
