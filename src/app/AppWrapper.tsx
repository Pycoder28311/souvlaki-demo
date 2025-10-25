"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navigator";

import { useState, useEffect } from 'react';
import OrderSidebar from "./cart";
import EditModal from './menu/editModal';
import { ShoppingCart } from "lucide-react";
import { OrderItem } from "./types"; 
import { CartProvider } from "./cartContext";
import Footer from "./footer";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // default to empty string

  const noNavbarExactPaths = [
    "/auth/signout",
    "/auth/signin",
    "/auth/signup",
    "/auth/login-options",
    "/auth/error",
    "/success",
    "/cancel",
    "/auth/email-reset-input",
    "/auth/reset-password",
  ];
  
  const noNavbarPrefixPaths = [
    "/auth/error",
    "/auth/reset-password",
  ];

  const hideNavbarExact = noNavbarExactPaths.includes(pathname);

  // check prefix matches
  const hideNavbarPrefix = noNavbarPrefixPaths.some(prefix => pathname.startsWith(prefix));

  const showNavbar = !(hideNavbarExact || hideNavbarPrefix);

  const scrolledPaths = ["/all-orders", "/orders-history", "/profile", "/messages", "/live-orders"];
  const scrolled = scrolledPaths.includes(pathname);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editableOrderItem, setEditableOrderItem] = useState<OrderItem | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("orderItems");
      if (stored) {
        setOrderItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse orderItems from localStorage:", err);
    }
  }, []); // run once on mount

  // Save to localStorage whenever orderItems change
  useEffect(() => {
    localStorage.setItem("orderItems", JSON.stringify(orderItems));
  }, [orderItems]);

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

  return (
    <>
      <CartProvider>
        {showNavbar && <Navbar scrolled={scrolled} isLive={pathname === "/live-orders"} />}
        <main>{children}</main>
        <>
          <OrderSidebar
            setEditableOrderItem={setEditableOrderItem}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          {/* Open Sidebar Button */}
          {!isSidebarOpen && (
            <button
              className="hidden md:flex fixed right-0 top-[90px] -translate-y-1/2 px-3 py-2 bg-green-600 text-white rounded-l z-40 items-center justify-center"
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
            />
          )}
        </>
        <Footer/>
      </CartProvider>
    </>
  );
}
