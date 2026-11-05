// Full-screen messages: the opening and the end.
import { dayNumber } from '../game/time';
import type { GameState } from '../game/state';
import { t, tn } from '../text/text';

export function showIntro(el: HTMLElement, onBegin: () => void) {
  el.style.display = 'flex';
  el.innerHTML = `<div class="card"><h1>${t('intro.title')}</h1>
    <p>${t('intro.wake')}</p>
    <p>${t('intro.goal')}</p>
    <button id="begin">${t('intro.begin')}</button></div>`;
  el.querySelector('#begin')!.addEventListener('click', () => {
    el.style.display = 'none';
    onBegin();
  });
}

export function showDeath(el: HTMLElement, state: GameState, onRestart: () => void) {
  const days = dayNumber(state.time);
  el.style.display = 'flex';
  el.innerHTML = `<div class="card"><h1>${t('death.title', { cause: state.dead ?? '' })}</h1>
    <p>${tn('death.lasted', days, { n: days })}</p>
    <button id="again">${t('death.again')}</button></div>`;
  el.querySelector('#again')!.addEventListener('click', onRestart);
}
