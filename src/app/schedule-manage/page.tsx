"use client";

import { useEffect, useState } from "react";
import { useCart } from "../wrappers/cartContext";

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";


interface Day {
  id: number;
  dayOfWeek: string;
  openHour: string | null;
  closeHour: string | null;
  alwaysClosed: boolean;
}

interface Override {
  id?: number;
  date: string;
  openHour: string | null;
  closeHour: string | null;
  alwaysClosed: boolean;
}

export default function ScheduleManager() {
  const [weekly, setWeekly] = useState<Day[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { user } = useCart();

  useEffect(() => {
    const weekdays: Weekday[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    ];
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule/get");
        const data = await res.json();

        const dbWeekly: Day[] = data.weekly || [];

        // Ensure all weekdays exist
        const fullWeekly: Day[] = weekdays.map((day) => {
          const found = dbWeekly.find((d) => d.dayOfWeek === day);
          return (
            found || {
              id: Math.random(), // temp id
              dayOfWeek: day,
              openHour: "",
              closeHour: "",
              alwaysClosed: false,
            }
          );
        });

        setWeekly(fullWeekly);
        setOverrides(data.overrides || []);
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      }
    };

    fetchSchedule();
  }, []);

  // Validate weekly schedule before saving
  const validateSchedule = () => {
    const missing: string[] = [];

    for (const d of weekly) {
      if (!d.alwaysClosed && (!d.openHour || !d.closeHour)) {
        missing.push(d.dayOfWeek);
      }
    }

    setErrors(missing);
    return missing.length === 0;
  };

  const handleSave = async () => {
    if (!validateSchedule()) return alert("⚠️ Συμπλήρωσε τις ώρες για όλες τις ημέρες.");

    setLoading(true);
    const res = await fetch("/api/schedule/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekly, overrides }),
    });
    setLoading(false);
    if (res.ok) alert("✅ Το ωράριο αποθηκεύτηκε!");
    else alert("❌ Σφάλμα κατά την αποθήκευση.");
  };

  const addOverride = () =>
    setOverrides([
      ...overrides,
      { date: new Date().toISOString().split("T")[0], openHour: "", closeHour: "", alwaysClosed: false },
    ]);

  const removeOverride = (index: number) =>
    setOverrides(overrides.filter((_, i) => i !== index));

  if (!user?.business) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🕓 Διαχείριση Ωραρίου</h2>

      {/* Weekly schedule */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Εβδομαδιαίο ωράριο</h3>
        <div className="space-y-3">
          {weekly.map((day, i) => {

            const hasError =
              errors.includes(day.dayOfWeek) && !day.alwaysClosed;

            return (
              <div
                key={day.id}
                className={`border-b pb-2 flex flex-col md:flex-row md:items-center md:gap-3 ${
                  hasError ? "bg-red-50" : ""
                }`}
              >
                <div className="w-28 font-medium">{day.dayOfWeek}</div>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={day.openHour || ""}
                    onChange={(e) =>
                      setWeekly((w) =>
                        w.map((d, idx) =>
                          idx === i ? { ...d, openHour: e.target.value } : d
                        )
                      )
                    }
                    disabled={day.alwaysClosed}
                    className={`border rounded px-2 py-1 ${
                      hasError && !day.openHour ? "border-red-500" : ""
                    }`}
                  />
                  <input
                    type="time"
                    value={day.closeHour || ""}
                    onChange={(e) =>
                      setWeekly((w) =>
                        w.map((d, idx) =>
                          idx === i ? { ...d, closeHour: e.target.value } : d
                        )
                      )
                    }
                    disabled={day.alwaysClosed}
                    className={`border rounded px-2 py-1 ${
                      hasError && !day.closeHour ? "border-red-500" : ""
                    }`}
                  />
                  <label className="flex items-center gap-1 ml-2">
                    <input
                      type="checkbox"
                      checked={day.alwaysClosed}
                      onChange={(e) =>
                        setWeekly((w) =>
                          w.map((d, idx) =>
                            idx === i
                              ? { ...d, alwaysClosed: e.target.checked }
                              : d
                          )
                        )
                      }
                    />
                    <span>Κλειστό</span>
                  </label>
                </div>
                {hasError && (
                  <p className="text-red-600 text-sm ml-28">
                    ⚠️ Συμπλήρωσε ώρες λειτουργίας ή επίλεξε “Κλειστό”
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Special date overrides */}
      <div>
        <h3 className="text-xl font-semibold mb-3 flex justify-between items-center">
          <span>Ειδικές ημερομηνίες</span>
          <button
            onClick={addOverride}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            + Προσθήκη
          </button>
        </h3>
        <div className="space-y-3">
          {overrides.map((o, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 border-b pb-2">
              <input
                type="date"
                value={new Date(o.date).toISOString().split("T")[0]}
                onChange={(e) =>
                  setOverrides((list) =>
                    list.map((d, idx) =>
                      idx === i ? { ...d, date: e.target.value } : d
                    )
                  )
                }
                className="border rounded px-2 py-1"
              />
              <input
                type="time"
                value={o.openHour || ""}
                onChange={(e) =>
                  setOverrides((list) =>
                    list.map((d, idx) =>
                      idx === i ? { ...d, openHour: e.target.value } : d
                    )
                  )
                }
                disabled={o.alwaysClosed}
                className="border rounded px-2 py-1"
              />
              <input
                type="time"
                value={o.closeHour || ""}
                onChange={(e) =>
                  setOverrides((list) =>
                    list.map((d, idx) =>
                      idx === i ? { ...d, closeHour: e.target.value } : d
                    )
                  )
                }
                disabled={o.alwaysClosed}
                className="border rounded px-2 py-1"
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={o.alwaysClosed}
                  onChange={(e) =>
                    setOverrides((list) =>
                      list.map((d, idx) =>
                        idx === i
                          ? { ...d, alwaysClosed: e.target.checked }
                          : d
                      )
                    )
                  }
                />
                <span>Κλειστό</span>
              </label>
              <button
                onClick={() => removeOverride(i)}
                className="text-red-500 font-semibold ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="text-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Αποθήκευση..." : "💾 Αποθήκευση"}
        </button>
      </div>
    </div>
  );
}
