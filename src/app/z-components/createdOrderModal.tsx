"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Order } from "../types"; 
import { OrderItem } from "../types";
import { useCart } from "../wrappers/cartContext";
import { Bell } from "lucide-react";

export default function CreatedOrderModal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmReject, setConfirmReject] = useState<number | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState(""); // input value
  const [successMap, setSuccessMap] = useState<{ [key: number]: boolean }>({});
  const printRef = useRef<HTMLDivElement>(null);
  const textToPrint = "";
  const { user } = useCart();
  const [defaultTime, setDefaultTime] = useState(user?.defaultTime ?? 0);

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
  
  useEffect(() => {
      setDefaultTime(user?.defaultTime ?? 0)
      const evtSource = new EventSource("/api/read-requested-orders");
  
      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setOrders(data);
      };
  
      return () => {
        evtSource.close();
      };
  }, []);

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

      setSuccessMap((prev: { [key: number]: boolean }) => ({ ...prev, [order.id]: true }));

      // Hide tick after 2 seconds
      setTimeout(() => {
        setSuccessMap((prev: { [key: number]: boolean }) => ({ ...prev, [order.id]: false }));
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (order: Order) => {
    try {
      const res = await fetch("/api/refund-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, amount: order.total, status: "rejected" }),
      });
      
      if (!res.ok) throw new Error("Η ακύρωση απέτυχε.");
      
      setOrders((prev: Order[]) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o))
      );

    } catch (err) {
      console.error(err);
    }
  };

  if (!orders.length) return null;

  return (
    <div 
      className={`fixed top-30 right-4 z-50 flex flex-col space-y-3 overflow-y-auto max-h-[80vh] pb-4
        ${deliveryModalOpen === null ? "w-auto" : "w-[50%]"} 
        sm:w-[50%] w-auto`}
      style={{
          scrollbarWidth: "none", // Firefox
      }}    
    >
      {orders.map((order) => {
        const distance = order.user.distanceToDestination ?? 0; // σε km
        const deliverySpeedKmPerMin = 30 / 60; // 30 km/h σε λεπτά ανά km
        const travelTime = distance / deliverySpeedKmPerMin + defaultTime; // +10 λεπτά προετοιμασίας

        const roundTo5 = (num: number) => Math.ceil(num / 5) * 5;
        const lower = roundTo5(travelTime);
        const upper = lower + 5;

        const options: string[] = [];
        for (let t = lower - 5; t <= 70; t += 5) {
          if (t >= 0) {
            options.push(`${t}-${t + 5}`);
          }
        }
        
        return(
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

                <p className="text-sm text-gray-700 truncate max-w-full mt-2">
                  <strong>
                    {order.user.address
                      ? order.user.address.split(",").slice(0, 2).join(",")
                      : "—"}
                  </strong>
                </p>

                <div className="flex flex-row justify-between mb-2">
                  <p className="text-sm text-gray-700">
                    <strong>
                      {order.user.floor === "Ισόγειο" ? order.user.floor : `${order.user.floor} όροφος`}
                    </strong>
                  </p>

                  <strong className="text-sm text-gray-700 flex items-center gap-1">
                    <Bell className="w-4 h-4 text-gray-700" />
                    {order.user.bellName}
                  </strong>
                </div>

                <div className="text-sm text-gray-700">
                  {order.user.name}
                </div>

                {order.user.comment && (
                  <p className="text-sm text-gray-700">
                    Σχόλιο: <strong>{order.user.comment}</strong>
                  </p>
                )}

                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 truncate max-w-full">
                    {order.paidIn === "POS" ? (
                      <>
                        Πληρωμή με: <strong>POS</strong>
                      </>
                    ) : order.paidIn === "door" ? (
                      <>
                        Πληρωμή με: <strong>Μετρητά</strong>
                      </>
                    ) : order.paidIn === "online" ? (
                      <>
                        Πληρωμή <strong>Online</strong>
                      </>
                    ) : (
                      <>{order.paidIn}</>
                    )}
                  </p>
                  <p className="text-right font-semibold text-gray-800">
                    {Number(order.total).toFixed(2)}€
                  </p>
                </div>
              </Link>

              {/* ✅ Κουμπιά αποδοχής / απόρριψης ή επιβεβαίωσης */}
              {order.status !== "cancelled" && (
                <>
                  {confirmReject !== order.id ? (
                      <div className="flex gap-2">
                      <button
                        onClick={() => {setDeliveryModalOpen((prev) => (prev === order.id ? null : order.id))}}
                        className="w-1/2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                      >
                        Αποδοχή
                      </button>
                      <button
                          onClick={() => setConfirmReject(order.id)}
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
                              if (order.paidIn == "online" && order.payment_intent_id) {
                                handleCancel(order)
                              }
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
                          onClick={() => setConfirmReject(null)}
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
                      onChange={(e) => {
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
                            handleAcceptOrder(deliveryTime, order); 
                            //setOrders((prev) => prev.filter((o) => o.id !== order.id));
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
        )})}
      <div ref={printRef} className="hidden">
        {textToPrint}
      </div>
    </div>
  );
}
