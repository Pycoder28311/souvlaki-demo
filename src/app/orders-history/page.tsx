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
            className="mb-6 rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden"
          >
            {/* Header */}
            <div className="bg-yellow-400 px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <p className="text-gray-700">
                <strong>Σύνολο:</strong> {order.total}€
              </p>

              <p className="text-gray-500 text-sm">
                <strong>Δημιουργήθηκε:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>

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
            <div className="p-4 space-y-3 bg-gray-100">
              <ul className="space-y-2">
                {order.items.map((item: OrderItem, index) => (
                  <li
                    key={`${item.productId}-${index}`} 
                    className="flex flex-col sm:flex-row-reverse items-stretch bg-white shadow-sm rounded-xl mt-4 overflow-hidden"
                  >
                    {/* Product Image */}
                    {item.imageId ? (
                      <div className="w-full sm:w-56 sm:h-auto relative flex-shrink-0">
                        <Image
                          src={`/api/images/${item.imageId}`}
                          alt={item.name}
                          fill
                          style={{ objectFit: "cover", objectPosition: "top" }}
                          className="rounded-t-xl sm:rounded-r-xl sm:rounded-tl-none h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-40 sm:h-auto bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-lg sm:rounded-r-lg sm:rounded-tl-none">
                        No Image
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>

                        {/* Ingredients */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.selectedIngredients?.map((ing) => (
                            <span
                              key={ing.id}
                              className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                            >
                              {ing.name}
                            </span>
                          ))}
                          {item.selectedOptions?.map((opt) => (
                            <span
                              key={opt.id}
                              className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                            >
                              {opt.comment}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Repeat Order Button */}
                      <button
                        className="mt-4 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        onClick={() => {
                          // find the product corresponding to this orderItem
                          const product = products[item.productId];
                          if (!product) return;

                          addToCart(
                            product,                        // pass the product object
                            item.selectedIngredients || [],
                            item.selectedIngCategories || [],
                            item.selectedOptions || [],
                            item.options || []
                          );
                        }}
                      >
                        Παράγγειλε ξανά
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
