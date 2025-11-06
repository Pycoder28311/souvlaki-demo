import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { User, OrderItem, Option } from "../../../types"; // adjust imports as needed
import {
  handleCheckHours,
} from "../../functions/cart";
import { useCart } from "../../cartContext";

type Availability = {
  available: boolean;
  unavailableReason?: string;
};

interface CartBodyProps {
  setEditableOrderItem: (item: OrderItem | null) => void;
  expandedItems: Record<number, boolean>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  availabilityMap: Record<string, Availability>;
  setAvailabilityMap: React.Dispatch<React.SetStateAction<Record<string, Availability>>>;
  setShowPaymentModal: (val: boolean) => void;
  setPaymentWayModal: (val: boolean) => void;
  total: number;
  user: User | null;
  getUnavailableMessage: (reason?: string) => string;
}

const CartBody: React.FC<CartBodyProps> = ({
  setEditableOrderItem,
  expandedItems,
  setExpandedItems,
  availabilityMap,
  setAvailabilityMap,
  setShowPaymentModal,
  setPaymentWayModal,
  total,
  getUnavailableMessage,
}) => {
  const { orderItems, removeItem, setQuantity, isSidebarOpen, setIsSidebarOpen, user } = useCart();
  if (!isSidebarOpen) return null;

  return (
    <div className="flex flex-col h-full w-full sm:w-80 bg-gray-50 p-4">
      {/* Header */}
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
            const isAvailable = availabilityMap[item.productId.toString()]?.available ?? true;
            const reason = availabilityMap[item.productId.toString()]?.unavailableReason;

            return (
              <div
                key={key}
                onClick={() => {
                  if (!isAvailable) return;
                  setEditableOrderItem(item);
                  setQuantity(item.quantity);
                }}
                className={`bg-white rounded-xl shadow hover:shadow-lg transition p-2 flex flex-col gap-2 border-l-4 border-yellow-400
                  ${!isAvailable ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer hover:shadow-lg"}`}
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
                      <button className="p-2 bg-gray-300 text-gray-800 font-bold rounded-lg transition hover:bg-gray-400 hover:scale-105">
                        <Edit2 className="w-4 h-4" />
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

                    {!isAvailable && (
                      <span className="text-red-500 text-sm">{getUnavailableMessage(reason)}</span>
                    )}

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
        <div className="mb-14 sm:mb-0 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <button
            onClick={() =>
              handleCheckHours(orderItems, availabilityMap, setAvailabilityMap, setShowPaymentModal, setPaymentWayModal)
            }
            className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-xl rounded-xl font-semibold hover:bg-yellow-500 transition"
          >
            Πλήρωμή {total.toFixed(2)}€
          </button>
        </div>
      )}

      {orderItems.length === 0 && !user?.business && (
        <div className="mb-14 sm:mb-0 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <Link href="/menu" className="block w-full">
            <button className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-xl font-bold rounded-lg hover:bg-yellow-500 transition">
              Δες το Μενού
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartBody;
