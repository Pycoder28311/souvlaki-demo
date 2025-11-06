// app/api/refund-order/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

export async function POST(req) {
  try {
    const { orderId, amount, status } = await req.json();

    const order = await prisma.productOrder.findUnique({ where: { id: orderId } });
    const statusToPut = status? status : "cancelled"

    if (order?.payment_intent_id) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json(
          { error: "Payment not completed, cannot refund" },
          { status: 400 }
        );
      }
      await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: amount ? Math.round(amount * 100) : undefined, // optional partial refund
      });
    }

    await prisma.productOrder.update({
      where: { id: orderId },
      data: { status: statusToPut },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
