export const ALL_DAY_OPEN = "04:00";

// Function to get the minute before a given "HH:MM"
const getMinuteBefore = (time: string) => {
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  // Subtract one minute
  minutes -= 1;
  if (minutes < 0) {
    minutes = 59;
    hours -= 1;
    if (hours < 0) hours = 23;
  }

  // Pad with zeros
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}`;
};

export const ALL_DAY_CLOSE = getMinuteBefore(ALL_DAY_OPEN);


export const DEFAULT_OPEN = "04:00";
export const DEFAULT_CLOSE = "10:00";