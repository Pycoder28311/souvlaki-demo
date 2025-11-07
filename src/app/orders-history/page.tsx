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
  const [notification, setNotification] = useState<string | null>(null);
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

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const topOffset = ref.current.getBoundingClientRect().top + window.scrollY - 70; // 60px above
      window.scrollTo({
        top: topOffset,
        behavior: "smooth",
      });
    }
  };

  const sections = [
    {
      key: "pending",
      ref: pendingRef,
      title: "🕒 Εκκρεμείς Παραγγελίες",
      color: "text-yellow-600",
      buttonText: "Εκκρεμείς",
      buttonClass: "bg-yellow-400 hover:bg-yellow-500 text-gray-800",
      filter: (order: Order) => order.status === "pending" || order.status === "requested",
    },
    {
      key: "completed",
      ref: completedRef,
      title: "✅ Ολοκληρωμένες Παραγγελίες",
      color: "text-green-600",
      buttonText: "Ολοκληρωμένες",
      buttonClass: "bg-green-500 hover:bg-green-600 text-white",
      filter: (order: Order) => order.status === "completed",
    },
    {
      key: "cancelled",
      ref: cancelledRef,
      title: "❌ Ακυρωμένες / Απορριφθείσες Παραγγελίες",
      color: "text-red-600",
      buttonText: "Ακυρωμένες / Απορριφθείσες",
      buttonClass: "bg-red-500 hover:bg-red-600 text-white",
      filter: (order: Order) => order.status === "cancelled" || order.status === "rejected",
    },
  ];

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

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center lg:justify-between gap-3 mb-6 top-0 z-10">
          {sections.map(({ key, ref, buttonText, buttonClass }) => (
            <button
              key={key}
              onClick={() => scrollToSection(ref)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${buttonClass}`}
            >
              {buttonText}
            </button>
          ))}
        </div>

        {/* Order Sections */}
        <div className="space-y-8">
          {notification && <div>{notification}</div>}

          {sections.map(({ key, ref, title, color, filter }) => {
            const filteredOrders = orders.filter(filter);
            if (filteredOrders.length === 0) return null;

            return (
              <div key={key} ref={ref}>
                <h2 className={`text-xl font-bold mb-4 ${color}`}>{title}</h2>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    products={products}
                    addToCart={addToCart}
                    setOrders={setOrders}
                    setNotification={setNotification}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>

  );
}
