"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Trash2, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { User, OrderItem, Option } from "../../../types"; // adjust imports as needed
import { useCart } from "../../cartContext";
import { checkObjectIntervals } from "../../../utils/checkObjectIntervals";

interface CartBodyProps {
  setEditableOrderItem: (item: OrderItem | null) => void;
  expandedItems: Record<number, boolean>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  total: number;
  user: User | null;
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartBody: React.FC<CartBodyProps> = ({
  setEditableOrderItem,
  expandedItems,
  setExpandedItems,
  total,
  setShowPaymentModal,
}) => {
  const { orderItems, removeItem, setQuantity, isSidebarOpen, setIsSidebarOpen, user } = useCart();
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  if (!isSidebarOpen) return null;

  return (
    <div className="flex flex-col h-full w-full sm:w-80 bg-gray-50 p-4"
      style={{
        height: `calc(100vh)`,
      }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-400 pb-3">
        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-7 h-7" /> Το καλάθι μου
        </h3>
        <button
          className="p-1 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close Cart Sidebar"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* Order Items */}
      <div className="flex-1 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 80px)" }}>
        {orderItems.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">Το καλάθι είναι άδειο.</p>
        ) : (
          orderItems.map((item, index) => {
            const ingredientKey = (item.selectedIngredients || [])
              .map((ing: { id: number }) => ing.id)
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
                className={`bg-white rounded-xl shadow hover:shadow-lg transition p-2 flex flex-col gap-2 border-l-4 border-yellow-400
                  cursor-pointer hover:shadow-lg}`}
              >
                <div className="flex justify-between items-start">
                  <div className="w-40">
                    <div className="flex flex-col gap-1 p-1">
                      <h4 className="font-bold text-gray-800">
                        {item.quantity} x {item.name}
                      </h4>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <span className="text-yellow-500 font-semibold px-3 py-1">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                      <button className="p-2 bg-gray-300 text-gray-800 font-bold rounded-lg transition hover:bg-gray-400">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item);
                        }}
                        className="p-2 bg-gray-300 text-gray-800 font-bold rounded-lg transition hover:bg-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {((item.selectedIngredients && item.selectedIngredients.length > 0) ||
                      (item.selectedOptions && item.selectedOptions.length > 0)) && (
                        <div className="mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedItems((prev) => ({
                                ...prev,
                                [item.productId]: !prev[item.productId],
                              }));
                            }}
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                          >
                            {expandedItems[item.productId] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            {expandedItems[item.productId]
                              ? "Απόκρυψη Υλικών"
                              : "Προβολή Υλικών"}
                          </button>
                        </div>
                      )}
                  </div>

                  {item.imageId && (
                    <div className="w-22 h-22 relative overflow-hidden shadow-sm rounded-lg">
                      <Image
                        src={`/api/images/${item.imageId}`}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                      />
                    </div>
                  )}
                </div>

                {expandedItems[item.productId] &&
                  ((item.selectedIngredients && item.selectedIngredients.length > 0) ||
                    (item.selectedOptions && item.selectedOptions.length > 0)) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.selectedIngredients?.map((ing) => (
                        <span
                          key={ing.id}
                          className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                        >
                          {ing.name}
                        </span>
                      ))}
                      {item.selectedOptions?.map((opt: Option) => (
                        <span
                          key={opt.id}
                          className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                        >
                          {opt.comment}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            );
          })
        )}
      </div>

      {/* Total and Checkout */}
      {orderItems.length > 0 && !user?.business && (
        <div className="fixed bottom-4 left-0 right-0">
          {availabilityMessage && (
            <div className="my-2 text-red-600 text-start font-semibold px-6">
              {availabilityMessage}
            </div>
          )}
          <div className="px-4">
            <div className="border-t border-gray-400 pt-4">
              <button
                onClick={() => {

                  const unavailableItem = orderItems.find(
                    (item) => !checkObjectIntervals(item.intervals || {})
                  );

                  if (unavailableItem) {
                    setAvailabilityMessage(
                      `Το προϊόν "${unavailableItem.name}" δεν είναι διαθέσιμο αυτή τη στιγμή.`
                    );
                    return;
                  }
                  setShowPaymentModal(true);
                }}
                className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-xl rounded-xl font-semibold hover:bg-yellow-500 transition"
              >
                Πλήρωμή {total.toFixed(2)}€
              </button>
            </div>
          </div>
        </div>
      )}

      {orderItems.length === 0 && !user?.business && (
        <div className="fixed bottom-4 left-0 right-0">
          <div className="px-4">
            <div className="border-t border-gray-400 pt-4">
              <Link href="/menu" className="block w-full">
                <button className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-xl font-bold rounded-lg hover:bg-yellow-500 transition">
                  Δες το Μενού
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartBody;
