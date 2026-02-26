import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testConnection } from "@/lib/services/whatsapp";

export const POST = auth(async function POST(req: NextRequest) {
  if (!(req as any).auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const result = await testConnection();
  return NextResponse.json(result);
} as any);
