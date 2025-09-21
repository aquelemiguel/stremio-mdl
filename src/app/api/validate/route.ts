import { NextRequest, NextResponse } from "next/server";
import { getSimpleListMeta } from "@/lib/parsers/mdl-custom-lists";
import { getListDetails } from "@/lib/parsers/mdl-user-lists";

type ValidateResponse = NextResponse<{ valid: boolean }>;

async function handleUserList(
  id: string,
  subcategory: string
): Promise<
  NextResponse<{
    valid: boolean;
  }>
> {
  try {
    const res = await fetch(
      `https://mydramalist.com/dramalist/${id}/${subcategory}`
    );
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

    const details = await getListDetails(id, subcategory);

    return NextResponse.json({
      valid: true,
      info: `${details.owner} (${details.title}) - ${details.totalItems} shows`,
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

  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const id = searchParams.get("id");

  if (!category || !subcategory || !id) {
    return NextResponse.json(
      { valid: false, error: "Missing required params!" },
      { status: 400 }
    );
  }

  if (category === "user") {
    return await handleUserList(id, subcategory);
  }
  if (category === "custom") {
    return await handleCustomList(id);
  }

  return NextResponse.json(
    {
      valid: false,
      error: "Received unknown type of list!",
    },
    { status: 400 }
  );
}
