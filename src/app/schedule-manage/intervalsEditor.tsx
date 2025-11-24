"use client";

import { useState, useEffect } from "react";
import { CustomTimePicker } from "./customTimePicker";
import { Trash2, Plus, X } from "lucide-react";

interface TimeInterval {
  id: number;
  open: string;
  close: string;
}

// Helper: convert "HH:MM" to minutes
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Days of the week
export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAYS_GR: Record<string, string> = {
  Monday: "Δευτέρα",
  Tuesday: "Τρίτη",
  Wednesday: "Τετάρτη",
  Thursday: "Πέμπτη",
  Friday: "Παρασκευή",
  Saturday: "Σάββατο",
  Sunday: "Κυριακή",
};

export default function Intervals() {
  // Store intervals per day
  const [weeklyIntervals, setWeeklyIntervals] = useState<Record<string, TimeInterval[]>>(
    () => DAYS.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {} as Record<string, TimeInterval[]>)
  );

  useEffect(() => {
    const fetchIntervals = async () => {
      try {
        const res = await fetch("/api/schedule-intervals");
        if (!res.ok) throw new Error("Failed to fetch weekly intervals");

        const data = await res.json();
        setWeeklyIntervals(data.weeklyIntervals);
      } catch (error) {
        console.error(error);
      }
    };

    fetchIntervals();
  }, []);

  // Update a specific interval for a day
  const updateInterval = async (
    id: number,
    day: string,
    index: number,
    field: "open" | "close",
    value: string
  ) => {

    try {
      // 1️⃣ Update interval in database
      const res = await fetch("/api/schedule-intervals/interval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          field,
          value,
        }),
      });

      if (!res.ok) throw new Error("Failed to update interval");

      const updated = await res.json(); // { interval: { open, close, ... } }

      // 2️⃣ Update local state correctly
      setWeeklyIntervals((prev) => ({
        ...prev,
        [day]: prev[day].map((interval, i) =>
          i === index
            ? {
                ...interval,
                [field]: updated.interval[field], // ✅ the correct value
              }
            : interval
        ),
      }));
    } catch (error) {
      console.error("Error updating interval:", error);
    }
  };

  // Add a new interval for a day
  const addInterval = async (day: string) => {
    try {
      // 1️⃣ Create the interval in the database with default values
      const res = await fetch(`/api/schedule-intervals/${day}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open: "04:00", close: "10:00" }), // default times
      });

      if (!res.ok) throw new Error("Failed to create interval");

      const data = await res.json();
      const newInterval = {
        id: data.interval.id,
        open: data.interval.open,
        close: data.interval.close,
      };

      // 2️⃣ Update local state
      setWeeklyIntervals((prev) => ({
        ...prev,
        [day]: [...(prev[day] ?? []), newInterval],
      }));
    } catch (error) {
      console.error("Error adding interval:", error);
    }
  };

  // Remove an interval for a day
  const removeInterval = async (id: number, day: string) => {

    try {
      const res = await fetch("/api/schedule-intervals/interval", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete interval");

      // Remove from local state
      setWeeklyIntervals((prev) => ({
        ...prev,
        [day]: prev[day].filter((interval) => interval.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting interval:", error);
    }
  };

  const normalize = (h: number) => (h + 20) % 24;

  const getDisabledHours = (
    intervals: TimeInterval[],
    index: number,
    isClosePicker: boolean
  ): number[] => {
    const disabled = new Set<number>();
    const current = intervals[index];

    const currentOpen = current.open ? timeToMinutes(current.open) : null;
    const currentClose = current.close ? timeToMinutes(current.close) : null;

    const normalizedCurrentOpen =
      currentOpen !== null ? normalize(parseInt(current.open!.split(":")[0])) : null;

    const normalizedCurrentClose =
      currentClose !== null ? normalize(parseInt(current.close!.split(":")[0])) : null;

    // --- BLOCK HOURS INSIDE OTHER INTERVALS ---
    intervals.forEach((interval, i) => {
      if (i === index) return; // skip same interval
      if (!interval.open || !interval.close) return;

      const otherOpen = timeToMinutes(interval.open);
      let otherClose = timeToMinutes(interval.close);

      // Handle midnight-crossing intervals
      if (otherClose <= otherOpen) otherClose += 1440;

      for (let h = 0; h < 24; h++) {
        const start = h * 60;
        const end = start + 59;

        // Shift early hours (00–03) into "next day"
        const s = start < 240 ? start + 1440 : start;
        const e = end < 240 ? end + 1440 : end;

        if (e >= otherOpen && s < otherClose) {
          disabled.add(h); // block overlapping hours
        }
      }
    });

    // --- SAME INTERVAL RULES ---
    for (let h = 0; h < 24; h++) {
      const nh = normalize(h); // normalized for 4AM-day comparison

      // CLOSE picker → close must be AFTER open
      if (isClosePicker && normalizedCurrentOpen !== null) {
        if (nh < normalizedCurrentOpen) disabled.add(h);
      }

      // OPEN picker → open must be BEFORE close
      if (!isClosePicker && normalizedCurrentClose !== null) {
        if (nh > normalizedCurrentClose) disabled.add(h);
      }
    }

    return Array.from(disabled);
  };

  return (
    <div className="flex flex-col gap-8">
      {DAYS.map((day) => (
        <div key={day} className="border p-4 rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="font-bold text-lg">{DAYS_GR[day]}</h2>

            {weeklyIntervals && weeklyIntervals[day]?.length > 0 ? (
              weeklyIntervals[day].some(interval => interval.open === "04:00" && interval.close === "03:59") ? (
                <span className="px-2 py-1.5 bg-green-200 rounded-xl text-sm font-semibold">
                  Άνοιγμα όλη την ημέρα
                </span>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {weeklyIntervals[day].map(interval => (
                    <span
                      key={interval.id}
                      className="px-2 py-1.5 bg-gray-200 rounded-xl text-sm"
                    >
                      {interval.open} - {interval.close}
                    </span>
                  ))}
                </div>
              )
            ) : (
              <span className="text-gray-400 text-sm">Κλειστά</span>
            )}

            <button
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              onClick={async () => {
                const allDayInterval = weeklyIntervals[day]?.find(
                  interval => interval.open === "04:00" && interval.close === "03:59"
                );

                if (allDayInterval) {
                  // Delete the all-day interval first
                  await fetch(`/api/schedule-intervals/${day}/${allDayInterval.id}`, { method: "DELETE" });
                  setWeeklyIntervals(prev => ({
                    ...prev,
                    [day]: prev[day].filter(interval => interval.id !== allDayInterval.id)
                  }));
                }

                // Then add the new interval
                addInterval(day);
              }}
              title="Πρόσθεσε Διάστημα"
            >
              <span>Πρόσθεσε Διάστημα</span>
              <Plus className="w-4 h-4" />
            </button>

            <button
              className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/schedule-intervals/${day}/delete`, {
                    method: "DELETE",
                  });
                  if (!res.ok) throw new Error("Failed to delete intervals");
                  // Update local state after deletion
                  setWeeklyIntervals((prev) => ({ ...prev, [day]: [] }));
                } catch (error) {
                  console.error(error);
                }
              }}
              title="Κλείσιμο όλη μέρα"
            >
              <span>Κλείσιμο όλη μέρα</span>
              <X className="w-4 h-4" />
            </button>

            <button
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              onClick={async () => {
                const res = await fetch(`/api/schedule-intervals/${day}/open-all-day`, { method: "POST" });
                const data = await res.json();

                if (data?.interval) {
                  // Update weeklyIntervals state directly
                  setWeeklyIntervals((prev) => ({
                    ...prev,
                    [day]: [data.interval], // replace all intervals with the new all-day interval
                  }));
                }
              }}
              title="Άνοιξε όλη την ημέρα"
            >
              <span>Άνοιξε όλη την ημέρα</span>
            </button>
          </div>

          {weeklyIntervals && weeklyIntervals[day]?.length > 0 && weeklyIntervals[day].map((interval, index) => {
            const disabledOpenHours = getDisabledHours(weeklyIntervals[day], index, false);
            const disabledCloseHours = getDisabledHours(weeklyIntervals[day], index, true);

            return (
              <div key={index} className="flex gap-2 border p-4 rounded-xl relative">
                <CustomTimePicker
                  label="Ώρα Άνοιγμα"
                  value={interval.open}
                  onChange={(val) => updateInterval(interval.id, day, index, "open", val)}
                  placeholder="Επιλέξτε ώρα ανοίγματος"
                  hasError={!interval.open}
                  closeHour={interval.close}
                  disabledHours={disabledOpenHours}
                  currentDay={day}
                />

                <CustomTimePicker
                  label="Ώρα Κλείσιμο"
                  value={interval.close}
                  onChange={(val) => updateInterval(interval.id, day, index, "close", val)}
                  placeholder="Επιλέξτε ώρα κλεισίματος"
                  hasError={!interval.close}
                  isClosePicker={true}
                  openHour={interval.open}
                  disabledHours={disabledCloseHours}
                  currentDay={day}
                />

                <button
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm w-auto h-auto"
                  onClick={() => removeInterval(interval.id, day)}
                  title="Διαγραφή"
                >
                  <span>Διαγραφή</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
