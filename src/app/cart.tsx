// components/OrderSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import React from "react";

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
      className={`w-full md:w-64 bg-gray-100 p-4 border-l transition-all duration-300 
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} 
        fixed right-0 top-[55px] z-50`}
      style={{ height: `calc(100vh - 55px)` }} // dynamic height
    >
      {/* Button aligned to the right */}
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-gray-900 text-white rounded"
          onClick={() => setIsSidebarOpen(false)}
        >
          Close Sidebar
        </button>
      </div>

      <h3 className="font-bold text-lg mb-4">Καλάθι Παραγγελιών</h3>

      {/* Order Items */}
      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 80px)" }}>
        {orderItems.length === 0 ? (
          <p className="text-gray-500">Το καλάθι είναι άδειο.</p>
        ) : (
          orderItems.map((item, index) => {
            const ingredientKey = (item.selectedIngredients || [])
              .map((ing) => ing.id)
              .sort((a, b) => a - b)
              .join('-');

            const key = `${item.productId}-${ingredientKey || 'no-ingredients'}-${index}`;

            return (
              <div
                key={key}
                onClick={() => {
                  setEditableOrderItem(item);
                  setQuantity(item.quantity);
                }} // 👈 opens the modal
                className="border p-2 rounded flex flex-col gap-2 cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">Ποσότητα: {item.quantity}</p>

                    {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                      <ul className="text-xs text-gray-500 list-disc list-inside">
                        {item.selectedIngredients.map((ing: Ingredient) => (
                          <li key={ing.id}>{ing.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ prevent parent onClick
                      removeItem(item);
                    }}
                    className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Total and Checkout */}
      {orderItems.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <p className="font-bold mb-2">Σύνολο: ${total.toFixed(2)}</p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mt-4"
          >
            Πλήρωμή
          </button>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-center items-center h-full">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
            <p className="mb-2">{user?.address}</p>
            <ul className="mb-4">
              {orderItems.map((item, index) => (
                <li key={`${item.productId}-${index}`}>
                  {item.quantity} x {item.name} - €{item.price}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-bold">Total: €{total}</p>
            <button
              className="mt-4 bg-green-500 px-4 py-2 rounded w-full"
              onClick={handlePayment}
            >
              Confirm Payment
            </button>
            <button
              className="mt-2 bg-gray-300 px-4 py-2 rounded w-full"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
