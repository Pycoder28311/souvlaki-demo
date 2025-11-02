"use client";

import { useEffect, useState } from "react";
import OrderCard from "./orderCard";
import { Order } from "../types"; 
import { useCart } from "../wrappers/cartContext";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const evtSource = new EventSource("/api/read-live-orders");

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders(data);
      setLoading(false);
    };

    return () => {
      evtSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-700 text-lg font-semibold">
          Φόρτωση παραγγελιών...
        </span>
      </div>
    );
  }

  if (!user?.business) return null;

  if (orders.length === 0)
  return (
    <div className="flex items-center justify-center h-screen">
      <span className="text-gray-700 text-lg font-semibold">
        Δεν υπάρχουν live παραγγελίες
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-3xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Live Παραγγελίες</h1>

        {orders.map((order) => (
          <OrderCard key={order.id} order={order} defaultTime={user?.defaultTime}/>
        ))}
      </div>
    </div>
  );
}
