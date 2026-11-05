// The fixed HUD layout, built once. Other ui files fill it in.
import { t } from '../text/text';

export const layout = () => `
  <div id="stats"></div>
  <div id="clock"></div>
  <div id="side">
    <section><h3>${t('hud.pack')}</h3><div id="pack"></div></section>
    <section><h3>${t('hud.make')}</h3><div id="craft"></div></section>
    <section><h3>${t('hud.skills')}</h3><div id="skills"></div></section>
  </div>
  <div id="log"></div>
  <div id="busy"><div id="busy-bar"></div><span id="busy-label"></span></div>
  <div id="menu"></div>
  <div id="help">${t('hud.help')}</div>
  <div id="overlay"></div>
`;
