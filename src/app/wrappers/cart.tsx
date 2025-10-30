// components/OrderSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { X, ShoppingCart, ChevronDown, ChevronUp, Trash2, Edit2, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderItem, Option, Product } from "../types"; 
import { useCart } from "../wrappers/cartContext";
import CheckOutForm from '../z-components/checkOut';
import { ArrowLeft } from "lucide-react";

interface OrderSidebarProps {
  setEditableOrderItem: (item: OrderItem | null) => void;
}

type ProductWithAvailability = Product & {
  available: boolean;
  unavailableReason: string;
};

export default function OrderSidebar({
  setEditableOrderItem,
}: OrderSidebarProps) {
  const { orderItems, removeItem, setQuantity, isSidebarOpen, setIsSidebarOpen, shopOpen } = useCart();
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [hydrated, setHydrated] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentWayModal, setPaymentWayModal] = useState(false);
  const { user, setUser, address, setAddress, selectedFloor, setSelectedFloor } = useCart();
  const [warning, setWarning] = useState("");
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    setHydrated(true); // ✅ mark client as ready
  }, []);

  useEffect(() => {
    if (!shopOpen) {
      setShowPaymentModal(false);
      setPaymentWayModal(false);
    }
  }, [shopOpen]);

  const handlePayment = async (paidIn: string) => {
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
        paid: false,
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...payload, paidIn: paidIn}),
      });

      const data = await res.json();

      if (data.success) {
        orderItems.forEach((item) => removeItem(item));

        setIsSidebarOpen(false);
        setShowPaymentModal(false);

        window.location.href = "/success";
      } else {
        alert("Σφάλμα κατά τη δημιουργία παραγγελίας: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Κάτι πήγε στραβά.");
    }
  };

  const router = useRouter();

  const handleClickDoor = (paidIn: string) => {
    if (!user) {
      router.push("/auth/login-options");
      return;
    }
    handlePayment(paidIn);
  };

  const [editingAddress, setEditingAddress] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [validRadius, setValidRadius] = useState<number | null>(null);
  const [isTooFar, setIsTooFar] = useState(false);
  const [paymentWay, setPaymentWay] = useState("");

  useEffect(() => {
    if (user) {
      setSelectedFloor(user.floor ?? "");
      setAddress(user.address ?? "");

      // If user is a business, use their own validRadius
      if (user.business) {
        const radius = user.validRadius ?? 0;
        setValidRadius(radius);
        setIsTooFar(user.distanceToDestination != null && user.distanceToDestination > radius);
      }
    }
  }, [user, setAddress, user?.business, setSelectedFloor]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);

    if (e.target.value.length < 3) {
      setResults([]); // clear results if query is empty
      return;
    }

    const res = await fetch(
      `/api/search-address?query=${encodeURIComponent(e.target.value)}`
    );
    const data = await res.json();
    setResults(data.suggestions || []);
  };

  const handleUpdate = async () => {
    try {
      const addressToSend = results[0]?.trim() ? results[0] : address;

      if (!addressToSend || addressToSend.trim().length < 3  || !query) {
        setWarning("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση.");
        return;
      }

      const payload = { address: addressToSend, email: user?.email };
      const response = await fetch("/api/update-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");

      const data = await response.json();
      setWarning("");
      setQuery("")
      setUser(data.updatedUser);
      setAddress(data.updatedUser.address)
      if (validRadius && data.distanceValue > validRadius) {
        setWarning("Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας.")
      } else {
        setWarning("Η διεύθυνσή σας αποθηκεύτηκε απιτυχώς");
        setEditingAddress(false); 
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const getUnavailableMessage = (reason?: string) => {
    switch (reason) {
      case "alwaysClosed":
        return "Μη διαθέσιμο";
      case "closedNow":
        return "Μη διαθέσιμο: εκτός ωραρίου";
      case "noHoursSet":
        return "Μη διαθέσιμο: δεν έχουν οριστεί ώρες";
      default:
        return "";
    }
  };

  type Availability = {
    available: boolean;
    unavailableReason?: string;
  };

  // State
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Availability>>({});

  const handleCheckHours = async () => {
    try {
      setShowPaymentModal(true)
      const res = await fetch("/api/get-order-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: orderItems.map(item => item.productId) }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      data.products.forEach((p: ProductWithAvailability) => {
        availabilityMap[p.id.toString()] = {
          available: p.available,
          unavailableReason: !p.available ? p.unavailableReason : undefined,
        };
      });

      setAvailabilityMap({ ...availabilityMap }); // trigger rerender

      // Check if all products are available
      const allAvailable = data.products.every((p: ProductWithAvailability) => p.available);

      if (!allAvailable) {
        setShowPaymentModal(false);
        setPaymentWayModal(false);
      }
    } catch (err) {
      console.error("Error fetching order hours:", err);
    }
  };

  if (!hydrated) {
    return null;
  }

  return (
    
   <div
      className={`flex flex-col h-full w-full md:w-80 bg-gray-100 p-4 border-l border-gray-200 border-l-2 border-yellow-400 shadow-lg transition-all duration-300
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        fixed right-0 top-[55px] z-50 ${showPaymentModal ? "overflow-y-auto overflow-x-hidden" : ""}`}
      style={{
        height: `calc(100vh - 55px)`,
        scrollbarWidth: "thin", // Firefox
        scrollbarColor: "#a8a8a8ff #e5e7eb", // thumb yellow-400, track gray-200 for Firefox
      }}
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
              .map((ing: {id: number, name: string, price: number}) => ing.id)
              .sort((a: number, b: number) => a - b)
              .join("-");

            const key = `${item.productId}-${ingredientKey || "no-ingredients"}-${index}`;
            const isAvailable = availabilityMap[item.productId.toString()] ?? true;
            const reason = availabilityMap[item.productId.toString()]?.unavailableReason;

            return (
              <div
                key={key}
                onClick={() => {
                  if (!isAvailable) return;
                  setEditableOrderItem(item);
                  setQuantity(item.quantity);
                }}
                className={`bg-white rounded-xl shadow hover:shadow-lg transition p-2 flex flex-col gap-2 border-l-4 border-yellow-400
                  ${!isAvailable ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer hover:shadow-lg"}`}
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
                    {!isAvailable && <span className="text-red-500 text-sm">{getUnavailableMessage(reason)}</span>}
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
                        style={{ objectFit: "cover", objectPosition: "center" }}
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
                    {item.selectedIngredients?.map((ing: {id: number, name: string, price: number}) => (
                      <span
                        key={ing.id}
                        className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full shadow-sm"
                      >
                        {ing.name}
                      </span>
                    ))}
                    {item.selectedOptions?.map((opt: Option) => (
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
      {orderItems.length > 0 && !user?.business && (
        <div className="mb-14 sm:mb-0 border-t border-gray-400 pt-4 px-2 sm:px-0">
          <button
            onClick={handleCheckHours}
            className="w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-yellow-500 transition"
          >
            Πλήρωμή {total.toFixed(2)}€
          </button>
        </div>
      )}

      {orderItems.length === 0 && !user?.business && (
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
          <div className="bg-gray-100 w-full h-full max-h-full flex flex-col">
            <div className="flex items-center border-b border-gray-300 px-2 pt-4 pb-4">
              <button
                onClick={() => {setShowPaymentModal(false); setFormLoaded(false);}}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 ml-3">Επιβεβαίωση πληρωμής</h2>
            </div>
            
            {user?.address && (
              <div className="mb-4 text-gray-700 text-sm flex flex-col p-6">
                <span>
                  <span className="font-semibold text-gray-800">Διεύθυνση:</span> {user.address}
                </span>

                {editingAddress ? (
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
                              setAddress(r);
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
                ) : (
                  <div
                    onClick={() => setEditingAddress(true)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium shadow-sm hover:bg-gray-300 hover:shadow-md transition-all"
                  >
                    <Edit2 size={18} />
                    <span>Αλλαγή Διεύθυνσης</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <select
                    value={selectedFloor || ""}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Επίλεξε όροφο</option>
                    <option value="Ισόγειο">Ισόγειο</option>
                    <option value="1ος">1ος όροφος</option>
                    <option value="2ος">2ος όροφος</option>
                    <option value="3ος">3ος όροφος</option>
                    <option value="4ος">4ος όροφος</option>
                    <option value="5ος">5ος όροφος</option>
                  </select>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/update-floor", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ floor: selectedFloor, userEmail: user.email }),
                        });
                        if (!res.ok) throw new Error("Failed to update floor");
                        setWarning("Ο όροφος ενημερώθηκε επιτυχώς!");
                      } catch (err) {
                        console.error(err);
                        alert("Πρόβλημα κατά την ενημέρωση του ορόφου.");
                      }
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Αποθήκευση
                  </button>
                </div>

                {warning && (
                  <div className="text-red-600 font-semibold mt-4 mb-4">
                    {warning}
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
                className="mt-2 w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-xl sm:text-lg rounded-xl font-semibold hover:bg-yellow-500 transition"
                onClick={() => {
                  if (!user) {
                    setIsSidebarOpen(false)
                    router.push("/auth/signin");
                    return;
                  }

                  if (!selectedFloor) {
                    setWarning("Παρακαλώ επίλεξε όροφο πριν την πληρωμή.");
                    return;
                  }

                  if (!user?.address) {
                    setWarning("Παρακαλώ επίλεξε διεύθυνση πριν την πληρωμή.");
                    return;
                  } 

                  if (isTooFar) {
                    setWarning("Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας.");
                    return;
                  }

                  setWarning("");
                  // ✅ Proceed if floor exists
                  setPaymentWayModal(true);
                }}
              >
                Επιβεβαίωση Πληρωμής
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentWayModal && (
        <div className="fixed mb-12 sm:mb-0 w-full inset-0 bg-opacity-50 z-60 flex justify-center items-center">
          <div className="bg-gray-100 w-full h-full max-h-full flex flex-col">
            
            {/* Header */}
            <div className="flex items-center border-b border-gray-300 px-2 pt-4 pb-4">
              <button
                onClick={() => {setPaymentWayModal(false); setFormLoaded(false)}}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 ml-3">Τρόπος Πληρωμής</h2>
            </div>

            {/* Bottom Section */}
            <div className="pb-6 border-gray-300 mt-auto px-6">
              {/* Total */}
              <p className="mb-4 font-bold text-gray-900 text-xl px-1 pt-4">
                Σύνολο: {total.toFixed(2)}€
              </p>

              {(() => {
                const isDisabled: boolean = !!(isTooFar);
                const disabledClasses = "opacity-50 pointer-events-none";

                return (
                  <div>
                    <div className="mt-0 mb-0">
                      <CheckOutForm 
                        amount={total} 
                        userId={user?.id} 
                        items={orderItems} 
                        paidIn={paymentWay} 
                        isDisabled={isDisabled} 
                        removeItem={removeItem} 
                        setIsSidebarOpen={setIsSidebarOpen} 
                        setShowPaymentModal={setShowPaymentModal} 
                        onLoaded={() => setFormLoaded(true)} 
                      />
                    </div>
                    {!formLoaded && (
                      <button
                        className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold flex items-center justify-center space-x-2 opacity-50 pointer-events-none`}
                        disabled
                      >
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        <span>Φόρτωση...</span>
                      </button>
                    )}
                    <button
                      className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-green-600 ${isDisabled ? disabledClasses : ""}`}
                      onClick={() => {handleClickDoor("POS"); setPaymentWay("POS")}}
                      disabled={isDisabled}
                    >
                      Πληρωμή με POS
                    </button>
                    <button
                      className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-green-600 ${isDisabled ? disabledClasses : ""}`}
                      onClick={() => {handleClickDoor("door"); setPaymentWay("door")}}
                      disabled={isDisabled}
                    >
                      Πληρωμή με μετρητά
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
