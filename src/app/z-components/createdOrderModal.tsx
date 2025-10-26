"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "../types"; 
import { OrderItem } from "../types";

export default function CreatedOrderModal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmReject, setConfirmReject] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState(""); // input value
  const [successMap, setSuccessMap] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
      const evtSource = new EventSource("/api/read-requested-orders");
  
      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setOrders(data);
      };
  
      return () => {
        evtSource.close();
      };
  }, []);

  if (!orders.length) return null;

  return (
    <div className="fixed top-30 right-4 z-50 flex flex-col space-y-3 overflow-y-auto max-h-[80vh] w-full pb-4"
    style={{
        scrollbarWidth: "none", // Firefox
    }}    
    >
      {orders.map((order) => (
        <div className="w-full flex justify-end" key={order.id}>
          <div
              className="relative bg-white shadow-md rounded-xl p-3 border border-gray-200 w-72 transition"
          >
            {order.status === "cancelled" && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/mark-seen-rejected", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: order.id }),
                    });

                    if (!res.ok) throw new Error("Failed to mark as seen");

                    // Optionally remove from local state
                    setOrders((prev) => prev.filter((o) => o.id !== order.id));

                    alert("Η παραγγελία επισημάνθηκε ως απορριφθείσα!");
                  } catch (err) {
                    console.error(err);
                    alert("Κάτι πήγε στραβά. Προσπάθησε ξανά.");
                  }
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            )}

            <Link key={order.id} href="/live-orders" className="block">

              <div className="flex justify-between items-center">
                {order.status === "cancelled" ? (
                  <p className="text-red-600 font-semibold">Η παραγγελία ακυρώθηκε</p>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-800 text-lg">
                        Νέα παραγγελία
                    </h3>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString("el-GR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="text-sm text-gray-700">
                  <p>
                  <strong>{order.user.name}</strong>
                  </p>
              </div>

              {/* Mini Items list */}
              {order.status !== "cancelled" && (
                <ul className="mt-1 space-y-1 text-sm text-gray-600 list-disc ml-4">
                {order.items.slice(0, 2).map((item: OrderItem) => (
                    <li key={item.id} className="pt-1">
                    {item.quantity}× {item.product?.name} –{" "}
                    <span className="font-medium">{Number(item.price).toFixed(2)}€</span>
                    </li>
                ))}

                {order.items.length > 2 && (
                    <li className="text-gray-500 italic">
                    +{order.items.length - 2} ακόμα
                    </li>
                )}
                </ul>
              )}

              <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-700 truncate max-w-[full]">
                  {order.user.address}
                  </p>
                  <p className="text-right font-semibold text-gray-800">
                  {Number(order.total).toFixed(2)}€
                  </p>
              </div>
            </Link>

            {/* ✅ Κουμπιά αποδοχής / απόρριψης ή επιβεβαίωσης */}
            {order.status !== "cancelled" && (
              <>
                {!confirmReject ? (
                    <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setDeliveryModalOpen((prev) => (prev === order.id ? null : order.id))}
                      className="w-1/2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                    >
                      Αποδοχή
                    </button>
                    <button
                        onClick={() => setConfirmReject(true)}
                        className="w-1/2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
                    >
                        Απόρριψη
                    </button>
                    </div>
                ) : (
                    <div className="mt-2 flex items-bottom space-y-0 justify-between ">
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
                            setOrders((prev) => prev.filter((o) => o.id !== order.id));
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

            {deliveryModalOpen === order.id && (
              <div className={`
                z-60 flex items-center justify-center
                inset-0 fixed md:inset-auto md:absolute md:bottom-2 md:right-full md:mr-2
              `}>
                <div className="bg-white rounded-xl p-4 w-80 shadow-lg">
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

                        // Update order locally
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? { ...o, status: "pending", deliveryTime: time }
                              : o
                          )
                        );

                        setSuccessMap((prev) => ({ ...prev, [order.id]: true }));

                        // Hide tick after 2 seconds
                        setTimeout(() => {
                          setSuccessMap((prev) => ({ ...prev, [order.id]: false }));
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
                  {successMap[order.id] && (
                    <span className="absolute right-2 top-2 text-green-600 font-bold">✓</span>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setDeliveryModalOpen(null)}
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
                          setOrders((prev) => prev.filter((o) => o.id !== order.id));
                          setDeliveryModalOpen(null);
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
          </div>
        </div>
      ))}
    </div>
  );
}
