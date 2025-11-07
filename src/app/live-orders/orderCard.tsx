// components/OrderCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import { Order } from "../types"; 

interface Props {
  order: Order;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  defaultTime: number;
}

const OrderCard: React.FC<Props> = ({ order, setOrders, defaultTime }) => {
  const [confirmReject, setConfirmReject] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(""); // input value
  const [successMap, setSuccessMap] = useState(false);
  const [currentRange, setCurrentRange] = useState<string>(order.deliveryTime);
  const [deliveryTimeEdit, setDeliveryTimeEdit] = useState("");
  
  const distance = order.user.distanceToDestination ?? 0; // σε km
  const deliverySpeedKmPerMin = 30 / 60; // 30 km/h σε λεπτά ανά km
  const travelTime = distance / deliverySpeedKmPerMin + Number(defaultTime ?? 0); // +10 λεπτά προετοιμασίας
  const roundTo5 = (num: number) => Math.ceil(num / 5) * 5;
  const lower = roundTo5(travelTime);
  const upper = lower + 5;

  // Δημιουργία επιλογών από το πιθανότερο μέχρι 60 λεπτά
  const options: string[] = [];
  for (let t = lower - 5; t <= 70; t += 5) {
    if (t >= 0) {
      options.push(`${t}-${t + 5}`);
    }
  }

  const [showSelect, setShowSelect] = useState(false);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const textToPrint = "";

  useEffect(() => {
    if (!order.deliveryTime || !order.acceptedAt) return;

    const parts = order.deliveryTime.split("-").map((v) => parseInt(v, 10));
    const maxTime = parts[1] || parts[0];

    const startTime = new Date(order.acceptedAt).getTime();
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
  }, [order.deliveryTime, order.acceptedAt]);

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

  const handlePrint = (order: Order): Promise<void> => {
    return new Promise((resolve, reject) => {
    if (!printRef.current) return reject();

    const printWindow = window.open("", "", "width=700,height=600");
    if (!printWindow) return reject();
    printWindow.document.write(`
      <html>
      <head>
        <title>Print</title>
        <style>
          @media print {
            @page { margin: 0; }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              white-space: pre-wrap;
              font-size: 10px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              height: 100vh;
            }
            .receipt {
              text-align: center;
              border: 1px solid #000;
              padding: 3px;
              width: 280px;
              line-height: 1;
            }
          }

          body {
            font-family: Arial, sans-serif;
            white-space: pre-wrap;
            font-size: 10px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            height: 100vh;
            margin: 0;
          }

          .receipt {
            text-align: center;
            border: 1px solid #000;
            padding: 3px;
            width: 280px;
            line-height: 1;
          }

          .receipt h2 {
            font-size: 10px;
            margin: 2px 0 4px 0;
          }

          .receipt h3 {
            font-size: 10px;
            margin: 4px 0 2px 0;
          }

          .receipt p {
            margin: 1px 0;
          }

          .logo {
            max-width: 80px;
            margin-bottom: px;
          }

          hr {
            margin: 4px 0;
            border: none;
            border-top: 1px dashed #000;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <img src="${window.location.origin}/favicon.jpg" class="logo" />
          <h2>Απόδειξη Παραγγελίας</h2>

          <p><strong>Αριθμός Παραγγελίας:</strong> ${order.id}</p>
          <p><strong>Ημερομηνίαd:</strong> ${new Date(order.createdAt).toLocaleDateString('el-GR')} ${new Date(order.createdAt).toLocaleTimeString('el-GR')}</p>
          <p><strong>Ώρα Παράδοσης:</strong> ${order.deliveryTime || '-'}</p>
          <p><strong>Κατάσταση:</strong> ${order.status}</p>
          <hr />

          <div style="text-align:left; margin-top:15px;">
            <h3>Πελάτης</h3>
            <p><strong>Όνομα:</strong> ${order.user?.name || '—'}</p>
            <p><strong>Email:</strong> ${order.user?.email || '—'}</p>
            <hr />

            <h3>Περιεχόμενο Παραγγελίας</h3>
            ${order.items
              .map(
                (item, index) => `
                <div style="margin-bottom:10px;">
                  <p><strong>${index + 1}. ${item.product?.name}</strong> (x${item.quantity})</p>
                  <p>Τιμή Μονάδας: €${Number(item.price).toFixed(2)}</p>
                  ${
                    item.selectedIngredients && item.selectedIngredients.length > 0
                      ? `<p>+ Υλικά: ${item.selectedIngredients
                          .map((ing) => ing.name)
                          .join(', ')}</p>`
                      : ''
                  }
                  ${
                    item.selectedOptions && item.selectedOptions.length > 0
                      ? `<p>+ Επιλογές: ${item.selectedOptions
                          .map((opt) => opt.comment)
                          .join(', ')}</p>`
                      : ''
                  }
                </div>
              `
              )
              .join('')}
          </div>

          <hr />
          <p><strong>Σύνολο:</strong> €${Number(order.total).toFixed(2)}</p>
          <p><strong>Πληρωμή:</strong> ${order.paid ? 'Εξοφλημένη' : 'Μη εξοφλημένη'}</p>
          ${order.paid && order.paidIn ? `<p><strong>Τρόπος Πληρωμής:</strong> ${order.paidIn}</p>` : ''}
          <hr />

          <p style="margin-top:20px; text-align:center;">Ευχαριστούμε για την προτίμησή σας!</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Resolve when the user clicks "Print"
    printWindow.onafterprint = () => {
      printWindow.close();
      resolve();
    };

    // Reject if the user closes the window without printing
    const interval = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(interval);
        reject(); // do NOT accept the order
      }
    }, 200);

    setTimeout(() => printWindow.print(), 400);
  });

  };

  const handleAcceptOrder = async (time: string, order: Order) => {
    if (!time) return;

    try {
      await handlePrint(order); // waits for actual printing
    } catch {
      return; // stop execution, don't call API
    }

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

      // Update order locally
      setOrders((prev: Order[]) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "pending", deliveryTime: time } : o
        )
      );

      setSuccessMap(true);

      // Hide tick after 2 seconds
      setTimeout(() => {
        setSuccessMap(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mb-6 rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden">
      {/* Order Header */}
      <div className="bg-yellow-400 px-2 py-2 flex justify-between items-center">
        <p className="font-semibold text-gray-900 px-2 text-lg">Παραγγελία #{order.id}</p>
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
            <span className="px-1 py-1 font-medium rounded-lg bg-green-500 text-white cursor-pointer">
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
            <div className="flex gap-2 mt-3 px-4">
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
                    handleAcceptOrder(deliveryTime, order); 
                    //setOrders((prev) => prev.filter((o) => o.id !== order.id));
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
          <strong>Κουδούνι:</strong> {order.user.bellName}
        </p>

        {order.user.comment && (
          <p className="text-gray-700">
            <strong>Σχόλιο:</strong> {order.user.comment}
          </p>
        )}

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
      </div>

      <div className="flex w-full justify-between p-2">
        <p className="text-gray-700 text-xl px-2">
          <strong>Σύνολο:</strong> {Number(order.total).toFixed(2)}€
        </p>
        <div
          className={`inline-block px-2 py-1 rounded-lg text-md font-medium text-white ${
            order?.paid
              ? "bg-green-500 shadow-md"
              : "bg-gray-400 text-gray-900 shadow-inner"
          } transition-colors duration-200`}
        >
          {order?.paid ? "Πληρωμή Online" : "Κατά την Παραλαβή"}
        </div>
      </div>
      <div ref={printRef} className="hidden">
        {textToPrint}
      </div>
    </div>
  );
};

export default OrderCard;
