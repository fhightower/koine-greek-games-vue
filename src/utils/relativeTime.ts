const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

/**
 * How long ago something happened, in words. `now` is a parameter so callers
 * in tests can pin it. Timestamps in the future read as "just now" — an
 * imported miss can carry a clock that runs ahead of this device's.
 */
export function relativeTime(at: number, now: number = Date.now()): string {
  const seconds = Math.floor((now - at) / 1000);

  if (seconds < MINUTE) {
    return "just now";
  }
  if (seconds < HOUR) {
    return `${Math.floor(seconds / MINUTE)} min ago`;
  }
  if (seconds < DAY) {
    return `${Math.floor(seconds / HOUR)} hr ago`;
  }
  if (seconds < MONTH) {
    const days = Math.floor(seconds / DAY);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  return new Date(at).toLocaleDateString();
}
