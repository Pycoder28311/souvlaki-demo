// components/OrderCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import { Order } from "../types"; 

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
  
  const distance = order.user.distanceToDestination ?? 0; // σε km
  const deliverySpeedKmPerMin = 30 / 60; // 30 km/h σε λεπτά ανά km
  const travelTime = distance / deliverySpeedKmPerMin + 10; // +10 λεπτά προετοιμασίας

  const roundTo5 = (num: number) => Math.ceil(num / 5) * 5;
  const lower = roundTo5(travelTime);
  const upper = lower + 5;

  // Δημιουργία επιλογών από το πιθανότερο μέχρι 60 λεπτά
  const options: string[] = [];
  for (let t = lower - 5; t <= 70; t += 5) {
    options.push(`${t}-${t + 5}`);
  }

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

  const [showSelect, setShowSelect] = useState(false);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const time = e.target.value;
    setDeliveryTimeEdit(time);
    setShowSelect(false); // hide after selecting

    if (!time) return;

    try {
      const res = await fetch("/api/update-delivery-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          deliveryTimeEdit: time,
          currentRange,
          deliveryTime: order.deliveryTime,
        }),
      });

      if (!res.ok) throw new Error("Failed to update delivery time");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showSelect && selectRef.current) {
      selectRef.current.focus();
      selectRef.current.size = 8; // opens it visually like a dropdown list
    } else if (selectRef.current) {
      selectRef.current.size = 0;
    }
  }, [showSelect]);

  // Optional: close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowSelect(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden">
      {/* Order Header */}
      <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
        <p className="font-semibold text-gray-900">Παραγγελία #{order.id}</p>
        {currentRange !== "Έτοιμη" ? (
          <>
            <span
              className={`px-3 py-1 font-medium rounded-lg ${
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
                ? "Ολοκληρώθηκε "
                : order.status === "pending"
                ? "Σε εκκρεμότητα "
                : order.status === "rejected"
                ? "Απορρίφθηκε "
                : order.status === "cancelled"
                ? "Ακυρώθηκε "
                : order.status === "requested"
                ? "Αιτήθηκε "
                : "Άγνωστο "}
                {order.status === "pending" && (
                  <div className="relative inline-block">
                    <span
                      onClick={() => setShowSelect((prev) => !prev)}
                      className="cursor-pointer underline"
                    >
                      {" "}
                      {currentRange || "Επιλέξτε λεπτά καθυστέρηση"}
                    </span>

                    {showSelect && (
                      <select
                        ref={selectRef}
                        value={deliveryTimeEdit}
                        onChange={handleSelectChange}
                        className="absolute right-0 top-4 mt-1 w-auto border border-gray-300 rounded-md p-2 bg-white text-gray-800 z-10"
                        onBlur={() => setShowSelect(false)}
                        autoFocus
                      >
                        <option value="">Επιλέξτε χρόνο καθυστέρησης</option>
                        {[5, 10, 15, 20, 25, 30, 35, 40, 45].map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
            </span>
          </>
        ) : (
            <span className="px-3 py-1 font-medium rounded-lg bg-green-500 text-white cursor-pointer">
              {order.deliveryTime && order.status === "pending" && (
                <span
                  onClick={async () => {
                    const confirmed = window.confirm("Είσαι σίγουρος ότι η παραγγελία είναι έτοιμη;");

                    if (!confirmed) return; // stop if the user cancels

                    try {
                      const res = await fetch("/api/complete-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: order.id }),
                      });

                      if (!res.ok) throw new Error("Failed to update order");

                      alert("Η παράδοση επιβεβαιώθηκε!");
                      // Example: update local UI if needed
                      // setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: 'completed'} : o))
                    } catch (err) {
                      console.error(err);
                      alert("Κάτι πήγε στραβά. Προσπάθησε ξανά.");
                    }
                  }}
                  className="cursor-pointer text-white font-semibold hover:underline"
                >
                  <span>Επιβεβαίωση παράδοσης </span>
                </span>
              )}
            </span>
        )}
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
                <option value={`${lower}-${upper}`}>
                  Προτεινόμενος χρόνος: {lower}-{upper} λεπτά
                </option>

                {/* Υπόλοιπες επιλογές */}
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} λεπτά
                  </option>
                ))}
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
          <strong>Όροφος:</strong> {order.user.floor}
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
            const ingredientsTotal = item.ingredients?.reduce(
              (acc, ing) => acc + Number(ing.price || 0),
              0
            ) || 0;

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
                    {item.quantity} × {item.product?.name}
                  </span>
                  <span className="text-gray-700">{itemTotal.toFixed(2)}€</span>
                </div>

                {item.ingredients && item.ingredients.length > 0 && (
                  <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                    {item.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.ingredient?.name}{" "}
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
          <div
            className={`inline-block px-2 py-1 rounded-lg text-md font-medium text-white ${
              order?.paid
                ? "bg-green-500 shadow-md hover:bg-green-600"
                : "bg-gray-400 text-gray-900 shadow-inner hover:bg-gray-500"
            } transition-colors duration-200`}
          >
            {order?.paid ? "Πληρωμή Online" : "Κατά την Παραλαβή"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
