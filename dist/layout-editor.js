// Local layout editor for the studio. Loaded only with ?edit on localhost.
// Drag the column dividers or the canvas edge, or use the panel; Save writes layout.css through the dev server.
const FIELDS = [
  {key: '--ps-tools-width', label: 'Tools column', min: 150, max: 340, unit: 'px'},
  {key: '--ps-patterns-width', label: 'Patterns column', min: 140, max: 320, unit: 'px'},
  {key: '--ps-canvas-height', label: 'Canvas height', min: 300, max: 760, unit: 'px'},
  {key: '--ps-page-padding', label: 'Side margins', min: 8, max: 120, unit: 'px'},
  {key: '--ps-sheet-radius', label: 'Corner radius', min: 0, max: 40, unit: 'px'},
  {key: '--ps-text-scale', label: 'Text size', min: .85, max: 1.3, step: .01, unit: ''},
  {key: '--ps-intro-display', label: 'Show intro banner', type: 'toggle'},
  {key: '--red', label: 'Accent', type: 'color'},
  {key: '--bg', label: 'Background', type: 'color'},
  {key: '--paper', label: 'Cutting table', type: 'color'},
];

const CSS = `
.ps-layout-editor{position:fixed;right:16px;bottom:16px;z-index:80;width:300px;max-height:calc(100vh - 32px);overflow:auto;background:#fffdf8;color:#2f2b25;border:1px solid #d9d0c0;border-radius:14px;box-shadow:0 18px 50px #0000003d;font:13px/1.4 system-ui,sans-serif}
.ps-layout-editor header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #ece4d6;cursor:move;user-select:none;position:sticky;top:0;background:#fffdf8;z-index:1}
.ps-layout-editor header strong{font-weight:600;flex:1}
.ps-layout-editor header .dot{width:8px;height:8px;border-radius:50%;background:#ae302a}
.ps-layout-editor button{font:inherit;cursor:pointer;border:1px solid #d9d0c0;background:#fff;border-radius:999px;padding:6px 12px;color:inherit}
.ps-layout-editor button:hover{border-color:#ae302a;color:#ae302a}
.ps-layout-editor button.primary{background:#ae302a;border-color:#ae302a;color:#fff}
.ps-layout-editor button.primary:hover{filter:brightness(.9);color:#fff}
.ps-layout-editor .icon{border:0;padding:4px 8px;background:none}
.ps-layout-editor .body{padding:10px 12px 12px;display:grid;gap:10px}
.ps-layout-editor.collapsed .body{display:none}
.ps-layout-editor label{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 10px}
.ps-layout-editor label input[type=range]{grid-column:1/-1;width:100%;accent-color:#ae302a;margin:0}
.ps-layout-editor label output{color:#6c6253;font-variant-numeric:tabular-nums}
.ps-layout-editor label.inline{grid-template-columns:1fr auto}
.ps-layout-editor input[type=color]{width:40px;height:26px;border:1px solid #d9d0c0;border-radius:6px;padding:0;background:none;cursor:pointer}
.ps-layout-editor .hint{color:#6c6253;font-size:12px;margin:0}
.ps-layout-editor .actions{display:flex;flex-wrap:wrap;gap:8px;padding-top:4px;border-top:1px solid #ece4d6}
.ps-layout-editor .actions .primary{margin-left:auto}
.ps-layout-editor .status{font-size:12px;color:#6c6253;min-height:1.4em;margin:0}
.ps-layout-editor .status.error{color:#ae302a}
.paper-studio .ps-handle{position:absolute;z-index:30;display:none;touch-action:none}
.paper-studio.is-editing .ps-handle{display:block}
.paper-studio .ps-handle::before{content:"";position:absolute;inset:0;margin:auto;border:0 dashed #ae302a99}
.paper-studio .ps-handle:hover::before,.paper-studio .ps-handle.active::before{border-color:#ae302a}
.paper-studio .ps-handle span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#ae302a;color:#fff;font:600 11px system-ui,sans-serif;padding:3px 8px;border-radius:999px;white-space:nowrap;opacity:0;transition:opacity .15s;pointer-events:none}
.paper-studio .ps-handle:hover span,.paper-studio .ps-handle.active span{opacity:1}
.paper-studio .ps-handle--col{top:0;bottom:0;width:14px;cursor:col-resize;transform:translateX(-50%)}
.paper-studio .ps-handle--col::before{width:0;border-left-width:2px}
.paper-studio .ps-handle--tools{left:var(--ps-tools-width)}
.paper-studio .ps-handle--patterns{left:auto;right:var(--ps-patterns-width);transform:translateX(50%)}
.paper-studio .ps-handle--row{left:0;right:0;height:14px;bottom:-7px;cursor:row-resize}
.paper-studio .ps-handle--row::before{height:0;border-top-width:2px}
.paper-studio.is-editing .studio{outline:1px dashed #ae302a55;outline-offset:-1px}
@media (max-width:1100px){.paper-studio .ps-handle--col{display:none!important}}
@media (max-width:640px){.ps-layout-editor{left:8px;right:8px;width:auto;bottom:8px;max-height:55vh}}
`;

