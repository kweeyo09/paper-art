// Builds dist/layout.css from the layout editor's values. Only known keys and plain values are accepted,
// so a request can never write arbitrary CSS. The portfolio's Vite dev server keeps a copy of this check.
const RULES = {
  '--ps-tools-width': /^\d{2,3}px$/,
  '--ps-patterns-width': /^\d{2,3}px$/,
  '--ps-canvas-height': /^\d{3}px$/,
  '--ps-page-padding': /^\d{1,3}px$/,
  '--ps-sheet-radius': /^\d{1,2}px$/,
  '--ps-text-scale': /^(0|1)(\.\d{1,2})?$/,
  '--ps-intro-display': /^(flex|none)$/,
  '--red': /^#[0-9a-f]{6}$/i,
  '--bg': /^#[0-9a-f]{6}$/i,
  '--paper': /^#[0-9a-f]{6}$/i,
};

function layoutCss(values) {
  if (!values || typeof values !== 'object') throw new Error('Expected {values}');
  const lines = Object.entries(RULES).map(([key, rule]) => {
    const value = String(values[key] ?? '').trim();
    if (!rule.test(value)) throw new Error(`Invalid value for ${key}: ${value || '(empty)'}`);
    return `  ${key}: ${value};`;
  });
  return `/* Studio layout values. Edit by hand, or open the studio on a local server with ?edit and press Save. */\n.paper-studio {\n${lines.join('\n')}\n}\n`;
}

module.exports = {layoutCss, RULES};
