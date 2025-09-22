"use client";

import { useEffect, useState } from "react";
import OrderSidebar from "../cart";
import { ShoppingCart } from "lucide-react";
import EditModal from '../menu/editModal';
import Image from "next/image";

type Ingredient = {
  id: number;
  name: string;
  price: number;
};

type OrderItemList = {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  ingredients: Ingredient[];
  ingCategories: IngCategory[];
};

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageId: number | null;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
};

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItemList[];
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
};

type ImageType = {
  id: number;
  data: Uint8Array;
  createdAt: Date;
}

type Product = {
  id: number;
  name: string;
  price: number;
  offer: boolean;
  image?: ImageType | null;
  imageId?: number | null; 
  ingCategories?: IngCategory[]
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
        console.log(data)
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

  const editItem = (
    orderItemToEdit: OrderItem,
    newIngredients: Ingredient[],
  ) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item === orderItemToEdit
          ? {
              ...item,
              quantity: quantity,
              selectedIngredients: newIngredients,
            }
          : item
      )
    );
  };

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
    selectedIngCategories: IngCategory[] // 👈 add categories too
  ) => {
    setOrderItems((prev) => {
      // Check if product with same ingredients already exists
      const existing = prev.find((item) => {
        if (item.productId !== product.id) return false;

        const itemIngredients = item.selectedIngredients || [];
        if (itemIngredients.length !== selectedIngredients.length) return false;

        return itemIngredients.every((ing) =>
          selectedIngredients.some((sel) => sel.id === ing.id)
        );
      });

      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Otherwise add new item with categories too
      return [
        ...prev,
        {
          imageId: product.imageId ?? null,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          selectedIngredients,
          selectedIngCategories, // 👈 store them here
        },
      ];
    });
  };

  if (loading) return <p>Φόρτωση...</p>;
  if (!orders.length) return <p>Δεν βρέθηκαν παραγγελίες.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`p-8 pt-24 transition-all duration-300 flex flex-col ${
          isSidebarOpen
            ? "lg:mr-80 lg:max-w-[calc(100%-20rem)] justify-start" // shift right when sidebar open on desktop
            : "lg:ml-40 lg:max-w-[calc(100%-20rem)]"                 // desktop only, full width on mobile
        }`}
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Οι Παραγγελίες μου</h1>

        {orders.map((order) => (
          <div
            key={order.id}
            className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden"
          >
            {/* Header */}
            <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.status === "completed"
                    ? "bg-green-500 text-white"
                    : order.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {order.status === "completed"
                  ? "Ολοκληρώθηκε"
                  : order.status === "pending"
                  ? "Σε εκκρεμότητα"
                  : "Ακυρώθηκε"}
              </span>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              <p className="text-gray-700">
                <strong>Σύνολο:</strong> €{order.total}
              </p>
              <p className="text-gray-500 text-sm">
                <strong>Δημιουργήθηκε:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>

              {/* Items */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <h2 className="text-gray-800 font-medium mb-2">Περιεχόμενα Παραγγελίας</h2>
                <ul className="space-y-2">
                  {order.items.map((item: OrderItemList) => (
                    <li key={item.id} className="text-gray-700">
                      {item.product.imageId ? (
                        <div className="w-full h-[40vh] sm:h-64 relative overflow-hidden shadow-sm mb-4 rounded-t-lg">
                          <Image
                            src={`/api/images/${item.product.imageId}`}
                            alt={item.product.name}
                            fill
                            style={{ objectFit: "cover", objectPosition: "top" }}
                            className="rounded-t-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-[40vh] sm:h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
                          No Image
                        </div>
                      )}
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
                      <button
                        key={item.id}
                        className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        onClick={() => addToCart(item.product, item.ingredients, item.ingCategories)}
                      >
                        Παράγγειλε ξανά: {item.product.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
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
