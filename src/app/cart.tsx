// components/OrderSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import React from "react";
import { X, ShoppingCart, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

type Ingredient = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
};

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
};

interface OrderSidebarProps {
  orderItems: OrderItem[];
  setEditableOrderItem: (item: OrderItem | null) => void;
  setQuantity: (qty: number) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  removeItem: (item: OrderItem) => void;
}

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address?: string;
};

export default function OrderSidebar({
  orderItems,
  setEditableOrderItem,
  setQuantity,
  isSidebarOpen,
  setIsSidebarOpen,
  removeItem,
}: OrderSidebarProps) {
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    setHydrated(true); // ✅ mark client as ready
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  const handlePayment = async () => {
    try {
      const userId = user?.id; // Replace with current logged-in user id
      const payload = {
        userId,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedIngredients: item.selectedIngredients || [],
        })),
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order created successfully!");
        orderItems.forEach((item) => removeItem(item));

        setIsSidebarOpen(false);
        setShowPaymentModal(false);
      } else {
        alert("Error creating order: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  if (!hydrated) {
    // Render nothing (or a skeleton) until client + localStorage are ready
    return null;
  }

  return (
    
   <div
      className={`flex flex-col h-full w-full md:w-80 bg-gray-100 p-4 border-l border-gray-200 border-l-2 border-yellow-400 shadow-lg transition-all duration-300
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        fixed right-0 top-[55px] z-50`}
      style={{ height: `calc(100vh - 55px)` }}
    >
      {/* Header with Close Button in same line */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-400 pb-3">
        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" /> Το καλάθι μου
        </h3>

        <button
          className="p-1 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close Cart Sidebar"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Order Items */}
      <div
        className="flex-1 space-y-4 overflow-y-auto"
        style={{ maxHeight: "calc(100% - 80px)" }}
      >
        {orderItems.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">Το καλάθι είναι άδειο.</p>
        ) : (
          orderItems.map((item, index) => {
            const ingredientKey = (item.selectedIngredients || [])
              .map((ing) => ing.id)
              .sort((a, b) => a - b)
              .join("-");

            const key = `${item.productId}-${ingredientKey || "no-ingredients"}-${index}`;

            return (
              <div
                key={key}
                onClick={() => {
                  setEditableOrderItem(item);
                  setQuantity(item.quantity);
                }}
                className="bg-white rounded-md shadow hover:shadow-lg transition p-4 cursor-pointer flex flex-col gap-2 border-l-4 border-yellow-400"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">Ποσότητα: {item.quantity}</p>

                    {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                      <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                        {item.selectedIngredients.map((ing: Ingredient) => (
                          <li key={ing.id}>{ing.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2">

                    {/* Edit Button */}
                    <button
                      className="flex items-center gap-1 px-2 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-yellow-400 hover:text-gray-800 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item);
                      }}
                      className="flex items-center gap-1 px-2 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-red-500 hover:text-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Total and Checkout */}
      {orderItems.length > 0 && user?.email !== "kopotitore@gmail.com" && (
        <div className="mt-4 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            Πλήρωμή €{total.toFixed(2)}
          </button>
        </div>
      )}

      {orderItems.length === 0 && user?.email !== "kopotitore@gmail.com" && (
        <div className="mt-4 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <Link href="/menu" className="block w-full">
            <button
              className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base font-bold rounded-lg hover:bg-yellow-500 transition"
            >
              Δες το Μενού
            </button>
          </Link>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-opacity-50 z-60 flex justify-center items-center">
          <div className="bg-gray-100 shadow-lg w-full h-full max-w-md max-h-full flex flex-col">
            
            {/* Modal Header */}
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-gray-300 pb-2 px-6 pt-6">
              Επιβεβαίωση Πληρωμής
            </h2>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {user?.address && (
                <p className="mb-4 text-gray-700">Διεύθυνση: {user.address}</p>
              )}

              <ul className="space-y-2">
                {orderItems.map((item, index) => (
                  <li
                    key={`${item.productId}-${index}`}
                    className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-800">
                      {item.quantity} x {item.name}
                    </span>
                    <span className="font-semibold text-gray-900">€{item.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons at the bottom */}
            <div className="px-6 pb-6 border-gray-300 mt-auto">
              <p className="mt-4 font-bold text-gray-900 text-lg">
                Σύνολο: €{total.toFixed(2)}
              </p>
              <button
                className="w-full bg-yellow-400 text-gray-800 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition mt-2 shadow-sm"
                onClick={handlePayment}
              >
                Επιβεβαίωση Πληρωμής
              </button>
              <button
                className="mt-2 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition shadow-sm"
                onClick={() => setShowPaymentModal(false)}
              >
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
