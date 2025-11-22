import { useState } from "react";
import { CustomTimePicker } from "./customTimePicker";

interface TimeInterval {
  open: string;
  close: string;
}

// Helper: convert "HH:MM" to minutes
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Days of the week
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Intervals() {
  // Store intervals per day
  const [weeklyIntervals, setWeeklyIntervals] = useState<Record<string, TimeInterval[]>>(
    () =>
      DAYS.reduce((acc, day) => {
        acc[day] = [{ open: "", close: "" }];
        return acc;
      }, {} as Record<string, TimeInterval[]>)
  );

  // Update a specific interval for a day
  const updateInterval = (day: string, index: number, field: "open" | "close", value: string) => {
    setWeeklyIntervals((prev) => ({
      ...prev,
      [day]: prev[day].map((interval, i) =>
        i === index ? { ...interval, [field]: value } : interval
      ),
    }));
  };

  // Add a new interval for a day
  const addInterval = (day: string) => {
    setWeeklyIntervals((prev) => ({
      ...prev,
      [day]: [...prev[day], { open: "", close: "" }],
    }));
  };

  // Remove an interval for a day
  const removeInterval = (day: string, index: number) => {
    setWeeklyIntervals((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
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

          {weeklyIntervals[day].map((interval, index) => {
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

                {weeklyIntervals[day].length > 1 && (
                  <button
                    className="absolute top-2 right-2 text-red-500 font-bold"
                    onClick={() => removeInterval(day, index)}
                  >
                    ✕
                  </button>
                )}
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
