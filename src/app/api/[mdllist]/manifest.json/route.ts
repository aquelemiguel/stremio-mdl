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
  { params }: { params: Promise<{ mdllist: string }> }
) {
  const { mdllist } = await params;
  const { title } = await getSimpleListMeta(mdllist);
  const manifest = await buildManifest(title);

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
