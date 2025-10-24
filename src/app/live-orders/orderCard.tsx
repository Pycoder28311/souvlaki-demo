// components/OrderCard.tsx
"use client";

import { useState, useEffect } from "react";
import React from "react";

type Ingredient = {
  id: number;
  name: string;
  price: number;
  ingredient: {
    id: number;
    name: string;
    price: number;
  };
};

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
};

type OrderItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageId: number | null;
  ingredients: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
  selectedOptions: Option[];
  options?: Option[];
  product: Product;
};

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  user: User;
  paid: boolean;
  deliveryTime: string;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
};

type ImageType = {
  id: number;
  data: Uint8Array;
  createdAt: Date;
}

type Product = {
  id: number
  name: string
  price: number
  offer: boolean
  offerPrice?: number;
  description: string;
  image?: ImageType | null
  imageId?: number | null; 
  ingCategories?: IngCategory[];
  options?: Option[];
}

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address: string;
};

interface Props {
  order: Order;
}

const OrderCard: React.FC<Props> = ({ order }) => {
  const [confirmReject, setConfirmReject] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(""); // input value
  const [successMap, setSuccessMap] = useState(false);
  const [currentRange, setCurrentRange] = useState<string>(order.deliveryTime);
  const [deliveryTimeEdit, setDeliveryTimeEdit] = useState(""); 

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

  return (
    <div className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden">
      {/* Order Header */}
      <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
        <p className="font-semibold text-gray-900">Παραγγελία #{order.id}</p>
        {currentRange !== "Έτοιμο" ? (
        <span
          className={`px-3 py-1 font-medium rounded-full ${
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
            {order.deliveryTime && order.status === "pending" && (
                <>
                    <span> </span>{currentRange}
                </>
            )}
        </span>
        ) : (
            <span className="px-3 py-1 font-medium rounded-full bg-yellow-500 text-white">
            {order.deliveryTime && order.status === "pending" && (
                <span>{currentRange} </span>
            )}
            </span>
        )}

        <select
          value={deliveryTimeEdit}
          onChange={async (e) => {
            const time = e.target.value;
            setDeliveryTimeEdit(time);

            if (!time) return;

            try {
              const res = await fetch("/api/update-delivery-time", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: order.id,       // the current order id
                  deliveryTimeEdit: time, // the selected time
                  currentRange: currentRange,
                  deliveryTime: order.deliveryTime,
                }),
              });

              if (!res.ok) throw new Error("Failed to accept order");
            } catch (err) {
              console.error(err);
            }
          }}
          className="w-20 border border-gray-300 rounded-md p-2 mb-3 focus:outline-yellow-400 bg-white text-gray-800"
        >
          <option value="">Επιλέξτε χρόνο καθυστέρησης</option>
          <option value="20">20 λεπτά</option>
          <option value="25">25 λεπτά</option>
          <option value="30">30 λεπτά</option>
          <option value="35">35 λεπτά</option>
          <option value="40">40 λεπτά</option>
          <option value="45">45 λεπτά</option>
          <option value="50">50 λεπτά</option>
          <option value="55">55 λεπτά</option>
        </select>

        <div
          className={`px-3 py-1 rounded-full text-white ${
            order?.paid ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {order?.paid ? "Πληρωμή Online" : "Πληρωμή Κατά την Παραλαβή"}
        </div>
      </div>

      {order.status === "requested" && (
        <>
        {!confirmReject ? (
            <div className="flex gap-2 mt-3 p-4">
            <button
                onClick={() => setDeliveryModalOpen(!deliveryModalOpen)}
                className="w-1/2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
            >
                Αποδοχή
            </button>
            <button
                onClick={() => {setConfirmReject(true); setDeliveryModalOpen(false)}}
                className="w-1/2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
            >
                Απόρριψη
            </button>
            </div>
        ) : (
            <div className="mt-2 flex items-bottom space-y-0 justify-between p-4">
            <strong className="text-lg text-gray-700">Είστε σίγουροι;</strong>
            <div className="flex gap-2">
                <button
                onClick={async () => {
                    try {
                    const res = await fetch("/api/reject-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: order.id }),
                    });

                    if (!res.ok) throw new Error("Failed to reject order");
                    } catch (err) {
                    console.error(err);
                    }
                }}
                className="px-3 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition"
                >
                Ναι
                </button>
                <button
                onClick={() => setConfirmReject(false)}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded-md text-sm transition"
                >
                Όχι
                </button>
            </div>
            </div>
        )}
        </>
      )}

    {deliveryModalOpen && (
        <div className={`
        z-60 flex items-center justify-center
        `}>
        <div className="p-4 w-full">
            <h3 className="text-gray-800 font-semibold mb-2">Χρόνος παράδοσης</h3>
            <select
            value={deliveryTime}
            onChange={async (e) => {
                const time = e.target.value;
                setDeliveryTime(time);

                if (!time) return;

                try {
                const res = await fetch("/api/accept-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    id: order.id,       // the current order id
                    deliveryTime: time, // the selected time
                    }),
                });

                if (!res.ok) throw new Error("Failed to accept order");

                setSuccessMap(true);
                alert("Η παραγγελία έγινε δεκτή με επιτυχία!");

                // Hide tick after 2 seconds
                setTimeout(() => {
                    setSuccessMap(false);
                }, 2000);
                } catch (err) {
                console.error(err);
                }
            }}
            className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-yellow-400"
            >
                <option value="">Επιλέξτε χρόνο παράδοσης</option>
                <option value="20-25">20-25 λεπτά</option>
                <option value="25-30">25-30 λεπτά</option>
                <option value="30-35">30-35 λεπτά</option>
                <option value="35-40">35-40 λεπτά</option>
                <option value="40-45">40-45 λεπτά</option>
                <option value="45-50">45-50 λεπτά</option>
                <option value="50-55">50-55 λεπτά</option>
                <option value="55-60">55-60 λεπτά</option>
            </select>
            {successMap && (
                <span className="absolute right-2 top-2 text-green-600 font-bold">✓</span>
            )}
            <div className="flex justify-end space-x-2">
            <button
                onClick={() => setDeliveryModalOpen(false)}
                className="py-1 px-3 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
            >
                Άκυρο
            </button>
            <button
                onClick={async () => {
                try {
                    const res = await fetch("/api/accept-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: order.id, deliveryTime }),
                    });
                    if (!res.ok) throw new Error("Failed to accept order");
                    setDeliveryModalOpen(false);
                    setDeliveryTime("");
                } catch (err) {
                    console.error(err);
                }
                }}
                className="py-1 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
            >
                Αποδοχή
            </button>
            </div>
        </div>
        </div>
    )}

      {/* Order Details */}
      <div className="p-4 space-y-3">
        <p className="text-gray-700">
          <strong>Όνομα:</strong> {order.user.name}
        </p>
        <p className="text-gray-700">
          <strong>Διεύθυνση:</strong> {order.user.address}
        </p>
        <p className="text-gray-700">
          <strong>Δημιουργήθηκε: </strong>{" "}
          {new Date(order.createdAt).toLocaleString("el-GR", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>

        {/* Items */}
        <ul className="space-y-3">
          {order.items.map((item) => {
            const optionsTotal = item.selectedOptions.reduce(
              (acc, opt) => acc + Number(opt.price || 0),
              0
            );
            const ingredientsTotal = item.ingredients.reduce(
              (acc, ing) => acc + Number(ing.price || 0),
              0
            );

            const itemTotal =
              (Number(item.price) - (optionsTotal + ingredientsTotal)) *
              item.quantity;

            return (
              <li
                key={item.id}
                className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {item.quantity} × {item.product.name}
                  </span>
                  <span className="text-gray-700">{itemTotal.toFixed(2)}€</span>
                </div>

                {item.ingredients.length > 0 && (
                  <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                    {item.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.ingredient.name}{" "}
                        {ing.price ? `(${Number(ing.price).toFixed(2)}€)` : ""}
                      </li>
                    ))}
                  </ul>
                )}

                {item.selectedOptions.length > 0 && (
                  <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                    {item.selectedOptions.map((opt) => (
                      <li key={opt.id}>
                        {opt.comment}{" "}
                        {opt.price ? `(${Number(opt.price).toFixed(2)}€)` : ""}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="mt-2">Σύνολο:</span> {Number(item.price).toFixed(2)}€
              </li>
            );
          })}
        </ul>

        <div className="flex w-full justify-between">
            <p className="text-gray-700 text-xl">
            <strong>Σύνολο:</strong> {Number(order.total).toFixed(2)}€
            </p>
            {order.deliveryTime && order.status === "pending" && currentRange === "Έτοιμο" && (
            <span
                className="px-3 py-1 font-medium rounded-full bg-green-500 text-white cursor-pointer"
                onClick={async () => {
                    try {
                    const res = await fetch("/api/complete-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: order.id }),
                    });

                    if (!res.ok) throw new Error("Failed to update order");

                    // Optionally update UI state locally
                    alert("Η παράδοση επιβεβαιώθηκε!");
                    // If using state, update order.status to re-render
                    // setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: 'completed'} : o))
                    } catch (err) {
                    console.error(err);
                    alert("Κάτι πήγε στραβά. Προσπάθησε ξανά.");
                    }
                }}
                >
                <span>Επιβεβαίωση παράδοσης</span>
            </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
