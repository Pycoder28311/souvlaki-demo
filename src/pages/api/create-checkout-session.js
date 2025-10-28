import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { userId, items, amount, orderId } = req.body;

      if (!items || !userId) {
        return res.status(400).json({ error: "Missing order data" });
      }
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        payment_intent_data: {
          metadata: { userId, orderId }, // ✅ metadata στο PaymentIntent
        },
        line_items: [
          {
            price_data: {
              currency: "eur", // <-- changed from "usd" to "eur"
              product_data: {
                name: "Custom Product",
              },
              unit_amount: amount, // χρησιμοποιούμε το input του χρήστη σε cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      res.status(200).json({ url: session.url, paymentIntentId: session.payment_intent });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
