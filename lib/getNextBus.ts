/**
 * Gets the current time in IST (Asia/Kolkata).
 */
export function getISTTime(): { hour: number; minute: number } {
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } as const;
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(new Date());
  
  let hour = 0;
  let minute = 0;
  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  }
  return { hour, minute };
}

/**
 * Returns the next bus timing and how many minutes from now it is.
 * Timings are in "HH:MM" 24h format.
 */
export function getNextBus(
  timings: string[]
): { time: string; minsFromNow: number } | null {
  if (!timings || timings.length === 0) return null;

  const { hour: currentHour, minute: currentMinute } = getISTTime();
  const currentMins = currentHour * 60 + currentMinute;

  let nextBus: { time: string; minsFromNow: number } | null = null;
  let minDiff = Infinity;

  for (const timeStr of timings) {
    const [hStr, mStr] = timeStr.split(':');
    const busHour = parseInt(hStr, 10);
    const busMinute = parseInt(mStr, 10);
    const busMins = busHour * 60 + busMinute;

    const diff = busMins - currentMins;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextBus = { time: timeStr, minsFromNow: diff };
    }
  }

  return nextBus;
}
