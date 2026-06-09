import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "MANAGER", "AGENT"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100).optional(),
});

// PATCH /api/team/[id] — Update team member (ADMIN only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo los administradores pueden editar usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateUserSchema.parse(body);
    const currentUserId = (session.user as any)?.id;

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Guard: an admin cannot deactivate themselves
    if (validated.isActive === false && params.id === currentUserId) {
      return NextResponse.json(
        { error: "No puedes desactivar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Guard: never leave the club without an active admin
    const losesAdmin =
      target.role === "ADMIN" &&
      (validated.role !== undefined && validated.role !== "ADMIN" ||
        validated.isActive === false);
    if (losesAdmin) {
      const activeAdmins = await prisma.user.count({
        where: { role: "ADMIN", isActive: true, id: { not: params.id } },
      });
      if (activeAdmins === 0) {
        return NextResponse.json(
          { error: "Debe quedar al menos un administrador activo" },
          { status: 400 }
        );
      }
    }

    const data: any = {};
    if (validated.name !== undefined) data.name = validated.name;
    if (validated.role !== undefined) data.role = validated.role;
    if (validated.isActive !== undefined) data.isActive = validated.isActive;
    if (validated.password !== undefined) {
      data.hashedPassword = await bcrypt.hash(validated.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}
