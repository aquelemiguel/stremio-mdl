import { decode } from "@/lib/config";
import { buildManifest } from "@/lib/manifest";
import { getUserHandle } from "@/lib/mdl/parsers/profile";
import { getSimpleListMeta } from "@/lib/mdl/parsers/list";
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
  const { id, category } = decode(config);

  let title = "";

  if (category === "custom") {
    const meta = await getSimpleListMeta(id);
    title = meta.title;
  } else if (category === "user") {
    title = await getUserHandle(id);
  } else {
    throw new Error("Wrong category!");
  }

  const manifest = await buildManifest(title);

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
