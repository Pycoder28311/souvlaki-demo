// components/OrderSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { X, ShoppingCart, ChevronDown, ChevronUp, Trash2, Edit2, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Ingredient = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
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

interface OrderSidebarProps {
  orderItems: OrderItem[];
  setEditableOrderItem: (item: OrderItem | null) => void;
  setQuantity: (qty: number) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  removeItem: (item: OrderItem) => void;
}

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address?: string;
};

export default function OrderSidebar({
  orderItems,
  setEditableOrderItem,
  setQuantity,
  isSidebarOpen,
  setIsSidebarOpen,
  removeItem,
}: OrderSidebarProps) {
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentWayModal, setPaymentWayModal] = useState(false);

  useEffect(() => {
    setHydrated(true); // ✅ mark client as ready
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
          setSelected("");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  const handlePayment = async () => {
    try {
      const userId = user?.id; // Replace with current logged-in user id
      const payload = {
        userId,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          ingredients: item.selectedIngredients || [],
          options: item.options,
          selectedOptions: item.selectedOptions,
        })),
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Η παραγγελία δημιουργήθηκε με επιτυχία!");
        orderItems.forEach((item) => removeItem(item));

        setIsSidebarOpen(false);
        setShowPaymentModal(false);
      } else {
        alert("Σφάλμα κατά τη δημιουργία παραγγελίας: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Κάτι πήγε στραβά.");
    }
  };

  const router = useRouter();

  const handlePaymentStripe = async () => {
    try {
      const userId = user?.id;
      const payload = {
        userId,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          ingredients: item.selectedIngredients || [],
          options: item.options,
          selectedOptions: item.selectedOptions,
        })),
        amount: total * 100, // Stripe expects cents
      };

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.url) {
        sessionStorage.setItem("lastOrder", JSON.stringify(payload));
        orderItems.forEach((item) => removeItem(item));

        setIsSidebarOpen(false);
        setShowPaymentModal(false);

        window.location.href = data.url;
      } else {
        alert("Σφάλμα κατά τη δημιουργία παραγγελίας: " + data.error);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const handleClickOnline = () => {
    if (!user) {
      router.push("/auth/login-options");
      return;
    }
    handlePaymentStripe();
  };

  const handleClickDoor = () => {
    if (!user) {
      router.push("/auth/login-options");
      return;
    }
    handlePayment();
  };

  const [editingAddress, setEditingAddress] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);

    if (e.target.value.length < 3) return; // only search after 3 chars

    const res = await fetch(
      `/api/search-address?query=${encodeURIComponent(e.target.value)}`
    );
    const data = await res.json();
    setResults(data.suggestions || []);
  };

  const handleUpdate = async () => {
    try {
      const payload = { address: selected };

      const response = await fetch("/api/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSelected("")
      setEditingAddress(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (!hydrated) {
    // Render nothing (or a skeleton) until client + localStorage are ready
    return null;
  }

  return (
    
   <div
      className={`flex flex-col h-full w-full md:w-80 bg-gray-100 p-4 border-l border-gray-200 border-l-2 border-yellow-400 shadow-lg transition-all duration-300
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        fixed right-0 top-[55px] z-50`}
      style={{ height: `calc(100vh - 55px)` }}
    >
      {/* Header with Close Button in same line */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-400 pb-3">
        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" /> Το καλάθι μου
        </h3>

        <button
          className="p-1 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close Cart Sidebar"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Order Items */}
      <div
        className="flex-1 space-y-4 overflow-y-auto"
        style={{ maxHeight: "calc(100% - 80px)" }}
      >
        {orderItems.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">Το καλάθι είναι άδειο.</p>
        ) : (
          orderItems.map((item, index) => {
            const ingredientKey = (item.selectedIngredients || [])
              .map((ing) => ing.id)
              .sort((a, b) => a - b)
              .join("-");

            const key = `${item.productId}-${ingredientKey || "no-ingredients"}-${index}`;

            return (
              <div
                key={key}
                onClick={() => {
                  setEditableOrderItem(item);
                  setQuantity(item.quantity);
                }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-2 cursor-pointer flex flex-col gap-2 border-l-4 border-yellow-400"
              >
                <div className="flex justify-between items-start">
                  <div className="w-40">
                    <div className="flex flex-col gap-1 p-1">
                      <h4 className="font-bold text-gray-800">{item.quantity} x {item.name}</h4>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <span className="text-yellow-500 font-semibold px-3 py-1 ">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                      <button
                        className=" p-2 bg-gray-300 text-gray-800 font-bold rounded-lg transition hover:bg-gray-400"

                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item);
                        }}
                        className=" p-2 bg-gray-300 text-gray-800 font-bold rounded-lg transition hover:bg-red-500"

                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {((item.selectedIngredients && item.selectedIngredients.length > 0) || (item.selectedOptions && item.selectedOptions.length > 0)) && (
                      <div className="mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedItems((prev) => ({
                              ...prev,
                              [item.productId]: !prev[item.productId],
                            }));
                          }}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                        >
                          {expandedItems[item.productId] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {expandedItems[item.productId] ? "Απόκρυψη Υλικών" : "Προβολή Υλικών"}
                        </button>
                      </div>
                    )}
                  </div>
                  {item.imageId ? (
                    <div className="w-22 h-22 relative overflow-hidden shadow-sm rounded-lg">
                      <Image
                        src={`/api/images/${item.imageId}`}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover", objectPosition: "top" }}
                      />
                    </div>
                  ) : (
                    <div className="w-22 h-22 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg ">
                      Χωρίς Εικόνα
                    </div>
                  )}
                </div>
                {expandedItems[item.productId] && ((item.selectedIngredients && item.selectedIngredients.length > 0) || (item.selectedOptions && item.selectedOptions.length > 0)) && (
                  <div className="flex flex-wrap gap-2 mt-2">
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
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Total and Checkout */}
      {orderItems.length > 0 && user?.email !== "kopotitore@gmail.com" && (
        <div className="mb-14 sm:mb-0 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base rounded-xl font-semibold hover:bg-yellow-500 transition"
          >
            Πλήρωμή {total.toFixed(2)}€
          </button>
        </div>
      )}

      {orderItems.length === 0 && user?.email !== "kopotitore@gmail.com" && (
        <div className="mb-14 sm:mb-0 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <Link href="/menu" className="block w-full">
            <button
              className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base font-bold rounded-lg hover:bg-yellow-500 transition"
            >
              Δες το Μενού
            </button>
          </Link>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed mb-12 sm:mb-0 inset-0 bg-opacity-50 z-60 flex justify-center items-center">
          
          <div className="bg-gray-100 shadow-lg w-full h-full max-h-full flex flex-col">
            
            {/* Modal Header */}
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-gray-300 pb-2 px-6 pt-6">
              Επιβεβαίωση Πληρωμής
            </h2>

            {/* Scrollable Content */}
            
            {user?.address && (
              <div className="mb-4 text-gray-700 text-sm flex flex-col p-6">
                <span>
                  <span className="font-semibold text-gray-800">Διεύθυνση:</span> {user.address}
                </span>

                <div
                  onClick={() => setEditingAddress(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium shadow-sm hover:bg-gray-300 hover:shadow-md transition-all"
                >
                  <Edit2 size={18} />
                  <span>Αλλαγή Διεύθυνσης</span>
                </div>

                {editingAddress && (
                  <div className="mt-4 relative">
                      <div className="flex items-center gap-2">
                      <input
                          type="text"
                          value={query}
                          onChange={handleSearch}
                          placeholder="Type your address..."
                          className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                          onClick={handleUpdate}
                          className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                      >
                          <Check className="w-5 h-5" />
                      </button>
                      <button
                          onClick={() => setEditingAddress(!editingAddress)}
                          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                      >
                          <X className="w-5 h-5" />
                      </button>
                      </div>

                      {/* Dropdown Results */}
                      {results.length > 0 && (
                      <ul className="absolute top-full left-0 w-full bg-white border rounded-xl max-h-52 overflow-y-auto mt-1 shadow-lg z-20">
                          {results.map((r, i) => (
                          <li
                              key={i}
                              onClick={() => {
                              setSelected(r);
                              setQuery(r);
                              setResults([]);
                              }}
                              className="p-3 hover:bg-gray-100 cursor-pointer text-left"
                          >
                              {r}
                          </li>
                          ))}
                      </ul>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Buttons at the bottom */}
            <div className="px-6 pb-6 border-gray-300 mt-auto">
              <p className="mt-4 font-bold text-gray-900 text-lg">
                Σύνολο: {total.toFixed(2)}€
              </p>
              <button
                className="mt-2 w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base rounded-xl font-semibold hover:bg-yellow-500 transition"
                onClick={() => setPaymentWayModal(true)}
              >
                Επιβεβαίωση Πληρωμής
              </button>
              <button
                className="mt-2 w-full bg-gray-200 text-gray-700 py-3 sm:py-2 rounded-xl hover:bg-gray-300 transition"
                onClick={() => setShowPaymentModal(false)}
              >
                Πίσω
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentWayModal && (
        <div className="fixed mb-12 sm:mb-0 w-full inset-0 bg-opacity-50 z-60 flex justify-center items-center">
          <div className="bg-gray-100 shadow-lg w-full h-full max-h-full flex flex-col">
            
            {/* Modal Header */}
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-gray-300 pb-2 px-6 pt-6">
              Τρόπος Πληρωμής
            </h2>

            {/* Buttons at the bottom */}
            <div className="px-6 pb-6 border-gray-300 mt-auto">
              <p className="mt-4 font-bold text-gray-900 text-lg">
                Σύνολο: {total.toFixed(2)}€
              </p>
              <button
                className="mt-2 w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base rounded-xl font-semibold hover:bg-yellow-500 transition"
                onClick={handleClickDoor}
              >
                Πληρωμή από κοντά
              </button>
              <button
                className="mt-2 w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-base rounded-xl font-semibold hover:bg-yellow-500 transition"
                onClick={handleClickOnline}
              >
                Πληρωμή Online
              </button>
              <button
                className="mt-2 w-full bg-gray-200 text-gray-700 py-3 sm:py-2 rounded-xl hover:bg-gray-300 transition"
                onClick={() => setPaymentWayModal(false)}
              >
                Πίσω
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
