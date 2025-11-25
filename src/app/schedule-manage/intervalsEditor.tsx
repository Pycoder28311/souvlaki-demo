"use client";

import { CustomTimePicker } from "./customTimePicker";
import { Trash2, Plus, X } from "lucide-react";
import { Interval } from "../types";
import { ALL_DAY_OPEN, ALL_DAY_CLOSE, DEFAULT_OPEN, DEFAULT_CLOSE } from "../utils/hours";

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

type WeeklyIntervals = Record<string, Interval[]>;

type IntervalsProps = {
  days: string[];   // array of day names
  object: string;   // object name
  id?: number;       // object id
  intervals: WeeklyIntervals;
  setIntervals: React.Dispatch<React.SetStateAction<WeeklyIntervals>>;
  productId?: number;
  categoryId?: number;
};

interface AddIntervalBody {
  open: string;
  close: string;
  object?: string;
  id?: number;
}

export default function Intervals({ days, object, id, intervals, setIntervals, productId, categoryId }: IntervalsProps) {
  // Store intervals per day

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
      const res = await fetch("/api/schedule-intervals/delete-put-interval", {
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
      setIntervals((prev) => ({
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
      let url = `/api/schedule-intervals/days/${day}/add`;
      let body: AddIntervalBody = { open: DEFAULT_OPEN, close: DEFAULT_CLOSE }; // default times

      // If object is NOT "week", use the add endpoint and include object + id
      if (object !== "week") {
        url = `/api/schedule-intervals/add-interval`;
        body = { ...body, object, id };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create interval");

      const data = await res.json();
      const [closeH] = data.interval.close.split(":").map(Number);
      const isAfterMidnight = closeH >= 0 && closeH < 4;

      const newInterval = {
        id: data.interval.id,
        open: data.interval.open,
        close: data.interval.close,
        isAfterMidnight, // mark if closes after midnight but before 4am
      };

      // Update local state
      setIntervals((prev) => {
        // If object !== week → store under object key, else under day
        const key = day;
        return {
          ...prev,
          [key]: [...(prev[key] ?? []), newInterval],
        };
      });
    } catch (error) {
      console.error("Error adding interval:", error);
    }
  };

  // Remove an interval for a day
  const removeInterval = async (id: number, day: string) => {

    try {
      const res = await fetch("/api/schedule-intervals/delete-put-interval", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete interval");

      // Remove from local state
      setIntervals((prev) => ({
        ...prev,
        [day]: prev[day].filter((interval) => interval.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting interval:", error);
    }
  };

  const normalize = (h: number) => (h + 20) % 24;

  const getDisabledHours = (
    intervals: Interval[],
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
      {days.map((day) => (
        <div key={day} className="border p-4 rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-2 w-full">
              {object === "week" && (
                <h2 className="font-bold text-lg">{DAYS_GR[day]}</h2>
              )}

              {(intervals && intervals[day]?.length > 0) ? (
                intervals[day].some(interval => interval.open === ALL_DAY_OPEN && interval.close === ALL_DAY_CLOSE) ? (
                  <span className="px-2 py-1.5 bg-green-200 rounded-xl text-sm font-semibold">
                    Άνοιγμα όλη την ημέρα
                  </span>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {intervals[day].map(interval => (
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
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                onClick={async () => {
                  const url =
                    object === "week"
                      ? `/api/schedule-intervals/days/${day}/delete`
                      : object === "product"
                        ? `/api/schedule-intervals/close-all-day/product`
                        : object === "category"
                          ? `/api/schedule-intervals/close-all-day/category`
                          : "";

                  const body =
                    object === "product"
                      ? { productId }            // <-- send product ID
                      : object === "category"
                        ? { categoryId }         // <-- send category ID
                        : {};
                  try {
                    const res = await fetch(url, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(body),
                    });
                    if (!res.ok) throw new Error("Failed to delete intervals");
                    // Update local state after deletion
                    setIntervals((prev) => ({ ...prev, [day]: [] }));
                  } catch (error) {
                    console.error(error);
                  }
                }}
                title="Κλείστά όλη μέρα"
              >
                <span>Κλειστά όλη μέρα</span>
                <X className="w-4 h-4" />
              </button>

              <button
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                onClick={async () => {
                  const week = day;
                  const base =
                    object === "week"
                      ? week
                      : object === "product"
                        ? "product"
                        : object === "category"
                          ? "category"
                          : "";

                  const body =
                    object === "product"
                      ? { productId }            // <-- send product ID
                      : object === "category"
                        ? { categoryId }         // <-- send category ID
                        : {};

                  const res = await fetch(`/api/schedule-intervals/open-all-days/${base}`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                  });
                  const data = await res.json();

                  if (data?.interval) {
                    // Update weeklyIntervals state directly
                    setIntervals((prev) => ({
                      ...prev,
                      [day]: [data.interval], // replace all intervals with the new all-day interval
                    }));
                  }
                }}
                title="Άνοιχτα όλη την ημέρα"
              >
                <span>Άνοιχτά όλη την ημέρα</span>
              </button>

              <button
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                onClick={async () => {
                  const allDayInterval = intervals[day]?.find(
                    interval => interval.open === ALL_DAY_OPEN && interval.close === ALL_DAY_CLOSE
                  );

                  if (allDayInterval) {
                    // Delete the all-day interval first
                    await fetch(`/api/schedule-intervals/days/${day}/${allDayInterval.id}`, { method: "DELETE" });
                    setIntervals(prev => ({
                      ...prev,
                      [day]: prev[day].filter(interval => interval.id !== allDayInterval.id)
                    }));
                  }

                  // Then add the new interval
                  addInterval(day);
                }}
                title="Πρόσθεσε Διάστημα"
              >
                <span>Πρόσθήκη Διαστήματος</span>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {intervals && intervals[day]?.length > 0 && intervals[day].map((interval, index) => {
            const isDefaultInterval =
              interval.open === ALL_DAY_OPEN && interval.close === ALL_DAY_CLOSE;

            if (isDefaultInterval) return null;

            const disabledOpenHours = getDisabledHours(intervals[day], index, false);
            const disabledCloseHours = getDisabledHours(intervals[day], index, true);

            return (
              <div key={index} className="flex gap-2 border p-4 rounded-xl">
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
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm self-end"
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
