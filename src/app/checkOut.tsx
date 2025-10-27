"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 rounded-lg space-y-6"
    >
      <PaymentElement className="w-full" />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Πληρωμή"}
      </button>
    </form>
  );
}

export default function CheckoutPage({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Δημιουργούμε async function μέσα στο useEffect
    const createPaymentIntent = async () => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount)*100, currency: "eur" }), // διόρθωση typo
        });

        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        console.error("Error creating payment intent:", err);
      }
    };

    createPaymentIntent();
  }, []);

  const options = { clientSecret, 
    appearance: {
      variables: {
        colorPrimary: '#1518a1ff',
        colorBackground: '#ffffffff',
        colorText: '#111827',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '0px',
        spacingUnit: '4px',
      },
    }, };

  return (
    clientSecret && (
      <Elements options={{ ...options, locale: 'el' }} stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    )
  );
}
