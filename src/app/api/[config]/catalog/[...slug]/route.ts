import { ConfigUserData, decode } from "@/lib/config";
import { getListMeta } from "@/lib/mdl/parsers/list";
import { getUserListMeta } from "@/lib/mdl/parsers/dramalist";
import { NextRequest, NextResponse } from "next/server";
import { MetaPreview } from "stremio-addon-sdk";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

async function getCatalog({
  id,
  category,
  subcategory,
}: ConfigUserData): Promise<MetaPreview[]> {
  if (category === "custom") {
    const { items } = await getListMeta(id);
    return items.map(({ meta }) => meta);
  }
  if (category === "user") {
    return await getUserListMeta(id, subcategory);
  }
  return [];
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ config: string; slug: string[] }> }
) {
  const { config } = await params;
  const userData = decode(config);

  const metas = await getCatalog(userData);
  return NextResponse.json({ metas }, { headers: CORS_HEADERS });
}
