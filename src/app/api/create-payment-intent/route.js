// src/app/api/create-payment-intent/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { amount, userId, items, paymentIntentId } = await request.json();

    if (!amount || !userId || !items || items.length === 0 || !paymentIntentId) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }
    // 2️⃣ Create order in Prisma
    const newOrder = await prisma.productOrder.create({
      data: {
        userId,
        status: "requested",
        total: amount / 100, // convert cents to normal currency
        paid: false,
        paidIn: "online",
        payment_intent_id: paymentIntentId, // store for refunds later
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price),
            ingredients: {
              create: item.ingredients
                ? item.ingredients.map((ing) => ({
                    ingredientId: ing.id,
                    price: Number(ing.price),
                    name: ing.name,
                  }))
                : [],
            },
            options: {
              connect: item.options ? item.options.map((opt) => ({ id: opt.id })) : [],
            },
            selectedOptions: {
              connect: item.selectedOptions
                ? item.selectedOptions.map((opt) => ({ id: opt.id }))
                : [],
            },
          })),
        },
      },
      include: { items: true },
    });

    // 3️⃣ Return both clientSecret and paymentIntentId (NO redirect)
    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
