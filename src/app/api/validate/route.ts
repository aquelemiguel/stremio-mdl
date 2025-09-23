import { NextRequest, NextResponse } from "next/server";
import { getSimpleListMeta } from "@/lib/mdl/parsers/list";
import { getListDetails } from "@/lib/mdl/parsers/dramalist";
import { MdlListStageMeta, MdlListSubtype, MdlListType } from "@/lib/config";

type ValidateResponse = NextResponse<{ valid: boolean }>;

async function handleUserList(
  id: string,
  subtype: MdlListSubtype
): Promise<
  NextResponse<{
    valid: boolean;
  }>
> {
  const { slug } = MdlListStageMeta[subtype];

  const res = await fetch(`https://mydramalist.com/dramalist/${id}/${slug}`);
  if (res.status === 404) {
    return NextResponse.json(
      {
        valid: false,
        error: "Could not find list, is it private?",
      },
      { status: 404 }
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      {
        valid: false,
        error: `Error: ${res.status}`,
      },
      { status: res.status }
    );
  }

  const details = await getListDetails(id, subtype);

  return NextResponse.json({
    valid: true,
    info: `${details.owner} (${details.title}) - ${details.totalItems} shows`,
  });
}

async function handleCustomList(id: string): Promise<ValidateResponse> {
  try {
    const res = await fetch(`https://mydramalist.com/list/${id}`);
    if (res.status === 404) {
      return NextResponse.json(
        {
          valid: false,
          error: "Could not find list, is it private?",
        },
        { status: 404 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        {
          valid: false,
          error: `Error: ${res.status}`,
        },
        { status: res.status }
      );
    }

    const meta = await getSimpleListMeta(id);

    // we only allow "shows lists" (reject "people lists")
    if (meta.type !== "shows") {
      return NextResponse.json(
        {
          valid: false,
          error: 'This list is disallowed, make sure it is a "shows" list!',
        },
        { status: 400 }
      );
    }
    return NextResponse.json({
      valid: true,
      info: `${meta.title} - ${meta.totalItems} shows`,
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        error: "Network error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("t");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { valid: false, error: "Missing required params!" },
      { status: 400 }
    );
  }

  switch (Number(type)) {
    case MdlListType.User:
      const subtype = searchParams.get("st");
      return await handleUserList(id, Number(subtype));

    case MdlListType.Custom:
      return await handleCustomList(id);

    default:
      throw new Error("Unknown type");
  }
}
