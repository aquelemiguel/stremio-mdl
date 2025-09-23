import { ConfigUserData, MdlListType } from "@/lib/config";
import { getCatalogPage as getUserCatalogPage } from "@/lib/mdl/parsers/dramalist";
import { getCatalogPage as getCustomCatalogPage } from "@/lib/mdl/parsers/list";
import { decode } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { MetaPreview } from "stremio-addon-sdk";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function parseExtra(extra: string) {
  const [key, value] = extra.replace(".json", "").split("=");
  return { [key]: value };
}

async function getCatalog(
  config: ConfigUserData,
  skip = 0
): Promise<MetaPreview[]> {
  const { id, type } = config;

  switch (type) {
    case MdlListType.User:
      const { subtype } = config;
      return await getUserCatalogPage(id, subtype, skip);

    case MdlListType.Custom:
      return await getCustomCatalogPage(id, skip);

    default:
      console.error("Unknown list type");
      return [];
  }
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ config: string; slug?: string[] }> }
) {
  const { config, slug = [] } = await params;
  const userData = decode<ConfigUserData>(config);
  const extra = parseExtra(slug[2] ?? "");

  const metas = await getCatalog(
    userData,
    "skip" in extra ? parseInt(extra["skip"], 10) : 0
  );

  return NextResponse.json({ metas }, { headers: CORS_HEADERS });
}
