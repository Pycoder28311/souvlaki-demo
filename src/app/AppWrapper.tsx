"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navigator";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // default to empty string

  const noNavbarPaths = [
    "/auth/signout",
    "/auth/signin",
    "/auth/signup",
    "/login-option",
  ];

  const showNavbar = !noNavbarPaths.includes(pathname);

  const scrolledPaths = ["/all-orders", "/orders-history", "/profile", "/messages"];
  const scrolled = scrolledPaths.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar scrolled={scrolled} />}
      <main>{children}</main>
    </>
  );
}
