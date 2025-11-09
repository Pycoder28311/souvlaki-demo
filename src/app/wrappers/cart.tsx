// components/OrderSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import React from "react";
import { OrderItem } from "../types"; 
import { useCart } from "../wrappers/cartContext";
import {
  getUnavailableMessage,
} from "./functions/cart";
import CartBody from "./components/cart/cartBody";
import PaymentWayModal from "./components/cart/paymentWayModal";
import PaymentModal from "./components/cart/paymentModal";

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
  const { orderItems, isSidebarOpen, setIsSidebarOpen, shopOpen, user, setAddress, setSelectedFloor } = useCart();
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [hydrated, setHydrated] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentWayModal, setPaymentWayModal] = useState(false);
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
    className={`flex flex-col h-full w-full md:w-80 bg-gray-100 border-l-2 border-yellow-400 shadow-lg transition-transform duration-300
      ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
      fixed right-0 top-[55px] z-50 ${showPaymentModal ? "overflow-y-auto overflow-x-hidden" : ""}`}
    style={{
      height: `calc(100vh - 55px)`, // αφαιρεί το header
      scrollbarWidth: "thin",
      scrollbarColor: "#facc15 #e5e7eb", // yellow-400 thumb, gray-200 track
    }}
  >
    <div className="hidden">{warning}</div>
      <CartBody
        setEditableOrderItem={setEditableOrderItem}
        expandedItems={expandedItems}
        setExpandedItems={setExpandedItems}
        availabilityMap={availabilityMap}
        setAvailabilityMap={setAvailabilityMap}
        setShowPaymentModal={setShowPaymentModal}
        setPaymentWayModal={setPaymentWayModal}
        total={total}
        user={user}
        getUnavailableMessage={getUnavailableMessage}
      />

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        setFormLoaded={setFormLoaded}
        query={query}
        setQuery={setQuery}
        results={results}
        setResults={setResults}
        editingAddress={editingAddress}
        setEditingAddress={setEditingAddress}
        validRadius={validRadius}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        setWarning={setWarning}
        bellName={bellName}
        setBellName={setBellName}
        userComment={userComment}
        setUserComment={setUserComment}
        total={total}
        isTooFar={isTooFar}
        setIsSidebarOpen={setIsSidebarOpen}
        setPaymentWayModal={setPaymentWayModal}
      />

      <PaymentWayModal
        paymentWayModal={paymentWayModal}
        setPaymentWayModal={setPaymentWayModal}
        total={total}
        isTooFar={isTooFar}
        formLoaded={formLoaded}
        setFormLoaded={setFormLoaded}
        paymentWay={paymentWay}
        setPaymentWay={setPaymentWay}
        setShowPaymentModal={setShowPaymentModal}
      />
    </div>
  );
}
