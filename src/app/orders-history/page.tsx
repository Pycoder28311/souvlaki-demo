"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import OrderCard from "./orderCard";
import { Product, Ingredient, IngCategory, Option, User } from "../types";
import { useCart } from "../wrappers/cartContext"; 

export interface OrderItem {
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

export interface Order {
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

export default function MyOrdersPage() {
  const { addToCart, isSidebarOpen } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const pendingRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const topOffset = ref.current.getBoundingClientRect().top + window.scrollY - 70; // 60px above
      window.scrollTo({
        top: topOffset,
        behavior: "smooth",
      });
    }
  };

  const { user } = useCart();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const evtSource = new EventSource(`/api/read-orders?userId=${userId}`);

    evtSource.onmessage = (event: MessageEvent) => {
      try {
        const data: { orders: Order[]; products: Product[] } = JSON.parse(event.data);
        setOrders(data.orders);
        setProducts(data.products);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
    };

    // Cleanup on unmount
    return () => {
      evtSource.close();
    };
  }, [userId]);

  if (orders.length === 0) return 
    <div className="text-center py-10 pt-30">
      <p className="mb-4 text-xl">Δεν έχετε κάνει ακόμα παραγγελίες.</p>
      <Link
        href="/menu"
        className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 font-bold transition-colors inline-block"
      >
        Δες το Μενού
      </Link>
    </div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`p-8 pt-24 lg:p-0 lg:pt-24 transition-all duration-300 flex flex-col ${
          isSidebarOpen
            ? "lg:mr-80 ml-40 lg:max-w-[calc(100%-40rem)] justify-start" // shift right when sidebar open on desktop
            : "lg:ml-80 lg:max-w-[calc(100%-40rem)]"                 // desktop only, full width on mobile
        }`}
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Οι Παραγγελίες μου</h1>

        <div className="flex flex-wrap justify-center lg:justify-between gap-3 mb-6 top-0 z-10">
          <button
            onClick={() => scrollToSection(pendingRef)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg font-semibold transition"
          >
            Εκκρεμείς
          </button>
          <button
            onClick={() => scrollToSection(completedRef)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
          >
            Ολοκληρωμένες
          </button>
          <button
            onClick={() => scrollToSection(cancelledRef)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
          >
            Ακυρωμένες / Απορριφθείσες
          </button>
        </div>

        <div className="space-y-8">
          {/* Pending Orders */}
          {orders.some((order) => order.status === "pending" || order.status === "requested") && (
            <div ref={pendingRef}>
              <h2 className="text-xl font-bold text-yellow-600 mb-4">🕒 Εκκρεμείς Παραγγελίες</h2>
              {orders
                .filter((order) => order.status === "pending" || order.status === "requested")
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    products={products}
                    addToCart={addToCart}
                    setOrders={setOrders}
                  />
                ))}
            </div>
          )}

          {/* Completed Orders */}
          {orders.some((order) => order.status === "completed") && (
            <div ref={completedRef}>
              <h2 className="text-xl font-bold text-green-600 mb-4">✅ Ολοκληρωμένες Παραγγελίες</h2>
              {orders
                .filter((order) => order.status === "completed")
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    products={products}
                    addToCart={addToCart}
                    setOrders={setOrders}
                  />
                ))}
            </div>
          )}

          {/* Cancelled & Rejected Orders */}
          {orders.some(
            (order) => order.status === "cancelled" || order.status === "rejected"
          ) && (
            <div ref={cancelledRef}>
              <h2 className="text-xl font-bold text-red-600 mb-4">❌ Ακυρωμένες / Απορριφθείσες Παραγγελίες</h2>
              {orders
                .filter(
                  (order) => order.status === "cancelled" || order.status === "rejected"
                )
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    products={products}
                    addToCart={addToCart}
                    setOrders={setOrders}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
