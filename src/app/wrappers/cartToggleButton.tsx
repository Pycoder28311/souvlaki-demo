"use client"

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cartContext";
import { useEffect, useState } from "react";

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type Schedule = {
  open: string | null;
  close: string | null;
};

type DayFromAPI = {
  id: number;
  dayOfWeek: Weekday;
  openHour: string | null;
  closeHour: string | null;
  alwaysClosed: boolean;
};

export default function CartToggleButton() {
  const { isSidebarOpen, setIsSidebarOpen } = useCart();
  const [weeklySchedule, setWeeklySchedule] = useState<Record<Weekday, Schedule>>({
    Monday: { open: null, close: null },
    Tuesday: { open: null, close: null },
    Wednesday: { open: null, close: null },
    Thursday: { open: null, close: null },
    Friday: { open: null, close: null },
    Saturday: { open: null, close: null },
    Sunday: { open: null, close: null },
  });

  // Fetch weekly schedule from API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule/get");
        const data = await res.json();

        if (data.weekly) {
          const scheduleMap: Record<Weekday, Schedule> = {
            Monday: { open: null, close: null },
            Tuesday: { open: null, close: null },
            Wednesday: { open: null, close: null },
            Thursday: { open: null, close: null },
            Friday: { open: null, close: null },
            Saturday: { open: null, close: null },
            Sunday: { open: null, close: null },
          };

          data.weekly.forEach((day: DayFromAPI) => {
            scheduleMap[day.dayOfWeek as Weekday] = {
              open: day.openHour || null,
              close: day.closeHour || null,
            };
          });

          setWeeklySchedule(scheduleMap);
        }
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      }
    };

    fetchSchedule();
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    // Only run on mobile (e.g., width <= 768px)
    if (typeof window !== "undefined" && window.innerWidth > 768) return;

    // Push a dummy state when the sidebar opens
    window.history.pushState({ sidebar: true }, "");

    const handlePopState = () => {
      if (isSidebarOpen) {
        // Close sidebar instead of going back
        setIsSidebarOpen(false);
        // Optionally re-push state if needed
        // window.history.pushState({ sidebar: true }, "");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  const isShopOpenNow = (): boolean => {
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" }) as Weekday;
    const schedule = weeklySchedule[dayName];
    if (!schedule?.open || !schedule?.close) return false;

    const [openH, openM] = schedule.open.split(":").map(Number);
    const [closeH, closeM] = schedule.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (closeMinutes < openMinutes) {
      // Overnight
      return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
    }

    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  };
  
  const shopOpen = isShopOpenNow();
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }) as Weekday;
  const todaySchedule = weeklySchedule[dayName];

  if (isSidebarOpen) return;

  return (
    <>
      {/* Header */}
      <div className="hidden md:flex fixed right-0 top-[70px] p-4 bg-white shadow-sm border border-gray-100 rounded-l-lg">
        {!shopOpen && (
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
              <span className="text-red-600">🚫 Το κατάστημα είναι κλειστό</span>
            </h3>

            {todaySchedule?.open ? (
              <p className="text-sm text-gray-600">
                Ώρες λειτουργίας σήμερα:{" "}
                <span className="font-medium text-gray-800">
                  {todaySchedule.open} - {todaySchedule.close}
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-600">Κλειστά σήμερα</p>
            )}
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
            flex items-center justify-center rounded-lg z-40
            text-lg font-semibold shadow-lg hover:bg-green-700 active:bg-green-800
            transition-colors duration-200
          "
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Άνοιγμα καλαθιού"
        >
          <ShoppingCart className="w-7 h-7 mr-2" /> Καλάθι
        </button>
      ) : (
        <div
          className="
            md:hidden fixed bottom-4 left-4 right-4 px-6 py-3 bg-red-600 text-white
            flex items-center justify-center rounded-lg z-40
            text-lg font-semibold shadow-lg
          "
        >
          🚫 Το κατάστημα είναι κλειστό
        </div>
      )}
    </>
  );
}
