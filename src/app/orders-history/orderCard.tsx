"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Order, Product, Ingredient } from "../types";

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
};

interface ProductMap {
  [key: number]: Product;
}

interface Props {
  order: Order;
  products: ProductMap;
  addToCart: (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[],
    selectedOptions: Option[],
    options: Option[]
  ) => void;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function OrderCard({ order, products, addToCart, setOrders }: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [currentRange, setCurrentRange] = useState<string>(order.deliveryTime);

  useEffect(() => {
    if (!order.deliveryTime || !order.createdAt) return;

    const parts = order.deliveryTime.split("-").map((v) => parseInt(v, 10));
    const maxTime = parts[1] || parts[0];

    const startTime = new Date(order.createdAt).getTime();
    const endTime = startTime + maxTime * 60 * 1000;

    const update = () => {
      const now = Date.now();
      const diffMs = endTime - now;

      if (diffMs <= 0) {
        setCurrentRange("Έτοιμο");
        return;
      }

      const elapsedMinutes = ((now - startTime) / 1000 / 60);

      // Υπολογισμός τρέχον range κάθε 5 λεπτά
      const step = 5; // λεπτά
      const minutesRange = maxTime - elapsedMinutes
      const lower = Math.floor(minutesRange / step) * step; // Math.floor(18.45 / 5) = 3 -> 3*5 = 15
      const upper = lower + step;

      setCurrentRange(`${lower}-${upper}`);
    };

    update();
    const timer = setInterval(update, 1000); // κάθε δευτερόλεπτο
    return () => clearInterval(timer);
  }, [order.deliveryTime, order.createdAt]);

  const handleCancel = async () => {
    try {
      const res = await fetch("/api/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id }),
      });
      if (!res.ok) throw new Error("Failed to cancel order");

      setOrders((prev: Order[]) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmCancel(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-yellow-400 px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <p className="text-gray-700">
          <strong>Σύνολο:</strong> {order.total}€
        </p>

        <p className="text-gray-500 text-sm">
          <strong>Δημιουργήθηκε:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>

        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            order.status === "completed"
                ? "bg-green-500 text-white"
                : order.status === "pending"
                ? "bg-yellow-500 text-white"
                : order.status === "rejected"
                ? "bg-red-600 text-white"
                : order.status === "cancelled"
                ? "bg-gray-400 text-white"
                : order.status === "requested"
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-white"
            }`}
            >
            {order.status === "completed"
                ? "Ολοκληρώθηκε"
                : order.status === "pending"
                ? "Σε εκκρεμότητα"
                : order.status === "rejected"
                ? "Απορρίφθηκε"
                : order.status === "cancelled"
                ? "Ακυρώθηκε"
                : order.status === "requested"
                ? "Αιτήθηκε"
                : "Άγνωστο"}
        </span>
      </div>

      {order.deliveryTime && order.status === "pending" && (
        <div className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold">
          Παράδοση σε: <span className="text-blue-600">{currentRange} {currentRange !== "Έτοιμο" && "λεπτά"}</span>
        </div>
      )}

      {/* Details */}
      <div className="p-4 space-y-3 bg-gray-100">
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li
              key={`${item.productId}-${index}`}
              className="flex flex-col sm:flex-row-reverse items-stretch bg-white shadow-sm rounded-xl mt-4 overflow-hidden"
            >
              {/* Product Image */}
              {item.imageId ? (
                <div className="w-full sm:w-56 sm:h-auto relative flex-shrink-0">
                  <Image
                    src={`/api/images/${item.imageId}`}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    className="rounded-t-xl sm:rounded-r-xl sm:rounded-tl-none h-full"
                  />
                </div>
              ) : (
                <div className="w-full sm:w-40 sm:h-auto bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-lg sm:rounded-r-lg sm:rounded-tl-none">
                  Χωρίς Εικόνα
                </div>
              )}

              {/* Order Details */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h3>

                  {/* Ingredients */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.selectedIngredients?.map((ing) => (
                      <span
                        key={ing.id}
                        className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                      >
                        {ing.name}
                      </span>
                    ))}
                    {item.selectedOptions?.map((opt) => (
                      <span
                        key={opt.id}
                        className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                      >
                        {opt.comment}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Repeat Order Button */}
                <button
                  className="mt-4 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  onClick={() => {
                    const product = products[item.productId];
                    if (!product) return;

                    addToCart(
                      product,
                      item.selectedIngredients || [],
                      item.selectedIngCategories || [],
                      item.selectedOptions || [],
                      item.options || []
                    );
                  }}
                >
                  Παράγγειλε ξανά
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Cancel Button */}
      {order.status === "pending" && (
        <div className="px-4 py-2 bg-gray-100">
          {!confirmCancel ? (
            <button
              onClick={() => setConfirmCancel(true)}
              className="mt-2 w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
            >
              Ακύρωση
            </button>
          ) : (
            <div className="space-y-2 mt-2 border border-red-400 rounded-lg p-3 bg-red-50">
              <span className="text-xl">
                Είστε σίγουροι ότι θέλετε να ακυρώσετε την παραγγελία;
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="w-1/2 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm transition"
                >
                  Ναι
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="w-1/2 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-lg text-sm transition"
                >
                  Όχι
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
