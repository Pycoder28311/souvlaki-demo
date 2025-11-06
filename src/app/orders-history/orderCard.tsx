"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, Ingredient, User } from "../types";
import { useCart } from "../wrappers/cartContext";

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
};

export interface IngCategory {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
  onlyOne?: boolean;
}

interface ProductMap {
  [key: number]: Product;
}

type OrderItem = {
  id?: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageId: number | null;
  ingredients?: Ingredient[];
  selectedIngredients: Ingredient[];
  selectedIngCategories?: IngCategory[];
  selectedOptions: Option[];
  options?: Option[];
  product?: Product;
  availability?: {
    category: {
      openHour: string;    // e.g. "09:00"
      closeHour: string;   // e.g. "22:00"
      alwaysClosed: boolean;
    };
    product: {
      openHour: string;
      closeHour: string;
      alwaysClosed: boolean;
    };
  };
}

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  user: User;
  paid: boolean;
  paidIn?: string;
  deliveryTime: string;
  payment_intent_id?: string;
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
  const [notification, setNotification] = useState<string | null>(null);
  const { shopOpen } =useCart();

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
        setCurrentRange("Έτοιμη");
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
      const res = await fetch("/api/refund-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, amount: order.total, status: "cancelled" }),
      });
      
      if (!res.ok) throw new Error("Η ακύρωση απέτυχε.");
      
      setOrders((prev: Order[]) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o))
      );
      if (order.payment_intent_id) {
        setNotification(
          `Η παραγγελία #${order.id} ακυρώθηκε με επιτυχία. Τα χρήματά σας θα επιστραφούν εντός λίγων λεπτών.`
        );
      } else {
        setNotification(`Η παραγγελία #${order.id} ακυρώθηκε με επιτυχία.`);
      }
      setTimeout(() => setNotification(null), 5000); // εξαφανίζεται μετά από 5 δευτερόλεπτα

    } catch (err) {
      console.error(err);
      setNotification("Κάτι πήγε στραβά κατά την ακύρωση.");
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="mb-6 rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden">
      {notification && (
        <div>
          {notification}
        </div>
      )}
      {/* Header */}
      <div className="bg-yellow-400 px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <p className="text-gray-700">
          <strong>Σύνολο:</strong> {Number(order.total).toFixed(2)}€
        </p>

        <span
          className={`px-3 py-1 text-sm font-medium rounded-lg ${
            order.status === "completed"
                ? "bg-green-500 text-white"
                : order.status === "pending"
                ? "bg-yellow-500 text-white"
                : order.status === "rejected"
                ? "bg-red-600 text-white"
                : order.status === "cancelled"
                ? "bg-gray-400 text-white"
                : order.status === "requested"
                ? "bg-yellow-500 text-white"
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

      <div className="mb-4 p-4 bg-white space-y-3">
        {/* Delivery Time */}
        <div className="flex justify-between">
          {order.deliveryTime && order.status === "pending" && (
            <p className="text-gray-700 text-lg font-semibold">
              {currentRange !== "Έτοιμη" ? "Παράδοση σε:" : "Η παραγγελία είναι"} <span className="text-blue-600">{currentRange} {currentRange !== "Έτοιμη" && "λεπτά"}</span>
            </p>
          )}

          {/* Created At */}
          <p className="text-gray-500 text-lg">
            <strong>Δημιουργήθηκε:</strong>{" "}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Cancel Button */}
        {((order.status === "pending" && currentRange !== "Έτοιμη") || order.status === "requested") && (
          <div>
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="mt-2 w-full py-1.5 bg-gray-300 hover:bg-gray-400 text-white rounded-lg text-md transition"
              >
                Ακύρωση
              </button>
            ) : (
              <div className="space-y-2 mt-2 border border-red-400 rounded-lg p-3 bg-red-50">
                <span className="text-gray-800 font-semibold text-sm">
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

      {/* Details */}
      <div className="px-4 pb-4 space-y-3">
        <ul className="space-y-2">
          {order.items.map((item, index) => {
            const timeToMinutes = (timeStr: string) => {
              const [hours, minutes] = timeStr.split(":").map(Number);
              return hours * 60 + minutes;
            };
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const categoryAvailable =
              item?.availability?.category &&
              !item.availability.category.alwaysClosed &&
              currentMinutes >= timeToMinutes(item.availability.category.openHour) &&
              currentMinutes <= timeToMinutes(item.availability.category.closeHour);

            const productAvailable =
              item?.availability?.product &&
              !item.availability.product.alwaysClosed &&
              currentMinutes >= timeToMinutes(item.availability.product.openHour) &&
              currentMinutes <= timeToMinutes(item.availability.product.closeHour);

            const isAvailable = categoryAvailable && productAvailable;

            return(
              <li
                key={`${item.productId}-${index}`}
                className={`flex flex-col sm:flex-row-reverse items-stretch bg-white shadow-sm rounded-xl mt-4 overflow-hidden ${isAvailable ? 'hover:-translate-y-2 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
              >
                {/* Product Image */}
                {item.imageId && (
                  <div className="w-full sm:w-56 sm:h-auto relative flex-shrink-0">
                    <Image
                      src={`/api/images/${item.imageId}`}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover", objectPosition: "top" }}
                      className="rounded-t-xl sm:rounded-r-xl sm:rounded-tl-none h-full"
                    />
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
                      if (!isAvailable || !shopOpen || !product) return;

                      addToCart(
                        product,
                        item.selectedIngredients || [],
                        item.selectedIngCategories || [],
                        item.selectedOptions || [],
                        item.options || []
                      );
                    }}
                  >
                    {shopOpen
                      ? isAvailable
                        ? "Παράγγειλε ξανά"
                        : "Μη διαθέσιμο"
                      : "Το κατάστημα είναι κλειστό"}
                  </button>
                </div>
              </li>
            )})}
        </ul>
      </div>
    </div>
  );
}
