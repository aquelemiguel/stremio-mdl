import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mdl = searchParams.get("mdl");

  if (!mdl) {
    return NextResponse.json(
      { valid: false, error: "missing mdl list" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://mydramalist.com/list/${mdl}`, {
      method: "HEAD",
    });
    if (res.status === 404) {
      return NextResponse.json(
        { valid: false, error: "Could not find list!" },
        { status: 404 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { valid: false, error: `Error: ${res.status}` },
        { status: res.status }
      );
    }
    return NextResponse.json({ valid: true });
  } catch (_err) {
    return NextResponse.json(
      { valid: false, error: "Network error" },
      { status: 500 }
    );
  }
}
