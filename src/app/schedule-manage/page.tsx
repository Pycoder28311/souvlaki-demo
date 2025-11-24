"use client";

import { useEffect, useState } from "react";
import { useCart } from "../wrappers/cartContext";
import Intervals from "./intervalsEditor";

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
  prevOpenHour: string | null,   // keep these so logic is consistent
  prevCloseHour: string | null,
  alwaysClosed: boolean;
  recurringYearly: boolean;
}

export default function ScheduleManager() {
  const [weekly, setWeekly] = useState<Day[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { user, weeklyIntervals, setWeeklyIntervals } = useCart();
  const [error, setError] = useState<string>("");

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

  const checkDuplicateOverrides = (): boolean => { 
    const dates = overrides.map((o) => o.date); 
    const uniqueDates = new Set(dates); 
    if (uniqueDates.size !== dates.length) { 
      setError("⚠️ Υπάρχουν δύο ή περισσότερες επιλογές με την ίδια ημερομηνία. Αλλάξτε την."); 
      return true; // duplicates exist 
    } 
    setError(""); // no duplicates 
    return false; 
  };

  const handleSave = async () => {
    // Clear previous error
    setError("");

    if (checkDuplicateOverrides()) return;

    if (!validateSchedule()) {
      setError("⚠️ Συμπλήρωσε τις ώρες για όλες τις ημέρες.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Clean overrides before saving
      const cleanedOverrides = overrides.map((o) => {
        const { prevOpenHour: _, prevCloseHour: __, ...rest } = o;
        return rest;
      });

      const res = await fetch("/api/schedule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekly, overrides: cleanedOverrides }),
      });

      if (!res.ok) {
        setError("❌ Σφάλμα κατά την αποθήκευση.");
      } else {
        // ✅ Optionally show a success message in HTML
        setError(""); // clear any previous error
        alert("✅ Το ωράριο αποθηκεύτηκε!"); // or you can replace alert with a UI message
      }
    } catch (err) {
      console.error(err);
      setError("❌ Σφάλμα κατά την αποθήκευση.");
    } finally {
      setLoading(false);
    }
  };

  const addOverride = () =>
    setOverrides([
      ...overrides,
      {
        date: new Date().toISOString().split("T")[0],
        openHour: "",
        closeHour: "",
        prevOpenHour: "",   // keep these so logic is consistent
        prevCloseHour: "",
        alwaysClosed: true, 
        recurringYearly: false,
      },
    ]);

  const removeOverride = (index: number) => 
    setOverrides(overrides.filter((_, i) => i !== index))

  if (!user?.business) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-6 space-y-6 pt-24">
      <h2 className="text-2xl font-bold text-gray-800">🕓 Διαχείριση Ωραρίου</h2>

      {/* Weekly schedule */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Εβδομαδιαίο ωράριο</h3>
            {/* Render the Intervals component for each day */}
        <Intervals
          days={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
          object="week"
          intervals={weeklyIntervals}
          setIntervals={setWeeklyIntervals}
        />
        <div className="space-y-3">
          {weekly.map((day, i) => {
            const greekDays: Record<string, string> = {
              Monday: "Δευτέρα",
              Tuesday: "Τρίτη",
              Wednesday: "Τετάρτη",
              Thursday: "Πέμπτη",
              Friday: "Παρασκευή",
              Saturday: "Σάββατο",
              Sunday: "Κυριακή",
            };

            const hasError =
              errors.includes(day.dayOfWeek) && !day.alwaysClosed;

            return (
              <div
                key={day.id}
                className={`border-b pb-2 flex flex-col md:flex-row md:items-center md:gap-3 ${
                  hasError ? "bg-red-50" : ""
                }`}
              >
                <div className="w-28 font-medium">{greekDays[day.dayOfWeek] ?? day.dayOfWeek}</div>
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
                    <span>Κλειστό όλη μέρα</span>
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
            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
          >
            + Προσθήκη
          </button>
        </h3>
        {error && <div className="text-red-600 py-2">{error}</div>}
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
                      list.map((d, idx) => {
                        if (idx !== i) return d;

                        const nowClosed = e.target.checked;

                        // Closing: save any existing hours to prev* and clear the visible fields
                        if (nowClosed) {
                          return {
                            ...d,
                            alwaysClosed: true,
                            prevOpenHour: d.openHour || d.prevOpenHour || "",
                            prevCloseHour: d.closeHour || d.prevCloseHour || "",
                            openHour: "",
                            closeHour: "",
                          };
                        }

                        // Re-opening: restore prev* if present, otherwise use defaults,
                        // but don't overwrite if some hours were already present.
                        const restoredOpen = d.prevOpenHour || d.openHour || "09:00";
                        const restoredClose = d.prevCloseHour || d.closeHour || "17:00";

                        return {
                          ...d,
                          alwaysClosed: false,
                          openHour: restoredOpen,
                          closeHour: restoredClose,
                          // optionally clear prev* if you no longer need them:
                          // prevOpenHour: "",
                          // prevCloseHour: "",
                        };
                      })
                    )
                  }
                />
                <span>Κλειστό όλη μέρα</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={o.recurringYearly}
                  onChange={(e) =>
                    setOverrides((list) =>
                      list.map((d, idx) =>
                        idx === i
                          ? { ...d, recurringYearly: e.target.checked }
                          : d
                      )
                    )
                  }
                />
                <span>Κάθε χρόνο</span>
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
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
        </button>
      </div>
    </div>
  );
}
