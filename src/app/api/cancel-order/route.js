import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path to your Prisma client

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Update order status to 'cancelled'
    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
