"use client"

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cartContext";
import { useEffect } from "react";

export default function CartToggleButton() {
  const { isSidebarOpen, setIsSidebarOpen, shopOpen, cartMessage, user  } = useCart();

  useEffect(() => {
    if (!isSidebarOpen) return;
    if (user?.business) return;

    // Only on mobile
    if (typeof window !== "undefined" && window.innerWidth > 768) return;

    // Push a unique history state
    const sidebarState = { sidebarOpen: true };
    window.history.pushState(sidebarState, "");

    const handlePopState = () => {
      const activeEl = document.activeElement;

      // If an input is focused, do NOT close sidebar
      if (
        activeEl &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName)
      ) {
        return;
      }

      setIsSidebarOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isSidebarOpen, setIsSidebarOpen, user?.business]);

  if (isSidebarOpen || cartMessage === "Φόρτωση..." || user?.business) return;

  return (
    <>
      {cartMessage !== "Φόρτωση..." && (
        <>
          {/* Header */}
          <div className="hidden md:flex fixed right-0 top-[70px] p-4 bg-white shadow-sm border border-gray-100 rounded-l-lg">
            {!shopOpen && (
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <span className="text-red-600">🚫 Το κατάστημα είναι κλειστό</span>
                </h3>

                {cartMessage}
              </div>
            )}
          </div>

          {/* Desktop button */}
          {shopOpen && (
            <button
              className="hidden md:flex fixed right-0 top-[70px] px-3 py-2 bg-green-600 text-white rounded-l-lg shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 items-center justify-center z-40"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Άνοιγμα καλαθιού"
            >
              <ShoppingCart className="w-9 h-9" />
            </button>
          )}

          {/* Mobile button */}
          {shopOpen ? (
            <button
              className="
                md:hidden fixed bottom-4 left-4 right-4 px-6 py-3 bg-green-600 text-white
                flex items-center justify-center rounded-xl z-40
                text-xl font-semibold shadow-lg hover:bg-green-700 active:bg-green-800
                transition-colors duration-200
              "
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Άνοιγμα καλαθιού"
            > 
              Καλάθι
              <ShoppingCart className="w-7 h-7 ml-2" />
            </button>
          ) : (
            <div
              className="
                md:hidden fixed bottom-4 left-4 right-4 px-6 py-3 bg-gray-400 text-white
                flex items-center justify-center rounded-lg z-40
                text-xl font-semibold shadow-lg
              "
            >
              Το κατάστημα είναι κλειστό
              <ShoppingCart className="w-8 h-8 ml-2" />
            </div>
          )}
        </>
      )}
    </>
  );
}
