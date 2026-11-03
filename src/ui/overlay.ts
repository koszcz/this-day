// Full-screen messages: the opening and the end.
import { dayNumber } from '../game/time';
import type { GameState } from '../game/state';

export function showIntro(el: HTMLElement, onBegin: () => void) {
  el.style.display = 'flex';
  el.innerHTML = `<div class="card"><h1>This Day</h1>
    <p>You wake up on cold ground. You do not know where you are.</p>
    <p>Find water. Find food. Keep warm when the sun goes down.</p>
    <button id="begin">Open your eyes</button></div>`;
  el.querySelector('#begin')!.addEventListener('click', () => {
    el.style.display = 'none';
    onBegin();
  });
}

export function showDeath(el: HTMLElement, state: GameState, onRestart: () => void) {
  const days = dayNumber(state.time);
  el.style.display = 'flex';
  el.innerHTML = `<div class="card"><h1>You ${state.dead}</h1>
    <p>You lasted ${days} ${days === 1 ? 'day' : 'days'}.</p>
    <button id="again">Wake up again</button></div>`;
  el.querySelector('#again')!.addEventListener('click', onRestart);
}
