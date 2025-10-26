import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cartContext";

export default function CartToggleButton() {
  const { isSidebarOpen, setIsSidebarOpen } = useCart();

  if (isSidebarOpen) return;

  return (
    <>
      {/* Desktop button */}
      <button
        className="hidden md:flex fixed right-0 top-[90px] -translate-y-1/2 px-3 py-2 bg-green-600 text-white rounded-l z-40 items-center justify-center"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open Cart"
      >
        <ShoppingCart className="w-8 h-8" />
      </button>

      {/* Mobile button */}
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
    </>
  );
}
