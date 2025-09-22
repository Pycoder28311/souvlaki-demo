"use client";

import { useEffect, useState } from "react";

type Ingredient = {
  id: number;
  name: string;
  price: number;
};

type OrderItem = {
  id: number;
  product: { id: number, name: string };
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
  
  const reorder = async (order: Order) => {
    try {
      const payload = {
        userId,
        items: order.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price,
          ingredients: item.ingredients || [],
        })),
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order created successfully!");
      } else {
        alert("Error creating order: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-3xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

        {orders.map((order) => (
          <div
            key={order.id}
            className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden"
          >
            {/* Header */}
            <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
              <p className="font-semibold text-gray-900">Order #{order.id}</p>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.status === "completed"
                    ? "bg-green-500 text-white"
                    : order.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              <p className="text-gray-700">
                <strong>Total:</strong> €{order.total}
              </p>
              <p className="text-gray-500 text-sm">
                <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>

              {/* Items */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <h2 className="text-gray-800 font-medium mb-2">Items</h2>
                <ul className="space-y-2">
                  {order.items.map((item: OrderItem) => (
                    <li key={item.id} className="text-gray-700">
                      {item.quantity} × {item.product.name} - €
                      {item.price}
                      {item.ingredients.length > 0 && (
                        <ul className="ml-5 mt-1 text-sm text-gray-600 list-disc">
                          {item.ingredients.map((ing) => (
                            <li key={ing.id}>
                              + {ing.name} - €{ing.price}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reorder button */}
              <button
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                onClick={() => reorder(order)}
              >
                Παράγγειλε ξανά
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
}
