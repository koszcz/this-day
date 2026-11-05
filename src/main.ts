// Starts the game: builds the scene, runs the loop, and connects clicks, taps and the HUD.
import * as THREE from 'three';
import { startAction } from './game/actions';
import { count } from './game/items';
import { newDriver, tick } from './game/drive';
import { createPlaytest } from './playtest/api';
import { clearSave, loadGame, saveGame } from './game/save';
import { newGame, say, type GameState } from './game/state';
import { pickObject, pickWater, sameTarget, type HoverTarget } from './game/hover';
import { createHighlight } from './render/highlight';
import { groundPoint } from './input/pointer';
import { buildDaylight } from './render/daylight';
import { buildAtmosphere } from './render/atmosphere';
import { buildRain } from './render/rain';
import { buildAnimals } from './render/animals';
import { buildPlayer } from './render/player';
import { buildProps } from './render/props';
import { createStage } from './render/scene';
import { buildStructures } from './render/structures';
import { buildTerrain } from './render/terrain';
import { buildWater } from './render/water';
import { surfaceHeight } from './world/query';
import { LAYOUT } from './ui/layout';
import { menuFor, type MenuEntry } from './game/interact';
import { hideMenu, showMenu } from './ui/menu';
import { showDeath, showIntro } from './ui/overlay';
import { updateBusy, updateCraft, updatePack, updateSkills } from './ui/panels';
import { initStats, updateClock, updateLog } from './ui/stats';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const hud = document.getElementById('hud')!;
hud.innerHTML = LAYOUT;
const $ = (id: string) => document.getElementById(id)!;

const stage = createStage(canvas);
const updateSky = buildDaylight(stage.scene);
const updateRain = buildRain(stage.scene);
const updateAtmosphere = buildAtmosphere(stage.scene);
// How grey the sky is, 0 to 1. It eases toward the weather so rain fades in.
let gloom = 0;
const updateBars =initStats($('stats'));
const clock = new THREE.Clock();

// ?seed=N starts a new game on that island. ?slot=name keeps a save of its own, apart from other tabs.
const params = new URLSearchParams(location.search);
const slot = params.get('slot') ?? '';
const seedParam = params.get('seed');
let state: GameState = (seedParam ? null : loadGame(slot)) ?? newGame(seedParam ? Number(seedParam) : (Math.random() * 1e9) | 0);
let started = false;
let paused = false;
// What you told the survivor to do: walk to a point, or an action on an object. And the menu that is open now.
const driver = newDriver();
let menu: { target: HoverTarget; entries: MenuEntry[] } | null = null;
let view: ReturnType<typeof mountWorld>;

function mountWorld(g: GameState) {
  const root = new THREE.Group();
  root.add(buildTerrain(g.world));
  const water = buildWater(g.world);
  root.add(water.mesh);
  const props = buildProps(g.world, g.props);
  root.add(props.group);
  const structures = buildStructures(g.world, root);
  const animals = buildAnimals(g.world, root, g.animals);
  const player = buildPlayer();
  root.add(player.root);
  stage.scene.add(root);
  player.root.position.set(g.player.x, surfaceHeight(g.world, g.player.x, g.player.y), g.player.y);
  stage.focus.copy(player.root.position);
  const highlight = createHighlight(root, { prop: props.find, structure: structures.find, animal: animals.find, player: player.root });
  return { root, water, props, structures, animals, player, highlight, lastX: g.player.x, lastY: g.player.y, y: player.root.position.y };
}

function restart(seed?: number) {
  stage.scene.remove(view.root);
  clearSave(slot);
  state = newGame(seed ?? (Math.random() * 1e9) | 0);
  view = mountWorld(state);
  $('overlay').style.display = 'none';
  driver.target = null;
  driver.errand = null;
  closeMenu();
  hovered = null;
  shown = null;
}

function closeMenu() {
  menu = null;
  hideMenu($('menu'));
}

view = mountWorld(state);
showIntro($('overlay'), () => (started = true));

