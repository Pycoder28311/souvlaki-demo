import { WeeklyIntervals, Override } from "../types"; // adjust path
import { ALL_DAY_OPEN, ALL_DAY_CLOSE } from "../utils/hours";

const [openHours, openMinutes] = ALL_DAY_OPEN.split(":").map(Number);
const opening = openHours * 60 + openMinutes;
const [allDayOpenH, allDayOpenM] = ALL_DAY_OPEN.split(":").map(Number);
const [allDayCloseH, allDayCloseM] = ALL_DAY_CLOSE.split(":").map(Number);

export function checkIntervalsNow(
  weeklyIntervals: WeeklyIntervals,
  overrides: Override[],
  setCartMessage: (msg: string) => void
): boolean {
  if (!weeklyIntervals) return false;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const day = String(now.getDate()).padStart(2, "0");

  const todayISO = `${year}-${month}-${day}`; // YYYY-MM-DD in local time
  const yesterdayISO = `${year}-${month}-${String(now.getDate() - 1).padStart(2, "0")}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const todayIndex = now.getDay();
  const today = DAYS[todayIndex];
  const yesterday = DAYS[(todayIndex + 6) % 7];

  // Intervals of today
  let intervalsToday = weeklyIntervals[today] || [];

  // Intervals from yesterday that go past midnight 
  let intervalsFromYesterday = (weeklyIntervals[yesterday] || [])
    .filter(interval => {
      const closeHour = Number(interval.close.split(":")[0]);
      return closeHour >= 0 && closeHour <= allDayCloseH;
    })
    .map(interval => ({
      ...interval,
      isAfterMidnight: true,
    }));

  const todayOverrides = overrides
  .filter(o => {
    if (o.everyYear) {
      const [, overrideMonth, overrideDay] = o.date.split("-").map(Number);
      return overrideMonth === now.getMonth() + 1 && overrideDay === now.getDate();
    } else {
      return o.date === todayISO;
    }
  })
  .flatMap(o => o.intervals.map(i => ({ ...i })));

  let yesterdayOverrides: typeof todayOverrides = [];
  if (currentMinutes < opening) { // before 
    yesterdayOverrides = overrides
      .filter(o => {
        if (o.everyYear) {
          const [, overrideMonth, overrideDay] = o.date.split("-").map(Number);
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          return overrideMonth === yesterday.getMonth() + 1 && overrideDay === yesterday.getDate();
        } else {
          return o.date === yesterdayISO;
        }
      })
      .flatMap(o =>
        o.intervals
          .filter(i => {
            const closeH = Number(i.close.split(":")[0]);
            return closeH >= 0 && closeH <= allDayCloseH; // after-midnight
          })
          .map(i => ({ ...i, isAfterMidnight: true }))
      );
  }

  if (todayOverrides.length > 0) intervalsToday = todayOverrides;

  // Replace intervalsFromYesterday if there is an override yesterday
  if (yesterdayOverrides.length > 0) intervalsFromYesterday = yesterdayOverrides;

  // Merge all intervals
  const allIntervals = [
    ...intervalsToday,
    ...intervalsFromYesterday,
  ];

  if (intervalsToday.length === 0 && intervalsFromYesterday.length === 0) {
    setCartMessage("Το κατάστημα είναι κλειστό");
  }

  const isOpenNow = allIntervals.some(interval => {
    const [openH, openM] = interval.open.split(":").map(Number);
    const [closeH, closeM] = interval.close.split(":").map(Number);

    let openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    if (
      openH === allDayOpenH && openM === allDayOpenM &&
      closeH === allDayCloseH && closeM === allDayCloseM &&
      intervalsToday.includes(interval)
    ) {
      return true;
    }

    const afterMidnight = closeH < allDayOpenH;

    // Ignore yesterday intervals if current time 
    if (interval.isAfterMidnight && currentMinutes >= opening) {
      return false;
    }

    if (afterMidnight) {
      if (openH < allDayOpenH) openMinutes += 24 * 60;
      closeMinutes += 24 * 60;
    }

    let nowMinutes = currentMinutes;
    if (nowMinutes < openMinutes && afterMidnight) nowMinutes += 24 * 60;

    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  });

  if (!isOpenNow) {
    const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const GREEK_DAYS = ["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"];
    const nowIndex = new Date().getDay();

    let nextInterval: { day: string, open: string, minutesFromNow: number } | null = null;

    for (let i = 0; i < 7; i++) {
      const dayIndex = (nowIndex + i) % 7;
      const dayName = DAYS[dayIndex];

      for (const interval of allIntervals) {
        const [openH, openM] = interval.open.split(":").map(Number);
        const openMinutes = openH * 60 + openM + i * 24 * 60; 

        const minutesFromNow = openMinutes - currentMinutes;
        if (minutesFromNow > 0 && (!nextInterval || minutesFromNow < nextInterval.minutesFromNow)) {
          nextInterval = { day: dayName, open: interval.open, minutesFromNow };
        }
      }

      // ✅ Stop after checking today if we found an interval later today
      if (i === 0 && nextInterval) break;
    }

    if (nextInterval) {
      // Όταν υπολογίζεις το nextInterval:
      const dayIndex = DAYS.indexOf(nextInterval.day); // DAYS είναι η αγγλική λίστα που ήδη χρησιμοποιείς
      const greekDay = GREEK_DAYS[dayIndex];

      setCartMessage(`Ανοίγει την ${greekDay} στις ${nextInterval.open}`);
    } else {
      setCartMessage("Το κατάστημα είναι κλειστό");
    }
  }

  return isOpenNow;
}
