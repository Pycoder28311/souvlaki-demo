// src/app/api/create-payment-intent/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

export async function POST(request) {
  try {
    const { amount, currency, userId } = await request.json();

    if (!amount || !userId) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    // 1️⃣ Create a PaymentIntent (client-side confirmation via <PaymentElement/>)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    // 3️⃣ Return both clientSecret and paymentIntentId (NO redirect)
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
