// Which tool the survivor holds in the right hand. Pure rule, no three.js.
export type HeldTool = 'axe' | 'spear';

export interface Carried {
  axe: boolean;
  spear: boolean;
}

/**
 * The tool to show in hand.
 * - Asleep: nothing.
 * - Busy with chopping: the axe, if carried. Fishing or hunting: the spear, if carried.
 * - Busy with anything else: nothing, because the hands are in use.
 * - Otherwise: the best carried tool, the spear first, then the axe.
 */
export function heldTool(carried: Carried, busyId: string | null | undefined, sleeping: boolean): HeldTool | null {
  if (sleeping) return null;
  if (busyId) {
    if (busyId === 'chop') return carried.axe ? 'axe' : null;
    if (busyId === 'fish' || busyId.startsWith('hunt:')) return carried.spear ? 'spear' : null;
    return null;
  }
  if (carried.spear) return 'spear';
  if (carried.axe) return 'axe';
  return null;
}
