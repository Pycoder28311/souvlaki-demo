// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req) {
  try {
    const { userId, items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Calculate total safely
    const total = items.reduce((sum, item) => {
      const itemPrice = Number(item.price) * Number(item.quantity);
      const ingredientsPrice = item.selectedIngredients
        ? item.selectedIngredients.reduce(
            (acc, ing) => acc + Number(ing.price),
            0
          )
        : 0;
      return sum + itemPrice + ingredientsPrice;
    }, 0);

    // Wrap total in Prisma.Decimal
    const totalDecimal = new Prisma.Decimal(total);

    // Create order
    const newOrder = await prisma.order.create({
      data: {
        userId,
        status: "pending",
        total: totalDecimal,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price),
            ingredients: {
              create: item.selectedIngredients
                ? item.selectedIngredients.map((ing) => ({
                    ingredientId: ing.id,
                    price: Number(ing.price),
                    name: ing.name,
                  }))
                : [],
            },
          })),
        },
      },
      include: { items: { include: { ingredients: true } } },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