hud.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const btn = el.closest<HTMLElement>('[data-action]');
  if (btn) startAction(state, btn.dataset.action!);
  const pick = el.closest<HTMLElement>('[data-pick]');
  const entry = pick && menu?.entries[Number(pick.dataset.pick)];
  if (entry && menu && !entry.blocked) {
    driver.errand = { target: menu.target, action: entry.id };
    driver.target = null;
    closeMenu();
  }
});
// A click on an object opens its menu. A click on anything else closes it and walks there.
canvas.addEventListener('click', (e) => {
  if (!started || state.dead) return;
  closeMenu();
  driver.errand = null;
  if (state.busy || state.sleeping) return;
  const clicked = pickAt(e);
  const entries = clicked ? menuFor(state, clicked) : [];
  if (clicked && entries.length) {
    menu = { target: clicked, entries };
    driver.target = null;
    showMenu($('menu'), entries, e.clientX, e.clientY);
    return;
  }
  driver.target = groundPoint(e, stage.camera, canvas, view.y);
});

// Hover: objects are tall, so look for them at chest height first, then on the ground, then water.
let hovered: HoverTarget | null = null;
let shown: HoverTarget | null = null;
function pickAt(e: PointerEvent): HoverTarget | null {
  const high = groundPoint(e, stage.camera, canvas, view.y + 0.8);
  const low = groundPoint(e, stage.camera, canvas, view.y);
  const atHigh = high && pickObject(state, high.x, high.y);
  const atLow = low && pickObject(state, low.x, low.y);
  // She wins at either height, even when a tree stands in front of her.
  if (atHigh?.kind === 'player' || atLow?.kind === 'player') return { kind: 'player' };
  return atHigh || atLow || (low && pickWater(state, low.x, low.y)) || null;
}
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' && started && !state.dead) hovered = pickAt(e);
});
canvas.addEventListener('pointerleave', (e) => {
  if (e.pointerType === 'mouse') hovered = null;
});
// On touch there is no hover. A tap lights up what you touched until the next tap.
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' && started && !state.dead) hovered = pickAt(e);
});
function updateHover() {
  if (state.dead) hovered = null;
  if (sameTarget(hovered, shown)) return;
  shown = hovered;
  view.highlight(shown);
  canvas.style.cursor = shown ? 'pointer' : '';
}

let autosave = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.elapsedTime;
  if (started && !state.dead) {
    if (!paused) tick(state, driver, dt);
    autosave += dt;
    if (autosave > 10) {
      autosave = 0;
      saveGame(state, slot);
    }
    if (state.dead) {
      clearSave(slot);
      showDeath($('overlay'), state, restart);
    }
  }
  const p = view.player.root;
  const ground = surfaceHeight(state.world, state.player.x, state.player.y);
  view.y += (ground - view.y) * Math.min(1, dt * 14);
  const moving = Math.hypot(state.player.x - view.lastX, state.player.y - view.lastY) > 0.001;
  if (moving) p.rotation.y = Math.atan2(state.player.x - view.lastX, state.player.y - view.lastY);
  view.lastX = state.player.x;
  view.lastY = state.player.y;
  p.position.set(state.player.x, view.y, state.player.y);
  view.player.update(moving, state.sleeping, elapsed, state.busy?.id, {
    axe: count(state.inventory, 'axe') > 0,
    spear: count(state.inventory, 'spear') > 0,
  });
  view.props.update();
  view.water.update(elapsed);
  view.structures.update(state.structures, elapsed);
  view.animals.update(state.animals, elapsed);
  updateHover();
  stage.follow(p.position, dt);
  gloom += ((state.weather.raining ? 1 : 0) - gloom) * Math.min(1, dt * 0.8);
  const sky = updateSky(state.time, stage.focus, gloom);
  updateAtmosphere(sky, state.world.size, stage.focus, elapsed, gloom);
  updateRain(gloom, stage.focus, elapsed);
  stage.render();

  updateBars(state);
  updateClock($('clock'), state);
  updateLog($('log'), state);
  updatePack($('pack'), state);
  updateCraft($('craft'), state);
  updateSkills($('skills'), state);
  updateBusy($('busy'), $('busy-bar'), $('busy-label'), state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// The commands a playtester calls from the console. See .claude/skills/playtest.
(window as unknown as { playtest: unknown }).playtest = createPlaytest({
  state: () => state,
  driver: () => driver,
  setPaused: (p) => (paused = p),
  restart: (seed) => (restart(seed), (started = true)),
});
