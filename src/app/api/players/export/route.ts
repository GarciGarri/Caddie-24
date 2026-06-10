import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/players/export — Download all active players as CSV
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const players = await prisma.player.findMany({
      where: { isActive: true },
      include: {
        tags: { select: { tag: true } },
        membership: { select: { type: true, status: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const header = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "handicap",
      "federationLicense",
      "language",
      "engagementLevel",
      "membership",
      "birthday",
      "tags",
      "notes",
    ].join(",");

    const rows = players.map((p) =>
      [
        csvEscape(p.firstName),
        csvEscape(p.lastName),
        csvEscape(p.phone),
        csvEscape(p.email),
        csvEscape(p.handicap),
        csvEscape(p.federationLicense),
        csvEscape(p.preferredLanguage),
        csvEscape(p.engagementLevel),
        csvEscape(
          p.membership && p.membership.status === "ACTIVE" ? p.membership.type : ""
        ),
        csvEscape(p.birthday ? p.birthday.toISOString().split("T")[0] : ""),
        csvEscape(p.tags.map((t) => t.tag).join("|")),
        csvEscape(p.notes),
      ].join(",")
    );

    // BOM so Excel opens UTF-8 accents correctly
    const csv = "﻿" + [header, ...rows].join("\r\n");
    const date = new Date().toISOString().split("T")[0];

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jugadores-${date}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting players:", error);
    return NextResponse.json(
      { error: "Error al exportar jugadores" },
      { status: 500 }
    );
  }
}
