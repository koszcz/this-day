// Lighting rules as plain numbers: fire glow, shadow softness and colour grading by time of day.

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// A fire throws more light and reaches farther in the dark. By day it stays modest.
export const fireGlow = (d: number) => ({
  intensity: 1 + 1.2 * (1 - clamp01(d)),
  reach: 1 + 0.5 * (1 - clamp01(d)),
});

// A fire's warm pool on the ground fades in as the light fails.
export const fireHalo = (d: number, fuelShare: number) => 0.55 * (1 - clamp01(d)) * clamp01(fuelShare);

// Sun shadows get softer by raising the fill light. Low sun (dawn, dusk) is softest.
export const fillShare = (d: number) => 0.55 + 0.2 * (1 - clamp01(d));

// How much of the shadow's darkness the ground keeps: 0 is no shadow, 1 is the old hard shadow.
export const shadowStrength = (d: number) => 1 - fillShare(d);

// Grade the fill light: cool at night, neutral at midday, warm at dawn and dusk.
// Returns the amount of each tint to mix in, between 0 and 1.
export function grade(d: number) {
  const x = clamp01(d);
  const warm = x > 0 && x < 0.7 ? 1 - Math.abs(x - 0.3) / 0.4 : 0;
  return { cool: 1 - x, warm: clamp01(warm) * 0.6 };
}
