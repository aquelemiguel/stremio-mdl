import { ConfigUserData, MdlListType } from "@/lib/config";
import { buildManifest } from "@/lib/manifest";
import { getSimpleListMeta } from "@/lib/mdl/parsers/list";
import { getUserHandle } from "@/lib/mdl/parsers/profile";
import { decode } from "@/lib/utils";
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
  const { id, type } = decode<ConfigUserData>(config);

  let title = "";

  switch (type) {
    case MdlListType.User:
      title = await getUserHandle(id);
      break;

    case MdlListType.Custom:
      title = (await getSimpleListMeta(id)).title;
      break;

    default:
      throw new Error("Unknown list type");
  }

  const manifest = await buildManifest(title);

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
