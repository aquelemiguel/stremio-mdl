import { ConfigUserData } from "@/lib/config";
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
  { id, category, subcategory }: ConfigUserData,
  skip = 0
): Promise<MetaPreview[]> {
  if (category === "custom") {
    return await getCustomCatalogPage(id, skip);
  }
  if (category === "user") {
    return await getUserCatalogPage(id, subcategory, skip);
  }
  return [];
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
