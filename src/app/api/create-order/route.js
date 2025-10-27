// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId, items, paid, paidIn } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Calculate total using only the base product price
    const total = items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    // Create order
    const newOrder = await prisma.productOrder.create({
      data: {
        userId,
        status: "requested",
        total: total,
        paid: paid || false,
        paidIn: paidIn || "door",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price), // store only base price
            ingredients: {
              create: item.ingredients
                ? item.ingredients.map((ing) => ({
                    ingredientId: ing.id,
                    price: Number(ing.price), // stored but not added to total
                    name: ing.name,
                  }))
                : [],
            },
            options: {
              connect: item.options
                ? item.options.map((opt) => ({ id: opt.id }))
                : [],
            },
            // add selected options (options selected by the user)
            selectedOptions: {
              connect: item.selectedOptions
                ? item.selectedOptions.map((opt) => ({ id: opt.id }))
                : [],
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            ingredients: { include: { ingredient: true } },
            options: true,
            selectedOptions: true,
          },
        },
      },
    });

    const io = globalThis.io || req?.socket?.server?.io;
    if (io) {
      io.emit("orderUpdated", newOrder);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
