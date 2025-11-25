"use client";

import { Plus, X, Trash2 } from "lucide-react";
import { CustomTimePicker } from "./customTimePicker"; // keep your component
import { useCart } from "../wrappers/cartContext";

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
        const openTime = "04:00";
        const closeTime = "10:00";

        // Check for existing "all-day" interval in local state
        // Add the new interval
        const res = await fetch(`/api/schedule-intervals/add`, {
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
        console.log(overrides, intervalId)
        try {
            // Call API to delete interval from backend
            const res = await fetch("/api/schedule-intervals/delete-put", {
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
            const res = await fetch("/api/schedule-intervals/delete-put", {
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
            const res = await fetch("/api/schedule-intervals/close-all-day", {
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

    return (
        <div className="flex flex-col gap-8">

            {/* BUTTON: Add new override day */}
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 w-fit"
                onClick={addNewDay}
            >
                Πρόσθεσε Ημέρα
            </button>

            {/* RENDER ALL OVERRIDE DAYS */}
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
                    <div key={override.id} className="p-4 border rounded-xl flex flex-col gap-4">

                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{override.date}</h2>
                            <input
                                type="date"
                                value={override.date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                            />
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-1"
                                onClick={() => deleteOverride(override.id)}
                            >
                                Διαγραφή
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <label className="flex items-center gap-2 text-sm font-medium">
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

                            {/* Show label: open all day */}
                            {override.intervals?.some(i => i.open === "04:00" && i.close === "03:59") && (
                                <span className="px-2 py-1 bg-green-200 rounded-xl text-sm font-semibold">
                                    Άνοιγμα όλη την ημέρα
                                </span>
                            )}

                            {/* Show label: open all day */}
                            {override.intervals?.some(
                                i => i.open === "04:00" && i.close === "03:59"
                            ) && (
                                    <span className="px-2 py-1 bg-green-200 rounded-xl text-sm font-semibold">
                                        Άνοιγμα όλη την ημέρα
                                    </span>
                                )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 flex-wrap">
                            <button
                                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700"
                                onClick={() => addInterval(override.id)}
                            >
                                <span>Πρόσθεσε Διάστημα</span>
                                <Plus className="w-4 h-4" />
                            </button>

                            <button
                                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                onClick={() => openAllDay(override.id)}
                            >
                                Άνοιξε όλη την ημέρα
                            </button>

                            <button
                                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700"
                                onClick={() => closeAllDay(override.id)}
                            >
                                Κλείσιμο όλη μέρα
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Intervals */}
                        {override.intervals.map((interval) => {
                            const isAllDay = interval.open === "04:00" && interval.close === "03:59";
                            if (isAllDay) return null;

                            return (
                                <div key={`${interval.id}`} className="flex gap-2 border p-3 rounded-xl">
                                    <CustomTimePicker
                                        label="Ώρα Άνοιγμα"
                                        value={interval.open}
                                        onChange={(v) => updateInterval(override.id, interval.id, "open", v)}
                                    />

                                    <CustomTimePicker
                                        label="Ώρα Κλείσιμο"
                                        value={interval.close}
                                        onChange={(v) => updateInterval(override.id, interval.id, "close", v)}
                                    />

                                    <button
                                        className="px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-1"
                                        onClick={() => removeInterval(override.id, interval.id)}
                                    >
                                        Διαγραφή
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )
            }
            )}
        </div>
    );
}
