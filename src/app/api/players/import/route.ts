import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const importRowSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional().or(z.literal("")),
  handicap: z.coerce.number().min(0).max(54).optional(),
  language: z.enum(["ES", "EN", "DE", "FR"]).optional(),
  birthday: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const importBodySchema = z.object({
  rows: z.array(z.record(z.any())).min(1, "El archivo no contiene filas").max(2000, "Máximo 2000 jugadores por importación"),
});

/**
 * Normalize a phone for storage: strip spaces/dashes/parens, ensure + prefix.
 * Spanish 9-digit numbers get +34 automatically.
 */
function normalizePhone(raw: string): string | null {
  let clean = String(raw).replace(/[\s\-().]/g, "");
  if (!clean) return null;
  if (clean.startsWith("00")) clean = "+" + clean.slice(2);
  if (!clean.startsWith("+")) {
    if (/^[679]\d{8}$/.test(clean)) {
      clean = "+34" + clean;
    } else if (/^\d{10,15}$/.test(clean)) {
      clean = "+" + clean;
    } else {
      return null;
    }
  }
  if (!/^\+\d{8,15}$/.test(clean)) return null;
  return clean;
}

// POST /api/players/import — Bulk import players (rows parsed client-side from CSV)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { rows } = importBodySchema.parse(body);

    const errors: Array<{ row: number; error: string }> = [];
    const validRows: Array<{
      firstName: string;
      lastName: string;
      phone: string;
      email: string | null;
      handicap: number | null;
      preferredLanguage: "ES" | "EN" | "DE" | "FR";
      birthday: Date | null;
      notes: string | null;
    }> = [];
    const seenPhones = new Set<string>();

    rows.forEach((raw, idx) => {
      const rowNum = idx + 2; // +1 for 0-index, +1 for header row
      const parsed = importRowSchema.safeParse(raw);
      if (!parsed.success) {
        errors.push({
          row: rowNum,
          error: parsed.error.errors?.[0]
            ? `${parsed.error.errors[0].path.join(".")}: ${parsed.error.errors[0].message}`
            : "Fila inválida",
        });
        return;
      }
      const data = parsed.data;

      const phone = normalizePhone(data.phone);
      if (!phone) {
        errors.push({ row: rowNum, error: `Teléfono inválido: "${data.phone}"` });
        return;
      }
      if (seenPhones.has(phone)) {
        errors.push({ row: rowNum, error: `Teléfono duplicado en el archivo: ${phone}` });
        return;
      }
      seenPhones.add(phone);

      let birthday: Date | null = null;
      if (data.birthday) {
        const d = new Date(data.birthday);
        if (!isNaN(d.getTime())) birthday = d;
      }

      validRows.push({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone,
        email: data.email ? data.email.trim().toLowerCase() : null,
        handicap: data.handicap ?? null,
        preferredLanguage: data.language || "ES",
        birthday,
        notes: data.notes || null,
      });
    });

    // Skip players already in the database (matched by phone)
    const phones = validRows.map((r) => r.phone);
    const existing = await prisma.player.findMany({
      where: { phone: { in: phones } },
      select: { phone: true },
    });
    const existingPhones = new Set(existing.map((p) => p.phone));

    // Emails must also be unique — drop duplicates instead of failing the batch
    const emails = validRows.filter((r) => r.email).map((r) => r.email as string);
    const existingEmails = new Set(
      (
        await prisma.player.findMany({
          where: { email: { in: emails } },
          select: { email: true },
        })
      ).map((p) => p.email)
    );

    const toCreate = validRows.filter((r) => !existingPhones.has(r.phone));
    const skipped = validRows.length - toCreate.length;

    const seenEmails = new Set<string>();
    const finalRows = toCreate.map((r) => {
      let email = r.email;
      if (email && (existingEmails.has(email) || seenEmails.has(email))) {
        email = null; // keep the player, drop the conflicting email
      }
      if (email) seenEmails.add(email);
      return { ...r, email, source: "import" as const };
    });

    let created = 0;
    if (finalRows.length > 0) {
      const result = await prisma.player.createMany({
        data: finalRows,
        skipDuplicates: true,
      });
      created = result.count;
    }

    return NextResponse.json({
      created,
      skipped,
      errors,
      total: rows.length,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error importing players:", error);
    return NextResponse.json(
      { error: "Error al importar jugadores" },
      { status: 500 }
    );
  }
}
