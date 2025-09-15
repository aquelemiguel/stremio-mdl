import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function createResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mdl = searchParams.get("mdl");

  if (!mdl) {
    return createResponse({ valid: false, error: "missing mdl list" }, 400);
  }

  try {
    const res = await fetch(`https://mydramalist.com/list/${mdl}`);
    if (res.status === 404) {
      return createResponse(
        { valid: false, error: "Could not find list!" },
        404
      );
    }
    if (!res.ok) {
      return createResponse(
        { valid: false, error: `Error: ${res.status}` },
        res.status
      );
    }

    const $ = cheerio.load(await res.text());
    const match = $("title")
      .text()
      .match(/(.+) \((\d+) shows\)/);
    const [, title, itemTotal] = match || [];

    return createResponse({
      valid: true,
      meta: {
        title,
        total: itemTotal ? parseInt(itemTotal, 10) : 0,
      },
    });
  } catch {
    return createResponse({ valid: false, error: "Network error" }, 500);
  }
}
