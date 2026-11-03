// Keyboard state, turned into a walking direction that matches the isometric camera.
const held = new Set<string>();

export function listenKeys(onPress: (key: string, shift: boolean) => void) {
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    held.add(e.key.toLowerCase());
    onPress(e.key.toLowerCase(), e.shiftKey);
  });
  window.addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => held.clear());
}

// Screen-up is world (-1, -1) because the camera looks from the (+x, +z) corner.
export function walkDirection(): { x: number; y: number } {
  const right = (held.has('d') || held.has('arrowright') ? 1 : 0) - (held.has('a') || held.has('arrowleft') ? 1 : 0);
  const up = (held.has('w') || held.has('arrowup') ? 1 : 0) - (held.has('s') || held.has('arrowdown') ? 1 : 0);
  const k = Math.SQRT1_2;
  return { x: (right - up) * k, y: (-right - up) * k };
}
