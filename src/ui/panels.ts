// Pack, crafting and skills panels, plus the action buttons. They only redraw when their content changes.
import { availableActions, craftableActions } from '../game/actions';
import { ITEMS, type ItemId } from '../game/items';
import { SKILL_NAMES, skillLevel, type SkillId } from '../game/skills';
import type { GameState } from '../game/state';

function setHtml(el: HTMLElement, html: string) {
  if (el.dataset.last === html) return;
  el.dataset.last = html;
  el.innerHTML = html;
}

export function updatePack(el: HTMLElement, state: GameState) {
  const rows = (Object.keys(ITEMS) as ItemId[])
    .filter((id) => (state.inventory[id] ?? 0) > 0)
    .map((id) => `<div class="row">${ITEMS[id].icon} ${ITEMS[id].name}<b>${state.inventory[id]}</b></div>`);
  setHtml(el, rows.join('') || '<div class="row dim">Empty</div>');
}

export function updateCraft(el: HTMLElement, state: GameState) {
  const html = craftableActions(state)
    .map(({ recipe, action, enabled }) => {
      const cost = Object.entries(recipe.cost).map(([id, n]) => `${n}${ITEMS[id as ItemId].icon}`).join(' ');
      return `<button data-action="${action.id}" ${enabled && !state.busy && !state.sleeping ? '' : 'disabled'} title="${recipe.blurb}">${recipe.icon} ${recipe.name}<small>${cost} · ${recipe.minutes}m</small></button>`;
    })
    .join('');
  setHtml(el, html);
}

export function updateSkills(el: HTMLElement, state: GameState) {
  const html = (Object.keys(SKILL_NAMES) as SkillId[])
    .map((id) => `<div class="row">${SKILL_NAMES[id]}<b>Lv ${skillLevel(state.skills[id])}</b></div>`)
    .join('');
  setHtml(el, html);
}

export function updateActions(el: HTMLElement, state: GameState) {
  const locked = state.busy || state.sleeping;
  const html = availableActions(state)
    .map((a, i) => `<button data-action="${a.id}" ${locked || a.blocked ? 'disabled' : ''}><kbd>${i + 1}</kbd>${a.icon} ${a.label}${a.blocked ? `<small>${a.blocked}</small>` : a.minutes ? `<small>${a.minutes}m</small>` : ''}</button>`)
    .join('');
  setHtml(el, html);
}

export function updateBusy(el: HTMLElement, bar: HTMLElement, label: HTMLElement, state: GameState) {
  const b = state.busy;
  el.style.display = b || state.sleeping ? 'block' : 'none';
  if (b) {
    bar.style.width = `${(1 - b.remaining / b.total) * 100}%`;
    label.textContent = b.label;
  } else if (state.sleeping) {
    bar.style.width = `${state.stats.energy}%`;
    label.textContent = 'Sleeping…';
  }
}
