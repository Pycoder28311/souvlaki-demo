import { WeeklyIntervals } from "../types"; // adjust path

export function checkObjectIntervals(weeklyIntervals: WeeklyIntervals): boolean {
  if (!weeklyIntervals) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // For non-week objects, all intervals are under "default"
  const intervals = weeklyIntervals["default"] || [];

  return intervals.some(interval => {
    const [openH, openM] = interval.open.split(":").map(Number);
    const [closeH, closeM] = interval.close.split(":").map(Number);

    // All-day interval shortcut
    if (openH === 4 && openM === 0 && closeH === 3 && closeM === 59) return true;

    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    // Handle intervals that go past midnight
    if (closeMinutes <= openMinutes) closeMinutes += 24 * 60;

    let nowMinutes = currentMinutes;
    if (interval.isAfterMidnight && nowMinutes < 4 * 60) nowMinutes += 24 * 60;

    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  });
}
