import { ConfigUserData, MdlListSubtypeMeta, MdlListType } from "@/lib/config";
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
  const userData = decode<ConfigUserData>(config);

  let title = "";

  switch (userData.type) {
    case MdlListType.User:
      const { label } = MdlListSubtypeMeta[userData.subtype];
      const userHandle = (title = await getUserHandle(userData.id));
      console.log(`${userHandle}'s Watchlist (${label})`);
      title = `${userHandle}'s Watchlist (${label})`;
      break;

    case MdlListType.Custom:
      title = (await getSimpleListMeta(userData.id)).title;
      break;

    default:
      throw new Error("Unknown list type");
  }

  const manifest = await buildManifest(title);

  return NextResponse.json(manifest, {
    headers: CORS_HEADERS,
  });
}
