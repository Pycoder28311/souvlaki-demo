"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { OrderItem } from "../types";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CheckoutPageProps = {
  amount: number;
  userId?: number;
  items: OrderItem[];
  paidIn: string;
  isDisabled: boolean;
  removeItem: (item: OrderItem) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  onLoaded?: () => void;
};

type CheckoutFormProps = {
  items: OrderItem[];
  isDisabled: boolean;
  removeItem: (item: OrderItem) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  onLoaded?: () => void;
};


function CheckoutForm({ 
  items,
  isDisabled, 
  removeItem,
  setIsSidebarOpen,
  setShowPaymentModal,
  onLoaded,
 }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (onLoaded) onLoaded(); // 🟢 tell parent when loaded
  }, [onLoaded]);

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

    if (error) {
      setLoading(false);
      return; // stop execution
    }

    items.forEach((item) => removeItem(item));
    setIsSidebarOpen(false);
    setShowPaymentModal(false);

    setLoading(false);
  };
  const [showPaymentElement, setShowPaymentElement] = useState(false);

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPaymentElement(true);
  };

  const disabledClasses = "opacity-50 pointer-events-none";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-0 rounded-lg flex flex-col space-y-2"
    >
      <PaymentElement className="w-full" />

      {showPaymentElement ? (
        <button
          type="button"
          onClick={handlePayClick}
          className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-green-600
            ${isDisabled ? disabledClasses : ""}`}
          disabled={isDisabled}
        >
          Συμπληρώστε τα στοιχεία για να πληρώσετε
        </button>
      ) : (
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!stripe || loading || isDisabled}
          className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-green-600
            ${isDisabled || loading ? disabledClasses : ""}`}
        >
          {loading ? "Γίνεται η πληρωμή..." : "Πληρωμή Online"}
        </button>
      )}
    </form>
  );
}

export default function CheckoutPage({
  amount,
  userId,
  items,
  paidIn,
  isDisabled,
  removeItem,
  setIsSidebarOpen,
  setShowPaymentModal,
  onLoaded,
}: CheckoutPageProps) {
  const [clientSecret, setClientSecret] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Δημιουργούμε async function μέσα στο useEffect
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount)*100, currency: "eur", userId, items, paidIn }), // διόρθωση typo
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
  }, [amount, items, paidIn, router, userId]);

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
        <CheckoutForm isDisabled={isDisabled} items={items} removeItem={removeItem} setIsSidebarOpen={setIsSidebarOpen} setShowPaymentModal={setShowPaymentModal} onLoaded={onLoaded}/>
      </Elements>
    )
  );
}
