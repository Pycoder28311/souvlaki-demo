// app/api/refund-order/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

export async function POST(req) {
  try {
    const { orderId, amount } = await req.json();

    const order = await prisma.productOrder.findUnique({ where: { id: orderId } });

    if (!order?.payment_intent_id) {
      return NextResponse.json({ error: "No payment to refund" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(order.payment_intent_id);
    const paymentIntentId = session.payment_intent;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // optional partial refund
    });

    await prisma.productOrder.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true, refund });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
