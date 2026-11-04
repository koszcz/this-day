// The small action menu that opens beside a clicked object.
import type { MenuEntry } from '../game/interact';

const MARGIN = 8;

// Shows the entries as buttons next to the click, kept inside the window.
export function showMenu(el: HTMLElement, entries: MenuEntry[], x: number, y: number) {
  el.innerHTML = entries
    .map((e, i) => `<button data-pick="${i}" ${e.blocked ? 'disabled' : ''}>${e.icon} ${e.label}${e.blocked ? `<small>${e.blocked}</small>` : e.minutes ? `<small>${e.minutes}m</small>` : ''}</button>`)
    .join('');
  el.style.display = 'grid';
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  el.style.left = `${Math.max(MARGIN, Math.min(window.innerWidth - w - MARGIN, x + 16))}px`;
  el.style.top = `${Math.max(MARGIN, Math.min(window.innerHeight - h - MARGIN, y - 16))}px`;
}

export function hideMenu(el: HTMLElement) {
  el.style.display = 'none';
  el.innerHTML = '';
}
