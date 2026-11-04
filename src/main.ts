// Starts the game: builds the scene, runs the loop, and connects keys, clicks and the HUD.
import * as THREE from 'three';
import { availableActions, startAction } from './game/actions';
import { moveBy, WALK_SPEED } from './game/movement';
import { clearSave, loadGame, saveGame } from './game/save';
import { newGame, type GameState } from './game/state';
import { advance } from './game/step';
import { GAME_MINUTES_PER_SECOND, SLEEP_SPEEDUP } from './game/time';
import { pickObject, pickWater, sameTarget, type HoverTarget } from './game/hover';
import { createHighlight } from './render/highlight';
import { listenKeys, walkDirection } from './input/keys';
import { groundPoint } from './input/pointer';
import { buildDaylight } from './render/daylight';
import { buildPlayer } from './render/player';
import { buildProps } from './render/props';
import { createStage } from './render/scene';
import { buildStructures } from './render/structures';
import { buildTerrain } from './render/terrain';
import { surfaceHeight } from './world/query';
import { LAYOUT } from './ui/layout';
import { showDeath, showIntro } from './ui/overlay';
import { updateActions, updateBusy, updateCraft, updatePack, updateSkills } from './ui/panels';
import { initStats, updateClock, updateLog } from './ui/stats';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const hud = document.getElementById('hud')!;
hud.innerHTML = LAYOUT;
const $ = (id: string) => document.getElementById(id)!;

const stage = createStage(canvas);
const updateSky = buildDaylight(stage.scene);
const updateBars = initStats($('stats'));
const clock = new THREE.Clock();

let state: GameState = loadGame() ?? newGame((Math.random() * 1e9) | 0);
let started = false;
let target: { x: number; y: number } | null = null;
let view: ReturnType<typeof mountWorld>;

function mountWorld(g: GameState) {
  const root = new THREE.Group();
  root.add(buildTerrain(g.world));
  const props = buildProps(g.world, g.props);
  root.add(props.group);
  const structures = buildStructures(g.world, root);
  const player = buildPlayer();
  root.add(player.root);
  stage.scene.add(root);
  player.root.position.set(g.player.x, surfaceHeight(g.world, g.player.x, g.player.y), g.player.y);
  stage.focus.copy(player.root.position);
  const highlight = createHighlight(root, { prop: props.find, structure: structures.find, player: player.root });
  return { root, props, structures, player, highlight, lastX: g.player.x, lastY: g.player.y, y: player.root.position.y };
}

function restart() {
  stage.scene.remove(view.root);
  clearSave();
  state = newGame((Math.random() * 1e9) | 0);
  view = mountWorld(state);
  $('overlay').style.display = 'none';
  target = null;
  hovered = null;
  shown = null;
}

view = mountWorld(state);
showIntro($('overlay'), () => (started = true));

listenKeys((key, shift) => {
  if (!started) return;
  const n = Number(key);
  if (n >= 1 && n <= 9 && !shift) {
    const act = availableActions(state)[n - 1];
    if (act) startAction(state, act.id);
  }
  if (key === 'e') {
    const act = availableActions(state)[0];
    if (act) startAction(state, act.id);
  }
});

hud.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (btn) startAction(state, btn.dataset.action!);
});
canvas.addEventListener('click', (e) => {
  if (!started || state.dead) return;
  target = groundPoint(e, stage.camera, canvas, view.y);
});

// Hover: objects are tall, so look for them at chest height first, then on the ground, then water.
let hovered: HoverTarget | null = null;
let shown: HoverTarget | null = null;
function pickAt(e: PointerEvent): HoverTarget | null {
  const high = groundPoint(e, stage.camera, canvas, view.y + 0.8);
  const low = groundPoint(e, stage.camera, canvas, view.y);
  return (high && pickObject(state, high.x, high.y)) || (low && (pickObject(state, low.x, low.y) ?? pickWater(state, low.x, low.y))) || null;
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
    const dir = walkDirection();
    if (dir.x || dir.y) target = null;
    else if (target) {
      const dx = target.x - state.player.x;
      const dy = target.y - state.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.1) target = null;
      else (dir.x = dx / d), (dir.y = dy / d);
    }
    if (state.busy || state.sleeping) target = null;
    moveBy(state, dir.x * WALK_SPEED * dt, dir.y * WALK_SPEED * dt);
    advance(state, dt * GAME_MINUTES_PER_SECOND * (state.sleeping ? SLEEP_SPEEDUP : 1));
    autosave += dt;
    if (autosave > 10) {
      autosave = 0;
      saveGame(state);
    }
    if (state.dead) {
      clearSave();
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
  view.player.update(moving, state.sleeping, elapsed);
  view.props.update();
  view.structures.update(state.structures, elapsed);
  updateHover();
  stage.follow(p.position, dt);
  updateSky(state.time, stage.focus);
  stage.render();

  updateBars(state);
  updateClock($('clock'), state);
  updateLog($('log'), state);
  updatePack($('pack'), state);
  updateCraft($('craft'), state);
  updateSkills($('skills'), state);
  updateActions($('actions'), state);
  updateBusy($('busy'), $('busy-bar'), $('busy-label'), state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
