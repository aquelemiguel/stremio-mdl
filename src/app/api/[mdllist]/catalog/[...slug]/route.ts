import { NextRequest, NextResponse } from "next/server";
import { getListMeta } from "@/lib/parsers/mdl";

interface CatalogArgs {
  type?: string;
  id?: string;
  config?: { mdllist?: string };
  extra?: {
    search?: string;
    genre?: string;
    skip?: number;
  };
}

const catalogHandler = async (args: CatalogArgs) => {
  const mdllist = args.config?.mdllist || "";
  const { items } = await getListMeta(mdllist);
  return { metas: items };
};

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

function createOptionsResponse() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

function parseRouteParams(slug: string[], mdllist?: string) {
  let type = "";
  let id = "";
  let extra = "";
  let parsedMdllist = mdllist || "";

  if (slug[slug.length - 1] === "configure") {
    return { type: "configure", id: "", extra: "", mdllist: parsedMdllist };
  }

  if (slug.length === 2) {
    // /[type]/[id].json
    type = slug[0];
    id = slug[1].replace(/\.json$/, "");
  } else if (slug.length === 3) {
    const lastSegment = slug[2];
    if (lastSegment.endsWith(".json")) {
      // Check if this is mdllist/type/id.json or type/id/extra.json
      if (!mdllist && (slug[1] === "series" || slug[1] === "movie")) {
        // type/id/extra.json where extra is actually the id
        type = slug[0];
        id = slug[1];
        extra = lastSegment.replace(/\.json$/, "");
      } else {
        // mdllist/type/id.json or similar
        if (!mdllist) parsedMdllist = slug[0];
        type = mdllist ? slug[0] : slug[1];
        id = lastSegment.replace(/\.json$/, "");
      }
    } else {
      // type/id/extra format
      type = slug[0];
      id = slug[1];
      extra = lastSegment;
    }
  } else if (slug.length === 4) {
    // mdllist/type/id/extra.json
    if (!mdllist) parsedMdllist = slug[0];
    type = mdllist ? slug[0] : slug[1];
    id = mdllist ? slug[1] : slug[2];
    extra = slug[slug.length - 1].replace(/\.json$/, "");
  }

  const parsedExtra =
    extra && extra !== ""
      ? JSON.parse(decodeURIComponent(extra))
      : { search: "", genre: "", skip: 0 };

  return { type, id, extra: parsedExtra, mdllist: parsedMdllist };
}

async function handleCatalogRequest(
  request: NextRequest,
  slug: string[],
  mdllist?: string
) {
  try {
    const {
      type,
      id,
      extra,
      mdllist: parsedMdllist,
    } = parseRouteParams(slug, mdllist);

    if (type === "configure") {
      return NextResponse.redirect("http://localhost:3000");
    }

    const result = await catalogHandler({
      type,
      id,
      config: parsedMdllist ? { mdllist: parsedMdllist } : undefined,
      extra,
    });

    return createResponse(result);
  } catch (error) {
    console.error("Catalog API error:", error);
    return createResponse({ error: "Internal server error" }, 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[]; mdllist?: string }> }
) {
  const { slug, mdllist } = await params;
  return handleCatalogRequest(request, slug, mdllist);
}

export function OPTIONS() {
  return createOptionsResponse();
}
