// The five need bars, the clock and the log.
import { clockText, dayNumber, daylight } from '../game/time';
import type { GameState } from '../game/state';

const BARS = [
  { key: 'health', icon: '❤️', color: '#d9534f' },
  { key: 'hunger', icon: '🍖', color: '#d99a3d' },
  { key: 'thirst', icon: '💧', color: '#4a9fd9' },
  { key: 'energy', icon: '⚡', color: '#e6d04a' },
  { key: 'warmth', icon: '🔥', color: '#e5732f' },
] as const;

export function initStats(root: HTMLElement) {
  root.innerHTML = BARS.map((b) => `<div class="bar" data-k="${b.key}"><span>${b.icon}</span><div class="track"><i style="background:${b.color}"></i></div></div>`).join('');
  const rows = BARS.map((b) => root.querySelector<HTMLElement>(`[data-k="${b.key}"]`)!);
  return (state: GameState) => {
    BARS.forEach((b, i) => {
      const v = state.stats[b.key];
      rows[i].querySelector('i')!.style.width = `${v}%`;
      rows[i].classList.toggle('low', v < 20);
    });
  };
}

export function updateClock(el: HTMLElement, state: GameState) {
  const sky = daylight(state.time) > 0.1 ? '☀️' : '🌙';
  const sick = state.sick > 0 ? ' · 🤢 sick' : '';
  el.textContent = `${sky} Day ${dayNumber(state.time)} · ${clockText(state.time)}${sick}`;
}

export function updateLog(el: HTMLElement, state: GameState) {
  const text = state.log.slice(-5).map((l) => `<p>${l}</p>`).join('');
  if (el.dataset.last !== text) {
    el.dataset.last = text;
    el.innerHTML = text;
  }
}
