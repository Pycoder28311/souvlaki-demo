"use client";

import { usePathname } from "next/navigation";
import Navbar from "../z-components/navigator";
import { useState } from 'react';
import OrderSidebar from "./cart";
import EditModal from '../menu/editModal';
import { OrderItem } from "../types"; 
import { CartProvider } from "./cartContext";
import Footer from "../z-components/footer";
import CartToggleButton from "./cartToggleButton";

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

  const noFooterExactPaths = [
    "/auth/signout",
    "/auth/signin",
    "/auth/signup",
    "/auth/login-options",
    "/auth/error",
    "/success",
    "/cancel",
    "/auth/email-reset-input",
    "/auth/reset-password",
    "/live-orders",
    "/orders-history",
    "/all-orders",
    "/profile",
    "/schedule-manage",
  ];

  const noCartExactPaths = [
    "/auth/signout",
    "/auth/signin",
    "/auth/signup",
    "/auth/login-options",
    "/auth/error",
    "/success",
    "/cancel",
    "/auth/email-reset-input",
    "/auth/reset-password",
    "/live-orders",
    "/all-orders",
    "/profile",
    "/schedule-manage",
  ];

  const scrolledPaths = [
    "/all-orders", 
    "/orders-history", 
    "/profile", 
    "/messages", 
    "/live-orders", 
    "/schedule-manage",
  ];

  const scrolled = scrolledPaths.includes(pathname);
  const hideFooterExact = noFooterExactPaths.includes(pathname);
  const hideNavbarExact = noNavbarExactPaths.includes(pathname);
  const hidePrefix = noNavbarPrefixPaths.some(prefix => pathname.startsWith(prefix));

  const showNavbar = !(hideNavbarExact || hidePrefix);
  const showFooter = !(hideFooterExact || hidePrefix);
  const hideCartPaths = noCartExactPaths.includes(pathname);
  
  const [editableOrderItem, setEditableOrderItem] = useState<OrderItem | null>(null);

  return (
    <CartProvider>
      {showNavbar && <Navbar scrolled={scrolled} isLive={pathname === "/live-orders" || pathname === "/all-orders"}/>}
      <main>{children}</main>
      <>
        <OrderSidebar setEditableOrderItem={setEditableOrderItem}/>

        {!hideCartPaths && <CartToggleButton />}

        {editableOrderItem && (
          <EditModal
            orderItem={editableOrderItem}
            defaultSelectedIngredients={editableOrderItem.selectedIngredients || []} // 👈 pass default ingredients
            onClose={() => setEditableOrderItem(null)}
          />
        )}

      </>
      {showFooter && <Footer/>}
    </CartProvider>
  );
}
