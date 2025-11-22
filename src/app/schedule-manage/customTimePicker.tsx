import { useState, useEffect } from "react";

interface CustomTimePickerProps {
  value: string; // "HH:MM"
  onChange: (newTime: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  isClosePicker?: boolean; // true if this is a close hour picker
  openHour?: string; // currently selected open hour (for close picker)
  closeHour?: string; // currently selected close hour (for open picker)
  disabledHours?: number[]; // optional array of hours to disable (e.g., overlap prevention)
  currentDay?: string; 
}

export const CustomTimePicker = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "Select time",
  className = "",
  label,
  isClosePicker = false,
  openHour,
  closeHour,
  disabledHours = [],
  currentDay,
}: CustomTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState("04");
  const [minute, setMinute] = useState("00");

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentIndex = currentDay ? DAYS.indexOf(currentDay) : 0;

  // Sync internal state when value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHour(h);
      setMinute(m);
    }
  }, [value]);

  // Confirm selection
  const confirmTime = () => {
    onChange(`${hour}:${minute}`);
    setIsOpen(false);
  };

  // Determine if an hour should be disabled
  const isHourDisabled = (h: number) => {
  // Disallow external custom-disabled hours
  if (disabledHours.includes(h)) return true;

  // Convert hours so that day starts at 04:00
  // 04 → 0, 05 → 1, ..., 23 → 19, 00 → 20, 01 → 21, 02 → 22, 03 → 23
  const normalize = (hour: number) => (hour + 20) % 24;

  const normalizedH = normalize(h);

  // If selecting closing time
  if (isClosePicker && openHour) {
    const openH = parseInt(openHour.split(":")[0]);
    const normalizedOpen = normalize(openH);

    // Close must be AFTER open (in the shifted 4AM day cycle)
    if (normalizedH < normalizedOpen) return true;
  }

  // If selecting opening time
  if (!isClosePicker && closeHour) {
    const closeH = parseInt(closeHour.split(":")[0]);
    const normalizedClose = normalize(closeH);

    // Open must be BEFORE close
    if (normalizedH > normalizedClose) return true;
  }

  return false;
};

  // Determine if a minute should be disabled
  const isMinuteDisabled = (m: number) => {
    if (isClosePicker && openHour && parseInt(hour) === parseInt(openHour.split(":")[0])) {
      const openM = parseInt(openHour.split(":")[1]);
      return m < openM; // cannot pick minute before open minute
    }

    if (!isClosePicker && closeHour && parseInt(hour) === parseInt(closeHour.split(":")[0])) {
      const closeM = parseInt(closeHour.split(":")[1]);
      return m > closeM; // cannot pick minute after close minute
    }

    return false;
  };

  return (
    <div className="flex flex-col">
      {label && <span className="mb-1 font-medium">{label}</span>}

      {/* Trigger */}
      <div
        className={`border rounded px-2 py-1 cursor-pointer bg-white 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${hasError && !value ? "border-red-500" : ""}
          ${className}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {value || placeholder}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-auto">
            <h3 className="text-lg mb-3 font-semibold">Select Time</h3>

            <div className="flex gap-3 mb-4">
              {/* Hour selector */}

              <select
                className="border p-2 rounded"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const shiftedHour = (i + 4) % 24; // start at 4AM
                  const hStr = String(shiftedHour).padStart(2, "0");

                  let label = `${hStr}:00`;

                  // Show next day for 0–3
                  if (shiftedHour >= 0 && shiftedHour < 4 && currentDay) {
                    const nextDay = DAYS[(currentIndex + 1) % 7];
                    label += ` (${nextDay})`;
                  }

                  // Disabled logic for open/close picker
                  let disabled = false;
                  if (isClosePicker && openHour) {
                    const openH = parseInt(openHour.split(":")[0]);
                    if (shiftedHour < openH) disabled = true;
                  }
                  if (!isClosePicker && closeHour) {
                    const closeH = parseInt(closeHour.split(":")[0]);
                    if (shiftedHour > closeH) disabled = true;
                  }

                  return (
                    <option key={i} value={hStr} disabled={disabled}>
                      {label}
                    </option>
                  );
                })}
              </select>

              <span className="text-xl">:</span>

              {/* Minute selector */}
              <select
                className="border p-2 rounded"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <option
                    key={i}
                    value={String(i).padStart(2, "0")}
                    disabled={isMinuteDisabled(i)}
                  >
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={confirmTime}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
