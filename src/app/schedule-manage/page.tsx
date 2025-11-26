"use client";

import { useCart } from "../wrappers/cartContext";
import Intervals from "./intervalsEditor";
import OverrideIntervals from "./dateIntervals";

export default function ScheduleManager() {
  const { user, weeklyIntervals, setWeeklyIntervals } = useCart();

  if (!user?.business) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-4 space-y-6 py-24">
      <h2 className="text-2xl font-bold text-gray-800">Διαχείριση Ωραρίου</h2>

      {/* Weekly schedule */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Εβδομαδιαίο ωράριο</h3>
        <p className="text-gray-600 mb-4">
          Δημιούργησε το ωράριο της εβδομάδας.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
          <Intervals
            days={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
            object="week"
            intervals={weeklyIntervals}
            setIntervals={setWeeklyIntervals}
          />
        </div>
      </div>

      {/* Override schedule */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Εδικές ημερομηνίες</h3>
        <p className="text-gray-600 mb-4">
          Προσθέστε ειδικές ημερομηνίες ή αλλαγές ωραρίου για συγκεκριμένες μέρες.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
          <OverrideIntervals />
        </div>
      </div>
    </div>
  );
}
