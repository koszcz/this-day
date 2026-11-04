// Works out where the action menu goes so that all of it stays inside the window.
export const MENU_MARGIN = 8;

export function placeMenu(
  x: number,
  y: number,
  size: { width: number; height: number },
  screen: { width: number; height: number },
) {
  const left = Math.min(screen.width - size.width - MENU_MARGIN, x + 16);
  const top = Math.min(screen.height - size.height - MENU_MARGIN, y - 16);
  return { left: Math.max(MENU_MARGIN, left), top: Math.max(MENU_MARGIN, top) };
}
