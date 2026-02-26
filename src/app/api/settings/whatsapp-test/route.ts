import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testConnection } from "@/lib/services/whatsapp";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const result = await testConnection();
  return NextResponse.json(result);
}
