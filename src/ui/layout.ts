// The fixed HUD layout, built once. Other ui files fill it in.
export const LAYOUT = `
  <div id="stats"></div>
  <div id="clock"></div>
  <div id="side">
    <section><h3>Pack</h3><div id="pack"></div></section>
    <section><h3>Make</h3><div id="craft"></div></section>
    <section><h3>Skills</h3><div id="skills"></div></section>
  </div>
  <div id="log"></div>
  <div id="busy"><div id="busy-bar"></div><span id="busy-label"></span></div>
  <div id="menu"></div>
  <div id="help">click the ground to walk · click an object for its actions · wheel to zoom</div>
  <div id="overlay"></div>
`;
