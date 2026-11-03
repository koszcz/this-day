// Seeded 2D value noise with fractal layering, used to shape the land.
const smooth = (t: number) => t * t * (3 - 2 * t);

export function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = smooth(x - xi);
    const v = smooth(y - yi);
    const top = hash(xi, yi) * (1 - u) + hash(xi + 1, yi) * u;
    const bottom = hash(xi, yi + 1) * (1 - u) + hash(xi + 1, yi + 1) * u;
    return top * (1 - v) + bottom * v;
  };
  return (x: number, y: number, octaves = 4) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    let freq = 1;
    for (let i = 0; i < octaves; i++) {
      sum += value(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  };
}
