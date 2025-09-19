"use client";

import { useEffect, useState } from "react";
import Navbar from '../navigator';

type Ingredient = {
  id: number;
  name: string;
  price: number;
};

type OrderItem = {
  id: number;
  product: { name: string };
  quantity: number;
  price: number;
  ingredients: Ingredient[];
};

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const userId = user?.id;

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  // Fetch orders when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/read-orders?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {orders.map((order) => (
          <div key={order.id} className="mb-6 border p-4 rounded-md shadow-sm">
            <p><strong>Order #{order.id}</strong></p>
            <p>Status: {order.status}</p>
            <p>Total: €{order.total}</p>
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            <ul>
              {order.items.map((item: OrderItem) => (
                <li key={item.id} className="mb-2">
                  {item.quantity} x {item.product.name} - €{item.price}
                  {item.ingredients.length > 0 && (
                    <ul className="ml-4 text-sm text-gray-600">
                      {item.ingredients.map((ing) => (
                        <li key={ing.id}>+ {ing.name} - €{ing.price}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
