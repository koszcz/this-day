// The clock. One real second is two game minutes, so a full day lasts twelve real minutes.
import { sin } from '../math/exact';
export const MINUTES_PER_DAY = 1440;
export const GAME_MINUTES_PER_SECOND = 2;
export const SLEEP_SPEEDUP = 8;
export const START_MINUTE = 7 * 60;

export const dayNumber = (t: number) => Math.floor(t / MINUTES_PER_DAY) + 1;
export const hourOf = (t: number) => (t % MINUTES_PER_DAY) / 60;

export function clockText(t: number): string {
  const m = Math.floor(t % MINUTES_PER_DAY);
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// 0 at deep night, 1 at midday, with smooth dawn and dusk.
export function daylight(t: number): number {
  const h = hourOf(t);
  const x = (h - 6) / 12;
  if (x <= 0 || x >= 1) return 0;
  return Math.min(1, sin(x * Math.PI) * 2.6);
}

// How warm the air feels on its own: mild by day, bitter at night.
export const ambientWarmth = (t: number) => 12 + 62 * daylight(t);