const number = value => parseFloat(value);
const fieldValue = (field, value) => field.type === 'color' || field.type === 'toggle' ? value : `${Math.round(value * 100) / 100}${field.unit}`;

export function openLayoutEditor(root, {saveEndpoint = '/__paper-layout'} = {}) {
  const lifetime = new AbortController();
  const {signal} = lifetime;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  root.classList.add('is-editing');

  const computed = getComputedStyle(root);
  const read = key => computed.getPropertyValue(key).trim();
  const initial = Object.fromEntries(FIELDS.map(field => [field.key, read(field.key)]));
  const values = {...initial};

  const panel = document.createElement('aside');
  panel.className = 'ps-layout-editor';
  panel.setAttribute('aria-label', 'Layout editor');
  panel.innerHTML = `<header><span class="dot"></span><strong>Layout editor</strong><button type="button" class="icon" data-collapse aria-label="Collapse">–</button></header>
    <div class="body">
      <p class="hint">Drag the dashed dividers and the bottom edge of the canvas, or use the controls. Save writes <code>layout.css</code>.</p>
      ${FIELDS.map(field => {
        if (field.type === 'color') return `<label class="inline">${field.label}<input type="color" data-key="${field.key}"></label>`;
        if (field.type === 'toggle') return `<label class="inline">${field.label}<input type="checkbox" data-key="${field.key}"></label>`;
        return `<label>${field.label}<output data-out="${field.key}"></output><input type="range" data-key="${field.key}" min="${field.min}" max="${field.max}" step="${field.step || 1}"></label>`;
      }).join('')}
      <div class="actions"><button type="button" data-reset>Reset</button><button type="button" data-copy>Copy CSS</button><button type="button" class="primary" data-save>Save</button></div>
      <p class="status" role="status"></p>
    </div>`;
  document.body.append(panel);
  const status = panel.querySelector('.status');
  const say = (text, error = false) => { status.textContent = text; status.classList.toggle('error', error); };

  function apply(key, value) {
    values[key] = value;
    root.style.setProperty(key, value);
    const field = FIELDS.find(f => f.key === key);
    const input = panel.querySelector(`[data-key="${key}"]`);
    if (field.type === 'color') input.value = value;
    else if (field.type === 'toggle') input.checked = value !== 'none';
    else { input.value = number(value); panel.querySelector(`[data-out="${key}"]`).textContent = field.unit ? `${Math.round(number(value))}${field.unit}` : `${Math.round(number(value) * 100)}%`; }
    say('Unsaved changes');
    window.dispatchEvent(new Event('resize'));
  }
  for (const field of FIELDS) apply(field.key, values[field.key]);
  say('');

  panel.addEventListener('input', event => {
    const key = event.target.dataset.key;
    if (!key) return;
    const field = FIELDS.find(f => f.key === key);
    if (field.type === 'color') apply(key, event.target.value);
    else if (field.type === 'toggle') apply(key, event.target.checked ? 'flex' : 'none');
    else apply(key, fieldValue(field, number(event.target.value)));
  });

  const cssText = () => `/* Studio layout values. Edit by hand, or open the studio on a local server with ?edit and press Save. */\n.paper-studio {\n${FIELDS.map(f => `  ${f.key}: ${values[f.key]};`).join('\n')}\n}\n`;
  panel.querySelector('[data-reset]').addEventListener('click', () => { for (const field of FIELDS) apply(field.key, initial[field.key]); say('Back to the saved layout'); });
  panel.querySelector('[data-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(cssText()); say('CSS copied'); } catch { say('Copy failed. Select the values from layout.css instead.', true); }
  });
  panel.querySelector('[data-save]').addEventListener('click', async () => {
    say('Saving…');
    try {
      const response = await fetch(saveEndpoint, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({values})});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
      Object.assign(initial, values);
      say(`Saved: ${(result.written || ['layout.css']).join(', ')}`);
    } catch (error) { say(`Not saved (${error.message}). Use Copy CSS instead.`, true); }
  });
  panel.querySelector('[data-collapse]').addEventListener('click', event => {
    panel.classList.toggle('collapsed');
    event.currentTarget.textContent = panel.classList.contains('collapsed') ? '+' : '–';
  });

  // Move the panel by its title bar.
  const header = panel.querySelector('header');
  header.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    const rect = panel.getBoundingClientRect(), dx = event.clientX - rect.left, dy = event.clientY - rect.top;
    header.setPointerCapture(event.pointerId);
    const move = e => { panel.style.left = `${Math.max(0, e.clientX - dx)}px`; panel.style.top = `${Math.max(0, e.clientY - dy)}px`; panel.style.right = 'auto'; panel.style.bottom = 'auto'; };
    header.addEventListener('pointermove', move);
    header.addEventListener('pointerup', () => header.removeEventListener('pointermove', move), {once: true});
  });

  // Drag handles on the studio itself.
  const studio = root.querySelector('.studio'), canvasWrap = root.querySelector('.canvas-wrap');
  const handles = [];
  function handle(parent, className, label, onDrag) {
    const el = document.createElement('div');
    el.className = `ps-handle ${className}`;
    el.innerHTML = `<span>${label}</span>`;
    el.addEventListener('pointerdown', event => {
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      el.classList.add('active');
      const start = {x: event.clientX, y: event.clientY, rect: parent.getBoundingClientRect(), height: number(values['--ps-canvas-height'])};
      const move = e => onDrag(e, start);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', () => { el.removeEventListener('pointermove', move); el.classList.remove('active'); }, {once: true});
    });
    parent.append(el);
    handles.push(el);
  }
  const clampTo = (key, value) => { const f = FIELDS.find(x => x.key === key); return Math.min(f.max, Math.max(f.min, value)); };
  handle(studio, 'ps-handle--col ps-handle--tools', 'Tools width', (e, s) => apply('--ps-tools-width', `${Math.round(clampTo('--ps-tools-width', e.clientX - s.rect.left))}px`));
  handle(studio, 'ps-handle--col ps-handle--patterns', 'Patterns width', (e, s) => apply('--ps-patterns-width', `${Math.round(clampTo('--ps-patterns-width', s.rect.right - e.clientX))}px`));
  handle(canvasWrap, 'ps-handle--row', 'Canvas height', (e, s) => apply('--ps-canvas-height', `${Math.round(clampTo('--ps-canvas-height', s.height + e.clientY - s.y))}px`));
  canvasWrap.style.overflow = 'visible';

  window.addEventListener('beforeunload', event => { if (status.textContent === 'Unsaved changes') event.preventDefault(); }, {signal});

  return {
    close() {
      lifetime.abort();
      panel.remove(); style.remove();
      handles.forEach(el => el.remove());
      canvasWrap.style.overflow = '';
      root.classList.remove('is-editing');
    },
  };
}
