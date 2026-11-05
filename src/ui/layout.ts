// The fixed HUD layout, built once. Other ui files fill it in.
import { t } from '../text/text';
import type { TextKey } from '../text/en';

export const layout = () => `
  <div id="stats"></div>
  <div id="clock"></div>
  <div id="side">
    <section><h3 data-text="hud.pack">${t('hud.pack')}</h3><div id="pack"></div></section>
    <section><h3 data-text="hud.make">${t('hud.make')}</h3><div id="craft"></div></section>
    <section><h3 data-text="hud.skills">${t('hud.skills')}</h3><div id="skills"></div></section>
  </div>
  <div id="log"></div>
  <div id="busy"><div id="busy-bar"></div><span id="busy-label"></span></div>
  <div id="menu"></div>
  <button id="language" data-text="hud.language" title="${t('hud.languageLabel')}">${t('hud.language')}</button>
  <div id="help" data-text="hud.help">${t('hud.help')}</div>
  <div id="overlay"></div>
`;

// Writes the fixed texts again, after the language changed.
export function relabel(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-text]').forEach((el) => {
    el.textContent = t(el.dataset.text as TextKey);
  });
  root.querySelector<HTMLElement>('#language')!.title = t('hud.languageLabel');
}
