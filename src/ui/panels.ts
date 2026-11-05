// Pack, crafting and skills panels, plus the progress bar. They only redraw when their content changes.
import { craftableActions } from '../game/actions';
import { ITEMS, type ItemId } from '../game/items';
import { SKILL_IDS, skillLevel } from '../game/skills';
import type { GameState } from '../game/state';
import { freshCount, hoursUntilRot, rottenCount } from '../game/spoilage';
import { isTool, usesLeft } from '../game/wear';
import { MAX_LOAD, carryLoad, encumbrance } from '../game/weight';
import { itemName, recipeBlurb, recipeName, skillName, t, tn } from '../text/text';

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
  if (rotten > 0) parts.push(freshCount(state, id) > 0 ? t('fresh.someRotten', { n: rotten }) : t('fresh.rotten'));
  if (hours !== null) parts.push(t('fresh.rotsIn', { n: hours }));
  return ` <small>(${parts.join(', ')})</small>`;
}

export function updatePack(el: HTMLElement, state: GameState) {
  const rows = (Object.keys(ITEMS) as ItemId[])
    .filter((id) => (state.inventory[id] ?? 0) > 0)
    .map((id) => {
      const left = isTool(id) ? ` <small>${tn('pack.usesLeft', usesLeft(state, id), { n: usesLeft(state, id) })}</small>` : freshness(state, id);
      return `<div class="row">${ITEMS[id].icon} ${itemName(id)}${left}<b>${state.inventory[id]}</b></div>`;
    });
  const load = carryLoad(state.inventory);
  const label = t(load >= MAX_LOAD ? 'pack.loadFull' : encumbrance(state.inventory) > 0 ? 'pack.loadHeavy' : 'pack.load');
  const head = `<div class="row"><small>${label}</small><b>${load} / ${MAX_LOAD}</b></div>`;
  setHtml(el, head + (rows.join('') || `<div class="row dim">${t('pack.empty')}</div>`));
}

export function updateCraft(el: HTMLElement, state: GameState) {
  const html = craftableActions(state)
    .map(({ recipe, action, enabled, blocked }) => {
      const cost = Object.entries(recipe.cost).map(([id, n]) => `${n}${ITEMS[id as ItemId].icon}`).join(' ');
      return `<button data-action="${action.id}" ${enabled && !state.busy && !state.sleeping ? '' : 'disabled'} title="${blocked ?? action.warn ?? recipeBlurb(recipe.id)}">${recipe.icon} ${recipeName(recipe.id)}<small>${blocked ?? `${cost} · ${t('minutes', { n: recipe.minutes })}`}</small></button>`;
    })
    .join('');
  setHtml(el, html);
}

export function updateSkills(el: HTMLElement, state: GameState) {
  const html = SKILL_IDS
    .map((id) => `<div class="row">${skillName(id)}<b>${t('skill.level', { level: skillLevel(state.skills[id]) })}</b></div>`)
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
    label.textContent = t('busy.sleeping');
  }
}
