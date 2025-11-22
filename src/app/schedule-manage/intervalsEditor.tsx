"use client";

import { useState, useEffect } from "react";
import { CustomTimePicker } from "./customTimePicker";

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

      const updatedInterval = await res.json();

      // 2️⃣ Update local state
      setWeeklyIntervals((prev) => ({
        ...prev,
        [day]: prev[day].map((interval, i) =>
          i === index ? { ...interval, [field]: updatedInterval[field] } : interval
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
        body: JSON.stringify({ open: "04:00", close: "04:00" }), // default times
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
        [day]: [...prev[day], newInterval],
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

  // Get disabled hours to prevent overlap within a day
  const getDisabledHours = (intervals: TimeInterval[], index: number, isClosePicker: boolean): number[] => {
    const disabled: number[] = [];
    const current = intervals[index];
    const currentOpen = current.open ? timeToMinutes(current.open) : null;
    const currentClose = current.close ? timeToMinutes(current.close) : null;

    intervals.forEach((interval, i) => {
      if (i === index) return;
      const otherOpen = interval.open ? timeToMinutes(interval.open) : null;
      const otherClose = interval.close ? timeToMinutes(interval.close) : null;

      if (otherOpen !== null && otherClose !== null) {
        for (let h = 0; h < 24; h++) {
          const hourStart = h * 60;
          const hourEnd = h * 60 + 59;

          if (isClosePicker) {
            if (currentOpen !== null && hourEnd <= currentOpen) continue;
            if ((hourStart >= otherOpen && hourStart < otherClose) || (hourEnd >= otherOpen && hourEnd < otherClose)) {
              disabled.push(h);
            }
          } else {
            if (currentClose !== null && hourStart >= currentClose) continue;
            if ((hourStart >= otherOpen && hourStart < otherClose) || (hourEnd >= otherOpen && hourEnd < otherClose)) {
              disabled.push(h);
            }
          }
        }
      }
    });

    return Array.from(new Set(disabled));
  };

  return (
    <div className="p-10 flex flex-col gap-8">
      {DAYS.map((day) => (
        <div key={day} className="border p-4 rounded flex flex-col gap-4">
          <h2 className="font-bold text-lg">{day}</h2>

          {weeklyIntervals && weeklyIntervals[day]?.length > 0 && weeklyIntervals[day].map((interval, index) => {
            const disabledOpenHours = getDisabledHours(weeklyIntervals[day], index, false);
            const disabledCloseHours = getDisabledHours(weeklyIntervals[day], index, true);

            return (
              <div key={index} className="flex flex-col gap-2 border p-4 rounded relative">
                <CustomTimePicker
                  label="Open Hour"
                  value={interval.open}
                  onChange={(val) => updateInterval(day, index, "open", val)}
                  placeholder="Select opening time"
                  hasError={!interval.open}
                  closeHour={interval.close}
                  disabledHours={disabledOpenHours}
                  currentDay={day}
                />

                <CustomTimePicker
                  label="Close Hour"
                  value={interval.close}
                  onChange={(val) => updateInterval(day, index, "close", val)}
                  placeholder="Select closing time"
                  hasError={!interval.close}
                  isClosePicker={true}
                  openHour={interval.open}
                  disabledHours={disabledCloseHours}
                  currentDay={day}
                />

                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => removeInterval(interval.id, day)}
                >
                  Delete
                </button>
              </div>
            );
          })}

          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded w-36"
            onClick={() => addInterval(day)}
          >
            + Add Interval
          </button>
        </div>
      ))}
    </div>
  );
}
