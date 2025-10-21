"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

let socket: Socket;

interface Order {
  id: number;
  paid: boolean;
  user: { name: string | null };
}

interface OrdersSocketProps {
  initialOrders: Order[];
}

export default function OrdersSocket({ initialOrders }: OrdersSocketProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    if (!socket) {
      socket = io("/", { path: "/api/socket" }); // defaults to current origin
    }

    socket.on("orderUpdated", (newOrder: Order) => {
      setOrders((prev) => {
        const index = prev.findIndex((o) => o.id === newOrder.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = newOrder;
          return updated;
        } else {
          return [newOrder, ...prev];
        }
      });
    });

    socket.on("orderDeleted", (deletedId: number) => {
      setOrders((prev) => prev.filter((o) => o.id !== deletedId));
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, []);

  return (
    <>
      {orders.map((order) => (
        <div
          key={order.id}
          className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden p-4"
        >
          <p>
            Παραγγελία #{order.id} - {order.user.name} προϊόντα
          </p>
          <p className={order.paid ? "text-green-600" : "text-red-600"}>
            {order.paid ? "Πληρωμένη" : "Μη Πληρωμένη"}
          </p>
        </div>
      ))}
    </>
  );
}
