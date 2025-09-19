// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");

    if (!userIdParam) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
