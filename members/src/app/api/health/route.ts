import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, demo: isDemoMode() });
}
