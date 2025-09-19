import { NextRequest, NextResponse } from "next/server";
import { getSimpleListMeta } from "@/lib/parsers/mdl-custom-lists";

function createResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
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

    const meta = await getSimpleListMeta(mdl);

    // we only allow "shows" lists (reject e.g., "people" lists)
    if (meta.type !== "shows") {
      return NextResponse.json(
        {
          valid: false,
          error: 'This list is disallowed. Make sure it is a "shows" list!',
        },
        { status: 400 }
      );
    }

    return createResponse({
      valid: true,
      meta,
    });
  } catch {
    return createResponse({ valid: false, error: "Network error" }, 500);
  }
}
