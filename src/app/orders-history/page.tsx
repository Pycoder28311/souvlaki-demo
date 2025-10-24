"use client";

import { useEffect, useState, useRef } from "react";
import OrderSidebar from "../cart";
import { ShoppingCart } from "lucide-react";
import EditModal from '../menu/editModal';
import Link from "next/link";
import OrderCard from "./orderCard";

type Ingredient = {
  id: number;
  name: string;
  price: number;
};

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
};

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageId: number | null;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
  selectedOptions?: Option[];
  options?: Option[];
};

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  deliveryTime: string;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
};

type ImageType = {
  id: number;
  data: Uint8Array;
  createdAt: Date;
}

type Product = {
  id: number
  name: string
  price: number
  offer: boolean
  offerPrice?: number;
  description: string;
  image?: ImageType | null
  imageId?: number | null; 
  ingCategories?: IngCategory[];
  options?: Option[];
}

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
  const [editableOrderItem, setEditableOrderItem] = useState<OrderItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const userId = user?.id;

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
          setProducts(data.products);
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

  const removeItem = (item: OrderItem) => {
    setOrderItems((prev) => {
      const updated = prev.filter((itm) => itm !== item);

      // Optional: immediately update localStorage (redundant if you already have the useEffect)
      localStorage.setItem("orderItems", JSON.stringify(updated));

      return updated;
    });
  };

  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    if (typeof window === "undefined") return []; // server
    try {
      const stored = localStorage.getItem("orderItems");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to parse orderItems from localStorage:", err);
      return [];
    }
  });

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta)); // min 1
  };

  // Save to localStorage whenever orderItems change
  useEffect(() => {
    localStorage.setItem("orderItems", JSON.stringify(orderItems));
  }, [orderItems]);
  const [quantity, setQuantity] = useState(editableOrderItem?.quantity || 1);

  const addToCart = (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[], // categories
    selectedOptions: Option[], // 👈 options
    options: Option[]
  ) => {
    setOrderItems((prev) => {
      // Check if product with same ingredients and options already exists
      const existing = prev.find((item) => {
        if (item.productId !== product.id) return false;

        const itemIngredients = item.selectedIngredients || [];
        if (itemIngredients.length !== selectedIngredients.length) return false;
        const ingredientsMatch = itemIngredients.every((ing) =>
          selectedIngredients.some((sel) => sel.id === ing.id)
        );

        const itemOptions = item.selectedOptions || [];
        if (itemOptions.length !== selectedOptions.length) return false;
        const optionsMatch = itemOptions.every((opt) =>
          selectedOptions.some((sel) => sel.id === opt.id)
        );

        return ingredientsMatch && optionsMatch;
      });

      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const ingredientsTotal = selectedIngredients.reduce(
        (sum, ing) => sum + Number(ing.price),
        0
      );
      const optionsTotal = selectedOptions.reduce(
        (sum, opt) => sum + Number(opt.price),
        0
      );

      const totalPrice = Number(product.price) + ingredientsTotal + optionsTotal;

      return [
        ...prev,
        {
          imageId: product.imageId ?? null,
          productId: product.id,
          name: product.name,
          price: totalPrice,
          quantity: 1,
          selectedIngredients,
          selectedIngCategories,
          selectedOptions, // 👈 store Option[] here
          options,
        },
      ];
    });
  };

  const editItem = (
    orderItemToEdit: OrderItem,
    newIngredients: Ingredient[],
    selectedOptions?: Option[] | undefined, 
  ) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item === orderItemToEdit
          ? {
              ...item,
              quantity: quantity,
              selectedIngredients: newIngredients,
              selectedOptions: selectedOptions, // προσθήκη options
              // Recalculate price: base price + sum of ingredient prices
              price:
              orderItemToEdit.price
              - (item.selectedIngredients?.reduce((sum, ing) => sum + Number(ing.price), 0) || 0)
              + newIngredients.reduce((sum, ing) => sum + Number(ing.price), 0)
              - (item.selectedOptions?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0)
              + (selectedOptions?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0),
            }
          : item
      )
    );
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isSidebarOpen && isMobile) {
      // Disable background scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable when closed
      document.body.style.overflow = "";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  if (loading) return <p>Φόρτωση...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`p-8 pt-24 lg:p-0 lg:pt-24 transition-all duration-300 flex flex-col ${
          isSidebarOpen
            ? "lg:mr-80 ml-40 lg:max-w-[calc(100%-40rem)] justify-start" // shift right when sidebar open on desktop
            : "lg:ml-80 lg:max-w-[calc(100%-40rem)]"                 // desktop only, full width on mobile
        }`}
      >
        {orders.length > 0 &&  (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Οι Παραγγελίες μου</h1>
          </>
        )}

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

        {orders.length > 0 ? (
          <div className="space-y-8">
            {/* Pending Orders */}
            {orders.some((order) => order.status === "pending") && (
              <div ref={pendingRef}>
                <h2 className="text-xl font-bold text-yellow-600 mb-4">🕒 Εκκρεμείς Παραγγελίες</h2>
                {orders
                  .filter((order) => order.status === "pending")
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
        ) : (
          <div className="text-center py-10">
            <p className="mb-4 text-xl">Δεν έχετε κάνει ακόμα παραγγελίες.</p>
            <Link
              href="/menu"
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 font-bold transition-colors inline-block"
            >
              Δες το Μενού
            </Link>
          </div>
        )}
      </div>

      <OrderSidebar
        orderItems={orderItems}
        setEditableOrderItem={setEditableOrderItem}
        setQuantity={setQuantity}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        removeItem={removeItem}
      />

      {/* Open Sidebar Button */}
      {!isSidebarOpen && (
        <button
          className="hidden md:flex fixed right-0 top-[90px] -translate-y-1/2 px-3 py-2 bg-green-600 text-white rounded-l-lg z-40 items-center justify-center"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Cart"
        >
          <ShoppingCart className="w-8 h-8" />
        </button>
      )}

      {!isSidebarOpen && (
        <button
          className="
            block md:hidden
            fixed bottom-4 left-4 right-4 w-auto px-6 py-3 bg-green-600 text-white flex items-center justify-center rounded-lg z-40
            text-lg font-semibold shadow-lg hover:bg-green-700 active:bg-green-800 transition-colors duration-200
          "
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Cart"
        >
          <ShoppingCart className="w-8 h-8 mr-2" /> Καλάθι
        </button>
      )}

      {editableOrderItem && (
        <EditModal
          orderItem={editableOrderItem}
          defaultSelectedIngredients={editableOrderItem.selectedIngredients || []} // 👈 pass default ingredients
          onClose={() => setEditableOrderItem(null)}
          editItem={editItem}
          changeQuantity={changeQuantity}
          quantity={quantity}
        />
      )}
    </div>

  );
}
