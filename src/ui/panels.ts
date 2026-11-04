// Pack, crafting and skills panels, plus the progress bar. They only redraw when their content changes.
import { craftableActions } from '../game/actions';
import { ITEMS, type ItemId } from '../game/items';
import { SKILL_NAMES, skillLevel, type SkillId } from '../game/skills';
import type { GameState } from '../game/state';
import { freshCount, hoursUntilRot, rottenCount } from '../game/spoilage';
import { isTool, usesLeft } from '../game/wear';
import { MAX_LOAD, carryLoad, encumbrance } from '../game/weight';

function setHtml(el: HTMLElement, html: string) {
  if (el.dataset.last === html) return;
  el.dataset.last = html;
  el.innerHTML = html;
}

// How fresh the food is: how many are rotten, and when the next one goes off.
function freshness(state: GameState, id: ItemId): string {
  const hours = hoursUntilRot(state, id);
  const rotten = rottenCount(state, id);
  if (hours === null && rotten === 0) return '';
  const parts = [];
  if (rotten > 0) parts.push(freshCount(state, id) > 0 ? `${rotten} rotten` : 'rotten');
  if (hours !== null) parts.push(`rots in ${hours}h`);
  return ` <small>(${parts.join(', ')})</small>`;
}

export function updatePack(el: HTMLElement, state: GameState) {
  const rows = (Object.keys(ITEMS) as ItemId[])
    .filter((id) => (state.inventory[id] ?? 0) > 0)
    .map((id) => {
      const left = isTool(id) ? ` <small>(${usesLeft(state, id)} uses left)</small>` : freshness(state, id);
      return `<div class="row">${ITEMS[id].icon} ${ITEMS[id].name}${left}<b>${state.inventory[id]}</b></div>`;
    });
  const load = carryLoad(state.inventory);
  const note = load >= MAX_LOAD ? ' (full)' : encumbrance(state.inventory) > 0 ? ' (heavy)' : '';
  const head = `<div class="row"><small>Load${note}</small><b>${load} / ${MAX_LOAD}</b></div>`;
  setHtml(el, head + (rows.join('') || '<div class="row dim">Empty</div>'));
}

export function updateCraft(el: HTMLElement, state: GameState) {
  const html = craftableActions(state)
    .map(({ recipe, action, enabled, blocked }) => {
      const cost = Object.entries(recipe.cost).map(([id, n]) => `${n}${ITEMS[id as ItemId].icon}`).join(' ');
      return `<button data-action="${action.id}" ${enabled && !state.busy && !state.sleeping ? '' : 'disabled'} title="${blocked ?? action.warn ?? recipe.blurb}">${recipe.icon} ${recipe.name}<small>${blocked ?? `${cost} · ${recipe.minutes}m`}</small></button>`;
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
