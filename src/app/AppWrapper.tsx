"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navigator";

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

  const scrolledPaths = ["/all-orders", "/orders-history", "/profile", "/messages"];
  const scrolled = scrolledPaths.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar scrolled={scrolled} />}
      <main>{children}</main>
    </>
  );
}
