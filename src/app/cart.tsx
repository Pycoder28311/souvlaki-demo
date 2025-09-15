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

  useEffect(() => {
    setHydrated(true); // ✅ mark client as ready
  }, []);

  if (!hydrated) {
    // Render nothing (or a skeleton) until client + localStorage are ready
    return null;
  }

  return (
    <div
      className={`w-64 bg-gray-100 p-4 border-l transition-all duration-300 ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      } fixed right-0 top-[55px] z-50`}
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
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Πλήρωμή
          </button>
        </div>
      )}
    </div>
  );
}
