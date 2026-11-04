// The small action menu that opens beside a clicked object.
import type { MenuEntry } from '../game/interact';

import { MENU_MARGIN, placeMenu } from './menu-place';

// Shows the entries as buttons next to the click, kept inside the window.
export function showMenu(el: HTMLElement, entries: MenuEntry[], x: number, y: number) {
  el.innerHTML = entries
    .map((e, i) => `<button data-pick="${i}" ${e.blocked ? 'disabled' : ''}>${e.icon} ${e.label}${e.blocked ? `<small>${e.blocked}</small>` : e.minutes ? `<small>${e.minutes}m</small>` : ''}</button>`)
    .join('');
  // Reset the spot first, so the old position cannot squeeze the menu while we measure it.
  el.style.left = '0px';
  el.style.top = '0px';
  el.style.maxHeight = `${window.innerHeight - 2 * MENU_MARGIN}px`;
  el.style.display = 'grid';
  const size = { width: el.offsetWidth, height: el.offsetHeight };
  const spot = placeMenu(x, y, size, { width: window.innerWidth, height: window.innerHeight });
  el.style.left = `${spot.left}px`;
  el.style.top = `${spot.top}px`;
}

export function hideMenu(el: HTMLElement) {
  el.style.display = 'none';
  el.innerHTML = '';
}
