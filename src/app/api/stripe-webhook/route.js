// app/api/stripe-webhook/route.ts
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Update order in DB with PaymentIntent ID and mark as paid
    await prisma.productOrder.update({
      where: { checkout_session_id: session.id },
      data: {
        payment_intent_id: session.payment_intent,
        paid: true,
        status: "paid",
      },
    });
  }

  return new Response("OK");
}
