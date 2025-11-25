"use client";

import { useCart } from "../wrappers/cartContext";
import Intervals from "./intervalsEditor";
import OverrideIntervals from "./dateIntervals";

export default function ScheduleManager() {
  const { user, weeklyIntervals, setWeeklyIntervals } = useCart();

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

        <OverrideIntervals />
      </div>
    </div>
  );
}
