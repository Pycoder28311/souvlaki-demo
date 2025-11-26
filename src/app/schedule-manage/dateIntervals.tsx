"use client";

import { Plus, X, Trash2 } from "lucide-react";
import { CustomTimePicker } from "./customTimePicker"; // keep your component
import { useCart } from "../wrappers/cartContext";
import { ALL_DAY_OPEN, ALL_DAY_CLOSE, DEFAULT_OPEN, DEFAULT_CLOSE } from "../utils/hours";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function OverrideIntervals() {
    const { overrides, setOverrides } = useCart();

    const addNewDay = async () => {
        const getLocalDateString = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        // Start from today and find the next date that is not in overrides
        const nextDate = new Date();
        const existingDates = new Set(overrides.map(o => o.date));

        while (existingDates.has(getLocalDateString(nextDate))) {
            nextDate.setDate(nextDate.getDate() + 1); // move to next day
        }

        const date = getLocalDateString(nextDate);

        try {
            const res = await fetch("/api/schedule-intervals/create-override", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });

            if (!res.ok) {
                throw new Error("Failed to create override");
            }

            const created = await res.json();

            // Insert into local state
            setOverrides(prev => [
                ...prev,
                {
                    id: created.id,
                    date: created.date,
                    intervals: []
                }
            ]);
        } catch (err) {
            console.error(err);
        }
    };

    const addInterval = async (overrideId: number) => {
        const openTime = DEFAULT_OPEN;
        const closeTime = DEFAULT_CLOSE;

        // Check for existing "all-day" interval in local state
        // Add the new interval
        const res = await fetch(`/api/schedule-intervals/add-interval`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                open: openTime,
                close: closeTime,
                object: "override",
                id: overrideId,
            }),
        });

        if (!res.ok) return;

        const interval = await res.json();

        setOverrides(prev =>
            prev.map(o =>
                o.id === overrideId
                    ? {
                        ...o,
                        intervals: [...o.intervals, interval.interval],
                    }
                    : o
            )
        );
    };

    const removeInterval = async (overrideId: number, intervalId: number) => {
        try {
            // Call API to delete interval from backend
            const res = await fetch("/api/schedule-intervals/delete-put-interval", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: intervalId }),
            });

            if (!res.ok) {
                console.error("Failed to delete interval from server");
                return;
            }

            // Update local state
            setOverrides(prev =>
                prev.map(o =>
                    o.id === overrideId
                        ? {
                            ...o,
                            intervals: o.intervals.filter(i => i.id !== intervalId),
                        }
                        : o
                )
            );
        } catch (err) {
            console.error("Error deleting interval:", err);
        }
    };

    const updateInterval = async (
        overrideId: number,
        intervalId: number,
        field: "open" | "close",
        value: string
    ) => {
        try {
            // Call backend API to update interval
            const res = await fetch("/api/schedule-intervals/delete-put-interval", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: intervalId,
                    field,
                    value,
                }),
            });

            if (!res.ok) {
                console.error("Failed to update interval");
                return;
            }

            // Update local state
            setOverrides(prev =>
                prev.map(o =>
                    o.id === overrideId
                        ? {
                            ...o,
                            intervals: o.intervals.map(interval =>
                                interval.id === intervalId
                                    ? { ...interval, [field]: value } // keep local in sync
                                    : interval
                            ),
                        }
                        : o
                )
            );
        } catch (error) {
            console.error("Error updating interval:", error);
        }
    };

    const openAllDay = async (overrideId: number) => {
        try {
            const res = await fetch(`/api/schedule-intervals/open-all-day`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ overrideId }), // pass overrideId in the body
            });

            if (!res.ok) throw new Error("Failed to open override all day");

            const data = await res.json();

            setOverrides(prev =>
                prev.map(o =>
                    o.id === overrideId
                        ? { ...o, intervals: [data.interval] } // replace all intervals with the all-day interval
                        : o
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const closeAllDay = async (overrideId: number) => {
        try {
            // Call the API to delete all intervals for this override
            const res = await fetch("/api/schedule-intervals/close-all-day-override", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ overrideId }),
            });

            if (!res.ok) {
                console.error("Failed to delete intervals");
                return;
            }

            // Update local state to remove all intervals
            setOverrides(prev =>
                prev.map(o =>
                    o.id === overrideId
                        ? { ...o, intervals: [] }
                        : o
                )
            );
        } catch (error) {
            console.error("Error closing all day:", error);
        }
    };

    const editOverrideDate = async (overrideId: number, newDate: string) => {
        try {
            const res = await fetch("/api/schedule-intervals/edit-override", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ overrideId, newDate }),
            });

            if (!res.ok) {
                console.error("Failed to update override date");
                return;
            }

            const { override: updatedOverride } = await res.json();

            // Update local state
            setOverrides(prev =>
                prev.map(o =>
                    o.id === overrideId ? { ...o, date: updatedOverride.date } : o
                )
            );
        } catch (error) {
            console.error("Error editing override date:", error);
        }
    };

    const deleteOverride = async (overrideId: number) => {
        try {
            const res = await fetch("/api/schedule-intervals/delete-override", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ overrideId }),
            });

            if (!res.ok) {
                console.error("Failed to delete override");
                return;
            }

            // Remove from local state
            setOverrides(prev => prev.filter(o => o.id !== overrideId));
        } catch (error) {
            console.error("Error deleting override:", error);
        }
    };

    async function toggleEveryYearAPI(overrideId: number, everyYear: boolean) {
        try {
            const response = await fetch(`/api/schedule-intervals/toggleEveryYear`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ overrideId, everyYear }),
            });

            if (!response.ok) {
                throw new Error("Failed to update everyYear field");
            }

            const data = await response.json();
            return data; // optionally return updated override
        } catch (error) {
            console.error("Error toggling everyYear:", error);
            throw error;
        }
    }

    const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});

    return (
        <div className="flex flex-col gap-4 items-center">
            {overrides?.map((override) => {
                const takenDates = overrides
                    .filter(o => o.id !== override.id)
                    .map(o => o.date);

                const handleDateChange = (newDate: string) => {
                    if (takenDates.includes(newDate)) {
                        alert("Αυτή η ημερομηνία υπάρχει ήδη.");
                        return;
                    }
                    editOverrideDate(override.id, newDate);
                };

                return (
                    <div key={override.id} className="p-4 bg-white w-full shadow-lg rounded-xl flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start gap-4 w-full">
                                <button
                                    className="flex justify-between items-center text-left"
                                    onClick={() =>
                                        setIsOpen(prev => ({ ...prev, [override.date]: !prev[override.date] }))
                                    }
                                >
                                    {isOpen[override.date] ? (
                                        <ChevronUp className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors" />
                                    ) : (
                                        <ChevronDown className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors" />
                                    )}
                                </button>
                                <input
                                    type="date"
                                    value={override.date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="border rounded-xl px-2 py-1 text-lg"
                                />

                                <label className="flex items-center gap-2 text-sm font-medium border rounded-xl px-4">
                                    <input
                                        type="checkbox"
                                        checked={override.everyYear}
                                        onChange={async () => {
                                            try {
                                                // Optimistically update UI immediately
                                                setOverrides(prev =>
                                                    prev.map(o =>
                                                        o.id === override.id ? { ...o, everyYear: !o.everyYear } : o
                                                    )
                                                );

                                                // Call API
                                                await toggleEveryYearAPI(override.id, !override.everyYear);
                                            } catch (error) {
                                                alert(error);
                                                // Optionally, revert UI change if API fails
                                                setOverrides(prev =>
                                                    prev.map(o =>
                                                        o.id === override.id ? { ...o, everyYear: override.everyYear } : o
                                                    )
                                                );
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    Επαναλαμβάνεται κάθε χρόνο
                                </label>

                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm self-end"
                                    onClick={() => deleteOverride(override.id)}
                                >
                                    Διαγραφή
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {/* Show label: open all day */}
                                {override.intervals?.some(i => i.open === ALL_DAY_OPEN && i.close === ALL_DAY_CLOSE) && (
                                    <span className="px-2 py-1 bg-green-200 rounded-xl text-sm font-semibold">
                                        Ανοιχτά όλη την ημέρα
                                    </span>
                                )}

                                {/* Show label: open all day */}
                                {override.intervals?.some(
                                    i => i.open === ALL_DAY_OPEN && i.close === ALL_DAY_CLOSE
                                ) && (
                                        <span className="px-2 py-1 bg-green-200 rounded-xl text-sm font-semibold">
                                            Ανοιχτά όλη την ημέρα
                                        </span>
                                    )}

                            </div>
                        </div>
                        {isOpen[override.date] && (
                            <>
                                {/* Buttons */}
                                <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                                    <button
                                        className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700"
                                        onClick={() => closeAllDay(override.id)}
                                    >
                                        Κλειστά όλη μέρα
                                        <X className="w-4 h-4" />
                                    </button>

                                    <button
                                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                        onClick={() => openAllDay(override.id)}
                                    >
                                        Άνοιχτά όλη την ημέρα
                                    </button>

                                    <button
                                        className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700"
                                        onClick={() => addInterval(override.id)}
                                    >
                                        <span>Πρόσθήκη Διαστήματος</span>
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Intervals */}
                                {override.intervals.map((interval) => {
                                    const isAllDay = interval.open === ALL_DAY_OPEN && interval.close === ALL_DAY_CLOSE;
                                    if (isAllDay) return null;

                                    return (
                                        <div key={`${interval.id}`} className="flex gap-6 border p-4 px-8 rounded-xl">
                                            <CustomTimePicker
                                                label="Ώρα Ανοίγματος:"
                                                value={interval.open}
                                                onChange={(v) => updateInterval(override.id, interval.id, "open", v)}
                                            />

                                            <CustomTimePicker
                                                label="Ώρα Κλεισίματος:"
                                                value={interval.close}
                                                onChange={(v) => updateInterval(override.id, interval.id, "close", v)}
                                            />

                                            <button
                                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm self-end"
                                                onClick={() => removeInterval(override.id, interval.id)}
                                            >
                                                Διαγραφή
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )
            }
            )}
            <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 w-fit"
                onClick={addNewDay}
            >
                Πρόσθεσε Ημερομηνία
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}
