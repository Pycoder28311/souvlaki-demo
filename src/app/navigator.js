// Navbar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./navbar.css";
import { FiShoppingCart } from "react-icons/fi";

export default function Navbar({scrolled = false}) {
  const [isScrolled, setIsScrolled] = useState(scrolled);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : 'navbar-default'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`navbar-logo ${isScrolled ? 'scrolled' : ''}`}>
              ΣΟΥΒΛΑΚΙΑ
            </span>
          </Link>

          <div className="flex-1 flex justify-center hidden md:flex space-x-8 ml-40">
            <Link href="/" className={linkClass}>Αρχική</Link>
            <Link href="/menu" className={linkClass}>Μενού</Link>
            <Link href="/about" className={linkClass}>Σχετικά</Link>

            {business ? (
              <>
                <Link href="/messages" className={linkClass}>Μηνύματα</Link>
                <Link href="/orders-list" className={linkClass}>Παραγγελίες</Link>
              </>
            ) : (
              <Link href="/contact" className={linkClass}>Επικοινωνία</Link>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <div className="flex space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`flex px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                    isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
                  }`}
                >
                  {user.name}
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/signin"
                  className={`px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                    isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
                  }`}
                >
                  Σύνδεση
                </Link>
                <Link
                  href="/auth/signup"
                  className={`px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                    isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
                  }`}
                >
                  Εγγραφή
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className={'md:hidden'}>
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

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-white z-20 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-y-10" : "-translate-y-full"
        }`}
      >
        <div className="px-2 pt-10 pb-6 space-y-4 sm:px-3">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Αρχική
          </Link>
          <Link
            href="/menu"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Μενού
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Σχετικά
          </Link>
          <Link
            href="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            Επικοινωνία
          </Link>
        </div>
        <div className="px-4 pb-4 space-y-2">
          <button
            className={`w-full flex items-center justify-center px-6 py-3 font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
              isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
            }`}
          >
            <FiShoppingCart className="mr-2" size={24} />
            Καλάθι
          </button>
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
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{user?.name}</h2>
          <ul className="space-y-4">
            <li>
              <Link href="/profile" className="hover:text-yellow-600">Προφίλ</Link>
            </li>
            <li>
              <Link href="/orders-history/" className="hover:text-yellow-600">Οι Παραγγελίες μου</Link>
            </li>
            <Link
              href="/api/auth/signout"
              className={`px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
              }`}
            >
              Αποσύνδεση
            </Link>
          </ul>
        </div>
      </div>
    </nav>
  );
}
