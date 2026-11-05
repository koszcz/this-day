// Sizes and colours of the survivor's figure, in world units. Pure numbers, so tests can check them.
// The figure stands on y = 0 and is about 1.25 tall. The joints in player.ts sit at these heights.

export const COLORS = {
  skin: '#e8b98f',
  hands: '#e8b98f',
  hair: '#4a3322',
  shirt: '#3d6fb0',
  shirtDark: '#2f5788',
  trousers: '#5a4636',
  boots: '#33261b',
  belt: '#2b2018',
  eyes: '#25201c',
} as const;

export const LEG = { length: 0.4, bootHeight: 0.12, offsetX: 0.085, radius: 0.07 } as const;

export const BODY = { hipsY: 0.52, torsoLength: 0.46, neckLength: 0.05, hipWidth: 0.14, shoulderWidth: 0.2 } as const;

export const HEAD = { radius: 0.15, y: 0.51 } as const;

export const ARM = { shoulderY: 0.4, upper: 0.2, lower: 0.2, radius: 0.05, offsetX: 0.25 } as const;

/** Top of the head above the ground. */
export function heightOf(): number {
  return BODY.hipsY + HEAD.y + HEAD.radius * 2;
}

/** Height of the hand below the shoulder pivot. Held tools hang here. */
export function handY(): number {
  return -(ARM.upper + ARM.lower);
}
