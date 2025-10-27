// app/api/create-order-and-session/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

export async function POST(req) {
  try {
    const { userId, items, paidIn } = await req.json();

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    // 1️⃣ Υπολογισμός συνολικού ποσού
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    // 2️⃣ Δημιουργία παραγγελίας στη βάση
    const newOrder = await prisma.productOrder.create({
      data: {
        userId,
        status: "requested",
        total,
        paid: false,
        paidIn: paidIn || "online",
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
              connect: item.selectedOptions ? item.selectedOptions.map((opt) => ({ id: opt.id })) : [],
            },
          })),
        },
      },
      include: { items: true },
    });

    // 3️⃣ Δημιουργία Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      payment_intent_data: {
        metadata: { orderId: newOrder.id, userId }, // attach metadata to PaymentIntent
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Custom Product" },
            unit_amount: total * 100, // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
      expand: ["payment_intent"],
    });

    await prisma.productOrder.update({
      where: { id: newOrder.id },
      data: { payment_intent_id: session.id },
    });

    console.log("PaymentIntentId:", session.payment_intent, "OrderId:", newOrder.id, session, session.payment_intent);

    return NextResponse.json({
      success: true,
      order: newOrder,
      url: session.url,
      paymentIntentId: session.payment_intent,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
