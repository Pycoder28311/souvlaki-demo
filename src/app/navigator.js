// Navbar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./navbar.css";

export default function Navbar({scrolled = false}) {
  const [isScrolled, setIsScrolled] = useState(scrolled);
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = isScrolled
    ? "text-gray-700 hover:text-yellow-600 transition-colors"
    : "text-white hover:text-yellow-300 transition-colors";

  useEffect(() => {
  if (typeof window === "undefined") return;

  const handleScroll = () => {
    if (window.innerWidth < 768) {
      // always true on mobile
      setIsScrolled(true);
    } else {
      // on desktop respect the scrolled prop if passed
      if (scrolled) {
        setIsScrolled(true);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    }
  };

  // run once on mount
  handleScroll();

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
  }, [scrolled]);

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

          <div className="flex-1 flex justify-center hidden md:flex space-x-8">
            <Link href="/" className={linkClass}>Αρχική</Link>
            <Link href="/menu" className={linkClass}>Μενού</Link>
            <Link href="/about" className={linkClass}>Σχετικά</Link>
            <Link href="/contact" className={linkClass}>Επικοινωνία</Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              className={`px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                isScrolled ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900"
              }`}
            >
              Παράγγειλε Τώρα
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="relative w-8 h-8 flex items-center justify-center focus:outline-none z-30"
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
          <button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded font-bold">
            Παρήγγειλε
          </button>
        </div>
      </div>
    </nav>
  );
}
