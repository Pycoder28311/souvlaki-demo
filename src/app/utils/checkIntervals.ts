import { WeeklyIntervals } from "../types"; // adjust path

export function checkIntervalsNow(weeklyIntervals: WeeklyIntervals): boolean {
  if (!weeklyIntervals) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const todayIndex = now.getDay();
  const today = DAYS[todayIndex];
  const yesterday = DAYS[(todayIndex + 6) % 7];

  // Intervals of today
  const intervalsToday = weeklyIntervals[today] || [];

  // Intervals from yesterday that go past midnight (00:00–03:59)
  const intervalsFromYesterday = (weeklyIntervals[yesterday] || [])
    .filter(interval => {
      const closeHour = Number(interval.close.split(":")[0]);
      return closeHour >= 0 && closeHour <= 3;
    })
    .map(interval => ({
      ...interval,
      isAfterMidnight: true,
    }));

  const allIntervals = [...intervalsToday, ...intervalsFromYesterday];

  return allIntervals.some(interval => {
    const [openH, openM] = interval.open.split(":").map(Number);
    const [closeH, closeM] = interval.close.split(":").map(Number);

    let openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    if (
      openH === 4 && openM === 0 &&
      closeH === 3 && closeM === 59 &&
      intervalsToday.includes(interval)
    ) {
      return true;
    }

    // Ignore yesterday intervals if current time >= 04:00
    if (interval.isAfterMidnight && currentMinutes >= 4 * 60) {
      return false;
    }

    if (interval.isAfterMidnight) {
      if (openH < 4) openMinutes += 24 * 60;
      closeMinutes += 24 * 60;
    }

    let nowMinutes = currentMinutes;
    if (nowMinutes < openMinutes && interval.isAfterMidnight) nowMinutes += 24 * 60;

    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  });
}
