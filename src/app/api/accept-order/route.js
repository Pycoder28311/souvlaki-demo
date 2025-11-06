// app/api/accept-order/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { id, deliveryTime } = await req.json();
    if (!id || !deliveryTime) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Save the order as accepted with deliveryTime
    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: {
        status: "pending",
        deliveryTime, // e.g. "25-30"
      },
    });

    // Extract the lower bound of minutes from the string, e.g., "25-30" => 25
    const minutesMatch = deliveryTime.match(/^(\d+)-\d+$/);
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

    // Schedule update to "completed" after `minutes`
    setTimeout(async () => {
      try {
        await prisma.productOrder.update({
          where: { id },
          data: { status: "completed" },
        });
      } catch (err) {
        console.error("Failed to mark order completed:", err);
      }
    }, minutes * 60 * 1000); // convert minutes to ms

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
  }
}
