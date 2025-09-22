// src/components/AppWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navigator";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 👇 check if pathname matches specific routes
  const scrolled =
    pathname === "/all-orders" ||
    pathname === "/orders-history" ||
    pathname === "/profile";

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>{children}</main>
    </>
  );
}
