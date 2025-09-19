// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {

    const { userId, items } = await req.json();
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const total = items.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity +
        (item.selectedIngredients?.reduce((acc, ing) => acc + ing.price, 0) || 0),
      0
    );

    const newOrder = await prisma.order.create({
      data: {
        userId,
        status: "pending",
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            ingredients: {
              create: item.selectedIngredients?.map((ing) => ({
                ingredientId: ing.id,
                price: ing.price,
              })) || [],
            },
          })),
        },
      },
      include: { items: { include: { ingredients: true } } },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
