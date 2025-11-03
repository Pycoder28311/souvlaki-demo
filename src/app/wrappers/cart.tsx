// components/OrderSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { X, ShoppingCart, ChevronDown, ChevronUp, Trash2, Edit2, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderItem, Option } from "../types"; 
import { useCart } from "../wrappers/cartContext";
import CheckOutForm from '../z-components/checkOut';
import {
  handleSearch,
  handleUpdateAddress,
  getUnavailableMessage,
  handleCheckHours,
  handleUpdateAll,
  handleClickDoor,
} from "./functions/cart";
import CartBody from "./components/cart/cartBody";
import PaymentWayModal from "./components/cart/paymentWayModal";

interface OrderSidebarProps {
  setEditableOrderItem: (item: OrderItem | null) => void;
}

type Availability = {
  available: boolean;
  unavailableReason?: string;
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

  const [editingAddress, setEditingAddress] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [validRadius, setValidRadius] = useState<number | null>(null);
  const [isTooFar, setIsTooFar] = useState(false);
  const [paymentWay, setPaymentWay] = useState("");
  const [userComment, setUserComment] = useState<string | undefined>(user?.comment);
  const [bellName, setBellName] = useState<string | undefined>(user?.bellName);
  const [showDetails, setShowDetails] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Availability>>({});
  
  const router = useRouter();

  useEffect(() => {
    setHydrated(true); // ✅ mark client as ready
  }, []);

  useEffect(() => {
    if (!shopOpen) {
      setShowPaymentModal(false);
      setPaymentWayModal(false);
    }
  }, [shopOpen]);

  useEffect(() => {
    if (user) {
      setSelectedFloor(user.floor ?? "");
      setAddress(user.address ?? "");
      setBellName(user.bellName ?? "");
      setUserComment(user.comment ?? "");

      // If user is a business, use their own validRadius
      if (user.business) {
        const radius = user.validRadius ?? 0;
        setValidRadius(radius);
        setIsTooFar(user.distanceToDestination != null && user.distanceToDestination > radius);
      }
    }
  }, [user, setAddress, user?.business, setSelectedFloor]);

  if (!hydrated || user?.business) {
    return null;
  }

  return (
    
   <div
      className={`flex flex-col h-full w-full md:w-80 bg-gray-100 border-l border-gray-200 border-l-2 border-yellow-400 shadow-lg transition-all duration-300
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        fixed right-0 top-[55px] z-50 ${showPaymentModal ? "overflow-y-auto overflow-x-hidden" : ""}`}
      style={{
        height: `calc(100vh - 55px)`,
        scrollbarWidth: "thin", // Firefox
        scrollbarColor: "#a8a8a8ff #e5e7eb", // thumb yellow-400, track gray-200 for Firefox
      }}
    >
      <CartBody
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        orderItems={orderItems}
        removeItem={removeItem}
        setEditableOrderItem={setEditableOrderItem}
        setQuantity={setQuantity}
        expandedItems={expandedItems}
        setExpandedItems={setExpandedItems}
        availabilityMap={availabilityMap}
        setAvailabilityMap={setAvailabilityMap}
        handleCheckHours={handleCheckHours}
        setShowPaymentModal={setShowPaymentModal}
        setPaymentWayModal={setPaymentWayModal}
        total={total}
        user={user}
        getUnavailableMessage={getUnavailableMessage}
      />

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
              <div className="mb-0 text-gray-700 text-sm flex flex-col p-6 overflow-x-hidden overflow-y-auto" 
              style={{
                scrollbarWidth: "thin", // Firefox
                scrollbarColor: "#a8a8a8ff #e5e7eb", // thumb yellow-400, track gray-200 for Firefox
              }}>
                <span>
                  <span className="font-semibold text-gray-800">Διεύθυνση:</span> {user.address}
                </span>

                {editingAddress ? (
                  <div className="mt-4 relative">
                      <div className="flex items-center gap-2">
                      <input
                          type="text"
                          value={query}
                          onChange={(e) => handleSearch(e, setQuery, setResults)}
                          placeholder="Type your address..."
                          className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                          onClick={() =>
                            handleUpdateAddress(
                              user,
                              address,
                              query,
                              results,
                              setUser,
                              setAddress,
                              setWarning,
                              setEditingAddress,
                              validRadius
                            )
                          }
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
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium shadow-sm hover:bg-gray-300 hover:shadow-md transition-all hover:scale-105"
                  >
                    <Edit2 size={18} />
                    <span>Αλλαγή Διεύθυνσης</span>
                  </div>
                )}

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 justify-center w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 mt-4"
                >
                  {showDetails ? "Απόκρυψη λεπτομερειών" : "Εμφάνιση λεπτομερειών"}
                  {showDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {showDetails && (
                  <div className="flex flex-col gap-2">
                    {warning && (
                      <div className="text-red-600 font-semibold mt-4 mb-0">
                        {warning}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-4">
                      <p className="text-gray-700">Όροφος:</p>
                      <select
                        value={selectedFloor || ""}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="">Επίλεξε όροφο</option>
                        <option value="Ισόγειο">Ισόγειο</option>
                        <option value="1ος">1ος όροφος</option>
                        <option value="2ος">2ος όροφος</option>
                        <option value="3ος">3ος όροφος</option>
                        <option value="4ος">4ος όροφος</option>
                        <option value="5ος">5ος όροφος</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-gray-700">Όνομα στο κουδούνι (προεραιτικό):</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bellName || ""}
                          onChange={(e) => setBellName(e.target.value)}
                          placeholder="Γράψε το όνομα που φαίνεται στο κουδούνι"
                          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-gray-700">Σχόλιο για να διευκολυνθεί η εύρεση της κατοικίας σου (προεραιτικό):</p>
                      <div className="flex flex-col items-center gap-2">
                        <textarea
                          value={userComment || ""}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="Γράψε ό,τι θέλεις για να διευκολυνθεί να βρεθεί η τοποθεσία σου"
                          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                          rows={2}
                        />
                      </div>
                    </div>
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
                    setShowDetails(true)
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
                  const floorChanged = user.floor !== selectedFloor;
                  const bellChanged = user.bellName !== bellName;
                  const commentChanged = user.comment !== userComment;

                  if (floorChanged || bellChanged || commentChanged) {
                    handleUpdateAll(user, selectedFloor, bellName, userComment, setUser);
                  }

                  // Proceed to payment
                  setPaymentWayModal(true);
                }}
              >
                Επιβεβαίωση Πληρωμής
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentWayModal
        paymentWayModal={paymentWayModal}
        setPaymentWayModal={setPaymentWayModal}
        total={total}
        user={user}
        orderItems={orderItems}
        removeItem={removeItem}
        setIsSidebarOpen={setIsSidebarOpen}
        isTooFar={isTooFar}
        formLoaded={formLoaded}
        setFormLoaded={setFormLoaded}
        paymentWay={paymentWay}
        setPaymentWay={setPaymentWay}
        handleClickDoor={handleClickDoor}
        setShowPaymentModal={setShowPaymentModal}
      />
    </div>
  );
}
