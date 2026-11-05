// The moving look of water: how much shimmer and foam each spot shows at a given moment.

// Soft glints that drift across open water. Returns 0 to 1.
export function shimmerAmount(x: number, z: number, t: number): number {
  const a = Math.sin(x * 0.7 + t * 0.8) + Math.sin(z * 0.8 - t * 0.6) + Math.sin((x + z) * 0.5 + t * 1.1);
  const v = (a + 3) / 6;
  return Math.max(0, Math.min(1, (v - 0.5) * 2));
}

// Foam hugs the shore. `depth` is how far the water surface sits above the ground.
// The band breathes in and out like small waves. Returns 0 to 1.
export function foamAmount(depth: number, t: number): number {
  if (depth < 0) return 0;
  const band = 0.22 + 0.08 * Math.sin(t * 1.4);
  if (depth >= band) return 0;
  return 1 - depth / band;
}

// How white the overlay is at one spot, 0 (clear) to 1 (solid white).
export function waterAlpha(depth: number, x: number, z: number, t: number): number {
  if (depth < 0) return 0;
  const glint = shimmerAmount(x, z, t) * 0.14;
  return Math.min(1, foamAmount(depth, t) * 0.55 + glint);
}
