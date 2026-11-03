// Seeded random numbers (mulberry32). The seed is the whole state, so it can be saved in the game state.
export function nextRandom(seed: number): { value: number; seed: number } {
  const a = (seed + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: a };
}

export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    const r = nextRandom(s);
    s = r.seed;
    return r.value;
  };
}
