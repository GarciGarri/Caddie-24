import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async function GET(req: NextRequest) {
  if (!(req as any).auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status"); // comma-separated: OPEN,PENDING
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = {};

  if (status) {
    const statuses = status.split(",").map((s) => s.trim());
    where.status = { in: statuses };
  }

  if (search) {
    where.OR = [
      { lastMessagePreview: { contains: search, mode: "insensitive" } },
      { player: { firstName: { contains: search, mode: "insensitive" } } },
      { player: { lastName: { contains: search, mode: "insensitive" } } },
      { player: { phone: { contains: search } } },
    ];
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            engagementLevel: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.conversation.count({ where }),
  ]);

  return NextResponse.json({
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
} as any);
