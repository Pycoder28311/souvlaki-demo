// Navbar.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import Link from "next/link";
import "./navbar.css";
import Image from "next/image";
import { X } from "lucide-react";
import CreatedOrderModal from "./createdOrderModal";
import { useCart } from "../wrappers/cartContext";
import AddressModal from "./addressPanel";

export default function Navbar({scrolled = false, isLive }) {
  const [isScrolled, setIsScrolled] = useState(scrolled);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, address, showRadiusNote, setIsSidebarOpen } = useCart();

  // derive business from user
  const business = user?.business ?? false;

  const linkClass = isScrolled
    ? "text-gray-700 hover:text-yellow-600 transition-colors"
    : "text-white hover:text-yellow-300 transition-colors";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setIsScrolled(true);
      } else {
        if (scrolled) {
          setIsScrolled(true);
        } else {
          setIsScrolled(window.scrollY > 50);
        }
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrolled]);

  const handleClick = () => {
    if (user) {
      setIsSidebarOpen(false);
      setSidebarOpen((v) => !v) // toggle sidebar
    } else {
      router.push("/auth/signin") // redirect to login
    }
  }

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : 'navbar-default'}`}>
      {showRadiusNote && (
        <div className="fixed right-4 z-50 w-80 bg-yellow-200 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded shadow-lg flex justify-between items-start">
          <span className="font-semibold">
            Παρακαλώ ορίστε τη μέγιστη απόσταση delivery{" "}
            <Link href="/profile" className="underline">
              Εδώ!
            </Link>
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* Logo image */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-yellow-400 md:bg-transparent">
              <Image
                src="/favicon.ico" // your favicon
                alt="Logo"
                fill
                style={{ objectFit: "cover" }} // cover ensures it fills the circle
              />
            </div>

            {/* Text, hidden on small screens */}
            <span
              className={`ml-2 font-bold text-xl hidden md:inline ${isScrolled ? "text-gray-900" : "text-white"}`}
            >
              ΣΟΥΒΛΑΚΙΑ
            </span>
          </Link>

          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex space-x-8">
            <Link href="/" className={linkClass}>Αρχική</Link>
            <Link href="/menu" className={linkClass}>Μενού</Link>
            <Link href="/about" className={linkClass}>Σχετικά</Link>
            {business ? (
              <Link 
                href="/live-orders" 
                className={linkClass}
              >
                Παραγγελίες Live
              </Link>
            ) : (
              <Link href="/contact" className={linkClass}>Επικοινωνία</Link>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`flex px-4 py-2 font-bold transition-all duration-300 transform rounded-lg ${
                    isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
                  }`}
                >
                  {user.name}
                </button>
              </div>
            ) : (
              <div className="flex space-x-4" onClick={() => setIsSidebarOpen(false)}>
                <Link
                  href="/auth/signin"
                  className={`px-4 py-2 font-bold transition-all duration-300 transform rounded-lg ${
                    isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
                  }`}
                >
                  Σύνδεση
                </Link>
                <Link
                  href="/auth/login-options"
                  className={`px-4 py-2 font-bold transition-all duration-300 transform rounded-lg ${
                    isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
                  }`}
                >
                  Εγγραφή
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" onClick={() => setIsSidebarOpen(false)}>
            <AddressModal />
          </div>

          <div className="md:hidden flex items-center justify-end space-x-2">
            {/* Mobile profile icon */}
            <div>
              <button
                onClick={handleClick}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 focus:outline-none"
                aria-label={sidebarOpen ? "Close profile sidebar" : "Open profile sidebar"}
              >
                <span className="w-full h-full flex items-center justify-center bg-gray-300 text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <div>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="relative w-8 h-8 flex items-center justify-center focus:outline-none"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {/* Top bar */}
                <span
                  className={`absolute left-1/2 top-1/2 w-8 h-0.5 bg-gray-900 transform transition duration-300 origin-center
                    ${mobileOpen ? 'rotate-45 -translate-x-1/2 -translate-y-0' : '-translate-x-1/2 -translate-y-2.5'}`}
                />
                {/* Middle bar */}
                <span
                  className={`absolute left-1/2 top-1/2 w-8 h-0.5 bg-gray-900 transform transition duration-300 origin-center
                    ${mobileOpen ? 'opacity-0 -translate-x-1/2' : '-translate-x-1/2 translate-y-0'}`}
                />
                {/* Bottom bar */}
                <span
                  className={`absolute left-1/2 top-1/2 w-8 h-0.5 bg-gray-900 transform transition duration-300 origin-center
                    ${mobileOpen ? '-rotate-45 -translate-x-1/2 -translate-y-0' : '-translate-x-1/2 translate-y-2.5'}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {(business && !isLive) && <CreatedOrderModal />}

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-white z-20 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-y-13" : "-translate-y-full"
        }`}
      >
        <div className="px-4 pt-10 pb-6 space-y-4 sm:px-3">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-xl font-medium text-gray-700 hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Αρχική
          </Link>
          <Link
            href="/menu"
            className="block px-3 py-2 rounded-md text-xl font-medium text-gray-700 hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Μενού
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded-md text-xl font-medium text-gray-700 hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Σχετικά
          </Link>
          {business ? (
            <Link 
              href="/live-orders" 
              className="block px-3 py-2 rounded-md text-xl font-medium text-gray-700 hover:bg-gray-600"
              onClick={() => setMobileOpen(false)}
            >
              Παραγγελίες Live
            </Link>
          ) : (
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-xl font-medium text-gray-700 hover:bg-gray-600"
              onClick={() => setMobileOpen(false)}
            >
              Επικοινωνία
            </Link>
          )}
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar from the right */}
      <div
        className={`fixed right-0 h-full w-64 bg-white shadow-xl z-80 transform transition-transform duration-300
          top-[50px] md:top-0
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Close Button aligned to the right */}
          <div className="flex justify-end mb-4 hidden lg:flex">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-200 transition w-auto"
              aria-label="Close Sidebar"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Header with Close Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-300 text-white font-bold text-lg">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col max-w-[200px]">
                <h2 className="text-lg font-semibold text-gray-800 break-words">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-500 break-words">
                  {address?.split(",")[0] || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <ul className="flex-1 flex flex-col gap-3">
            <li>
              <Link
                href="/profile"
                className="block px-4 py-2 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition"
              >
                Προφίλ
              </Link>
            </li>
            {business && (
              <>
                <li>
                  <Link
                    href="/live-orders"
                    className="block px-4 py-2 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition"
                  >
                    Παραγγελίες Live
                  </Link>
                </li>
                <li>
                  <Link
                    href="/all-orders"
                    className="block px-4 py-2 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition"
                  >
                    Όλες οι Παραγγελίες
                  </Link>
                </li>
                <li>
                  <Link
                    href="/messages"
                    className="block px-4 py-2 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition"
                  >
                    Μηνύματα
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/schedule-manage" 
                    className="block px-4 py-2 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition"
                  >
                    Διαχείρηση Ωραρίου
                  </Link>
                </li>
              </>
            )}
            {!business && (
              <li>
                <Link
                  href="/orders-history"
                  className="block px-4 py-2 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition"
                >
                  Οι Παραγγελίες μου
                </Link>
              </li>
            )}
          </ul>

          {/* Sign Out Button */}
          <div className="mt-auto pb-12 lg:pb-0">
            <Link
              href="/api/auth/signout"
              className="block w-full text-center px-4 py-2 rounded-md font-bold shadow hover:shadow-md 
                        bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-all"
            >
              Αποσύνδεση
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
