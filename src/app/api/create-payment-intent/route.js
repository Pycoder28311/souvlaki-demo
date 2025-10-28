// src/app/api/create-payment-intent/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

export async function POST(request) {
  try {
    const { amount, currency, userId, items, paidIn } = await request.json();

    if (!amount || !userId || !items || items.length === 0 || !paidIn) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    // 1️⃣ Create a PaymentIntent (client-side confirmation via <PaymentElement/>)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    // 2️⃣ Create order in Prisma
    const newOrder = await prisma.productOrder.create({
      data: {
        userId,
        status: "requested",
        total: amount / 100, // convert cents to normal currency
        paid: false,
        paidIn: paidIn || "online",
        payment_intent_id: paymentIntent.id, // store for refunds later
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
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      order: newOrder,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
