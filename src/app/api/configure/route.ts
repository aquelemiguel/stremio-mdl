import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/config";

export function GET() {
  return NextResponse.redirect(getBaseUrl());
}
