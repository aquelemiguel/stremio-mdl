import { buildManifest } from "@/lib/manifest";
import { getListTitle } from "@/lib/parsers/mdl";
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
  const listTitle = await getListTitle(mdllist);
  const manifest = await buildManifest(listTitle);

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
