import {t, toggleLanguage, translateRoot, language} from './i18n.js';
import {createWindowPreview} from './window-preview.js';

const ICONS = `<svg class="ps-icon-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<symbol id="i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 12 12M8 16 20 4m-8 8 2 2"/></symbol>
<symbol id="i-pencil" viewBox="0 0 24 24"><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15l-1 5Z"/></symbol>
<symbol id="i-undo" viewBox="0 0 24 24"><path d="m9 5-5 5 5 5M4 10h10a6 6 0 0 1 0 12" transform="translate(0 -2)"/></symbol>
<symbol id="i-redo" viewBox="0 0 24 24"><path d="m15 5 5 5-5 5m5-5H10a6 6 0 0 0 0 12" transform="translate(0 -2)"/></symbol>
<symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></symbol>
<symbol id="i-open" viewBox="0 0 24 24"><path d="m12 5-8-2v16l8 2 8-2V3l-8 2Zm0 0v16"/></symbol>
<symbol id="i-reset" viewBox="0 0 24 24"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19"/></symbol>
<symbol id="i-window" viewBox="0 0 24 24"><path d="M3 3h18v18H3zM12 3v18M3 11h18"/></symbol>
</defs></svg>`;

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

function markup({embedded, homeHref, footerLink}) {
  const brandInner = `<span class="seal">剪<br>纸</span><span class="brand-name">一纸生花<span class="brand-sub">指 尖 上 的 剪 纸 工 坊</span></span>`;
  const footerStart = footerLink ? `<a class="ps-footer-link" href="${escapeHtml(footerLink.href)}">${escapeHtml(footerLink.label)}</a>` : '<span>一纸生花</span>';
  return `${ICONS}
<div class="ps-page">
  <header class="ps-header">
    ${homeHref ? `<a class="brand" href="${escapeHtml(homeHref)}" aria-label="一纸生花首页">${brandInner}</a>` : `<div class="brand">${brandInner}</div>`}
    <div class="header-right"><button class="text-button" id="help-button" type="button">剪纸小笺 <span class="help-circle" aria-hidden="true">?</span></button><button id="language-toggle" class="language-toggle" type="button" lang="en" aria-label="Switch to English"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg><span class="language-label">English</span></button></div>
  </header>
  <div class="ps-main">
    <section class="introduction">
      <h1>一纸一剪，<span>万象生花。</span></h1>
      <div class="intro-art" aria-hidden="true"><canvas id="ornament" width="240" height="240"></canvas><div class="vertical-verse">方寸之间<br>自有天地</div></div>
    </section>
    <section class="studio" aria-label="剪纸工作台">
      <aside class="settings">
        <div class="section-heading"><h2>折纸</h2><span>起于一张纸</span></div>
        <div class="fold-options" role="group" aria-label="折纸方式">
          <button type="button" data-fold="4" aria-pressed="false"><svg viewBox="0 0 40 40"><path d="M20 33 8 7h24Z M20 33V7"/></svg><span>四折</span></button>
          <button type="button" data-fold="5" aria-pressed="false"><svg viewBox="0 0 40 40"><path d="m20 33-9-26h18Z M20 33V7"/></svg><span>五折</span></button>
          <button type="button" data-fold="6" class="selected" aria-pressed="true"><svg viewBox="0 0 40 40"><path d="m20 33-7-26h14Z M20 33V7"/></svg><span>六折</span></button>
        </div>
        <p class="small-note" id="fold-note">六重对称，剪出繁花之美</p>
        <div class="paper-section"><div class="section-heading"><h2>纸色</h2><span id="color-name">朱砂</span></div><div class="swatches" role="group" aria-label="选择纸色">
          <button type="button" data-color="#b92e2a" data-name="朱砂" class="swatch selected" style="--swatch:#b92e2a" aria-label="朱砂红" aria-pressed="true"></button>
          <button type="button" data-color="#8c2939" data-name="胭脂" class="swatch" style="--swatch:#8c2939" aria-label="胭脂红" aria-pressed="false"></button>
          <button type="button" data-color="#b38437" data-name="秋香" class="swatch" style="--swatch:#b38437" aria-label="秋香金" aria-pressed="false"></button>
          <button type="button" data-color="#376860" data-name="松烟" class="swatch" style="--swatch:#376860" aria-label="松烟绿" aria-pressed="false"></button>
        </div></div>
        <div class="tools-section"><div class="section-heading"><h2>执笔与剪</h2></div>
          <button type="button" class="tool selected" data-tool="cut" aria-pressed="true"><svg><use href="#i-scissors"/></svg><span>剪刀<small>圈选一处，轻轻剪去</small></span><kbd>剪</kbd></button>
          <button type="button" class="tool" data-tool="draw" aria-pressed="false"><svg><use href="#i-pencil"/></svg><span>画笔<small>先勾勒心中的图案</small></span><kbd>绘</kbd></button>
          <label class="guide-option"><input type="checkbox" id="guide-toggle" checked><span class="checkmark"></span>显示折痕参考线</label>
        </div>
        <div class="side-note"><span>慢慢来，</span><br>美好藏在留白里。<svg><use href="#i-scissors"/></svg></div>
      </aside>
      <div class="work-area">
        <div class="work-header"><div><span class="status-dot"></span><span id="stage-label">折纸 · 待你落剪</span></div><div class="history-controls"><button type="button" id="undo" class="icon-button" title="撤销（Ctrl+Z）" aria-label="撤销" disabled><svg><use href="#i-undo"/></svg></button><button type="button" id="redo" class="icon-button" title="重做（Ctrl+Shift+Z）" aria-label="重做" disabled><svg><use href="#i-redo"/></svg></button><span class="toolbar-divider"></span><button type="button" id="reset" class="icon-button" title="重新开始" aria-label="重新开始"><svg><use href="#i-reset"/></svg></button></div></div>
        <div class="canvas-wrap" id="canvas-wrap"><span class="corner top-left"></span><span class="corner top-right"></span><span class="corner bottom-left"></span><span class="corner bottom-right"></span>
          <span class="canvas-vertical" aria-hidden="true">虚实相生 · 剪出心意</span>
          <button type="button" id="resume-draft" class="resume-chip" hidden><svg><use href="#i-reset"/></svg><span>继续上次的剪纸</span></button>
          <canvas id="paper-canvas" width="1200" height="1080" tabindex="0" aria-label="剪纸画布。拖动画笔勾画；使用剪刀拖动圈选，松开后剪去。也可点击逐点圈选，按回车完成，退出键取消。"></canvas>
          <div class="canvas-bottom"><span id="canvas-mode">六折纸</span><span id="cut-count">尚未落剪</span></div>
        </div>
        <div class="work-bottom"><p id="instruction"><svg><use href="#i-scissors"/></svg><span>按住拖动，圈出想剪去的部分，松开即可裁剪</span></p><button type="button" id="reveal" class="primary-button"><svg><use href="#i-open"/></svg><span>展开 · 见惊喜</span><svg class="arrow"><use href="#i-arrow"/></svg></button></div>
      </div>
      <aside class="inspiration"><div class="section-heading"><h2>从一朵花开始</h2></div><p class="inspiration-intro">不妨借一缕灵感，<br>再剪出自己的模样。</p>
        <div class="pattern-list">
          <button type="button" class="pattern" data-pattern="bloom"><canvas width="220" height="220" aria-hidden="true"></canvas><span><b>团花</b><small>花开圆满</small><svg><use href="#i-arrow"/></svg></span></button>
          <button type="button" class="pattern" data-pattern="star"><canvas width="220" height="220" aria-hidden="true"></canvas><span><b>繁星</b><small>星河入梦</small><svg><use href="#i-arrow"/></svg></span></button>
          <button type="button" class="pattern" data-pattern="leaf"><canvas width="220" height="220" aria-hidden="true"></canvas><span><b>叶语</b><small>一叶知秋</small><svg><use href="#i-arrow"/></svg></span></button>
        </div>
        <span class="pattern-note">点击花样，接着创作</span>
      </aside>
    </section>
    <section id="window-preview" class="window-preview" hidden aria-labelledby="window-heading">
      <div class="window-heading-row"><div><button type="button" id="window-back" class="text-button back-button"><svg class="back-arrow"><use href="#i-arrow"/></svg><span>回到剪纸台</span></button><h2 id="window-heading" tabindex="-1">纸映窗间</h2><p>把心意贴上窗，让光穿过你的剪纸。</p></div><div class="light-options" role="group" aria-label="选择窗外光线">
        <button type="button" data-light="sunlight" aria-pressed="true"><span class="light-dot sunlight-dot"></span><span>阳光</span></button>
        <button type="button" data-light="snow" aria-pressed="false"><span class="light-dot snow-dot"></span><span>雪景</span></button>
        <button type="button" data-light="dawn" aria-pressed="false"><span class="light-dot dawn-dot"></span><span>暖色晨曦</span></button>
      </div></div>
      <div class="window-scene" id="window-scene" data-light="sunlight">
        <canvas id="window-landscape" width="1600" height="1000" aria-hidden="true"></canvas>
        <div class="window-glass" id="window-glass"><div class="glass-reflection" aria-hidden="true"></div><div class="snowfall" id="snowfall" aria-hidden="true"></div><canvas id="window-art" width="1200" height="1200" role="img" tabindex="0" aria-label="窗上的剪纸，可拖动或使用方向键移动"></canvas></div>
        <div class="window-frame" aria-hidden="true"><span class="frame-top"></span><span class="frame-bottom"></span><span class="frame-left"></span><span class="frame-right"></span><span class="frame-rail rail-left"></span><span class="frame-rail rail-right"></span><span class="frame-crossbar"></span></div>
        <div class="window-sill" aria-hidden="true"></div>
      </div>
      <div class="window-toolbar">
        <div class="window-field window-sizing"><label for="window-size">剪纸大小</label><input id="window-size" type="range" min="25" max="90" value="62"><output id="window-size-value" for="window-size">62%</output></div>
        <div class="window-actions"><button type="button" id="window-center" class="chip-button">重新居中</button><button type="button" id="window-motion" class="chip-button window-motion" aria-pressed="true">暂停微风</button></div>
      </div>
      <div class="window-meta"><p class="window-hint"><svg><use href="#i-window"/></svg><span>拖动剪纸，找到喜欢的位置；方向键也能移动。</span></p><p id="window-render-status" class="render-status" role="status"></p></div>
      <p class="window-caption" id="window-caption" role="status">阳光穿过窗，照亮剪纸的每一处细节。</p>
      <p class="model-credit"><span>窗模型</span> · <a href="https://sketchfab.com/3d-models/window--wooden-8-mb-ef344b45b2ce42ef9f96c0d7fdf3c560" target="_blank" rel="noopener">Mehdi Shahsavan</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p>
    </section>
  </div>
  ${embedded ? '' : `<footer class="ps-footer">${footerStart}<span>折 · 画 · 剪 · 展</span></footer>`}
</div>
<div class="ps-toast" role="status" aria-live="polite"></div>
<dialog id="help-dialog" class="ps-dialog"><button type="button" class="dialog-close icon-button" aria-label="关闭说明"><svg><use href="#i-close"/></svg></button><span class="dialog-seal">剪</span><h2>一张纸的奇妙旅程</h2><ol><li><strong>折一折</strong><p>选择四折、五折或六折，得到四、五或六重对称的花样。这里的折数指花样的对称方式。</p></li><li><strong>画一画</strong><p>用画笔在红纸上勾勒草图。铅笔线只是参考，展开与导出时不会显示。</p></li><li><strong>剪一剪</strong><p>选中剪刀，按住拖动圈出一个区域，松开即剪去。也可逐点点击，按回车闭合裁剪。剪过纸边，可以改变轮廓；剪在纸内，可以镂空。</p></li><li><strong>展一展</strong><p>点击展开，看看你的剪纸。还可以收起继续剪，或保存透明背景的图片。</p></li></ol><p class="dialog-tip">剪错了也没关系，撤销即可。花样按钮会替换当前作品。</p><button type="button" id="help-done" class="primary-button">开始我的剪纸</button></dialog>`;
}

const STYLES = ['style.css', 'window-preview.css', 'layout.css'];
const FONTS = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Ma+Shan+Zheng&display=swap';

/** Adds the studio stylesheets once per document; resolves when they have loaded. */
function ensureStyles() {
  const wanted = [FONTS, ...STYLES.map(file => new URL(`./${file}`, import.meta.url).href)];
  return Promise.all(wanted.map(href => {
    const existing = [...document.querySelectorAll('link[rel=stylesheet]')].find(link => link.href === href);
    if (existing) return existing.sheet ? null : new Promise(done => { existing.addEventListener('load', done, {once: true}); existing.addEventListener('error', done, {once: true}); });
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = href; link.dataset.paperStudio = '';
    const loaded = new Promise(done => { link.onload = done; link.onerror = done; });
    document.head.append(link);
    return href === FONTS ? null : loaded;
  }));
}

/**
 * Renders the paper-cutting studio into `root` and wires it up.
 * Options: embedded (a framed sheet inside another page: no own footer), homeHref (brand link; omit for none),
 * footerLink ({href, label} shown at the start of the footer), titleSuffix (appended to document.title),
 * editLayout (open the layout editor).
 * Returns an unmount function that removes every listener, timer and WebGL context, and restores the page's
 * title, language and description.
 */
export async function mountStudio(root, {embedded = false, homeHref, footerLink, titleSuffix = '', editLayout = false, saveEndpoint} = {}) {
  await ensureStyles();
  const lifetime = new AbortController();
  const {signal} = lifetime;
  root.classList.add('paper-studio', embedded ? 'is-embedded' : 'is-standalone');
  root.innerHTML = markup({embedded, homeHref, footerLink});
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const previousTitle = document.title, previousLang = document.documentElement.lang;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const previousDescription = descriptionMeta?.content;
  const translate = () => {
    translateRoot(root);
    document.title = t('一纸生花 · 剪纸工坊', 'Paper in Bloom · Paper-cutting Studio') + titleSuffix;
    if (!embedded) {
      document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
      if (descriptionMeta) descriptionMeta.content = t('一张红纸，一把剪刀。勾画、裁剪、展开，在指尖创造属于你的中式窗花。', 'Fold, sketch, cut and unfold your own Chinese-inspired paper art.');
    }
  };

  const canvas = $('#paper-canvas');
  const ctx = canvas.getContext('2d');
  const names = {4:'四',5:'五',6:'六'};
  const STORAGE_KEY = 'yizhi-shenghua-v1';
  let fold = 6, color = '#b92e2a', tool = 'cut', operations = [], redoStack = [];
  let revealed = false, active = null, polygon = [], animationFrame = 0, animating = false;
  let revealProgress = 0, toastTimer, saveTimer, warmTimer, moved = false, downPoint = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const makeCanvas = (size) => {const c=document.createElement('canvas');c.width=c.height=size;return c;};
  const sector = makeCanvas(1024);
  const windowPreview = createWindowPreview(root, target => fullArt(target,fold,operations,color), {signal, translate});
  let persisted = true;

  function toast(message) {
    const el=$('.ps-toast');el.textContent=t(message);
    // Sit just below any sticky site header so the message never covers the buttons being used.
    const header=embedded?document.querySelector('header.site-header'):null;
    const bottom=header?header.getBoundingClientRect().bottom:0;
    el.style.top=`${Math.max(bottom,0)+16}px`;
    el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000);
  }
  function persist() { clearTimeout(saveTimer);saveTimer=setTimeout(writeDraft,250); }
  function writeDraft() { saveTimer=0;try{localStorage.setItem(STORAGE_KEY,JSON.stringify({fold,color,operations}));persisted=true;$('#resume-draft').hidden=true;}catch{if(persisted)toast('浏览器暂时无法保存，请展开后下载作品');persisted=false;} }
  function wedgePath(c,n) {const a=Math.PI/(2*n)+.0007;c.beginPath();c.moveTo(0,0);c.lineTo(-Math.sin(a),-Math.cos(a));c.lineTo(Math.sin(a),-Math.cos(a));c.closePath();}
  function path(c,points,close=true) {if(!points.length)return;c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);if(close)c.closePath();}
  function sectorImage(n=fold,ops=operations,tint=color,target=sector) {
    const c=target.getContext('2d');const half=target.width/2;const radius=target.width*470/1024;
    c.clearRect(0,0,target.width,target.height);c.save();c.translate(half,half);c.scale(radius,radius);
    c.fillStyle=tint;wedgePath(c,n);c.fill();c.globalCompositeOperation='destination-out';
    for(const op of ops){if(op.type!=='cut')continue;path(c,op.points);c.fill('evenodd');}
    c.restore();return target;
  }
  function fullArt(target,n,ops,tint,p=1) {
    const c=target.getContext('2d');const size=target.width;const s=sectorImage(n,ops,tint,makeCanvas(1024));
    c.clearRect(0,0,size,size);c.save();c.translate(size/2,size/2);const scale=size*.44/470;c.scale(scale,scale);
    for(let i=2*n-1;i>=0;i--){c.save();c.rotate(i*Math.PI/n*p);if(i%2)c.scale(-1,1);c.drawImage(s,-512,-512);c.restore();}c.restore();
  }
  function draw() {
    ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,600,540);
    if(revealed||animating){
      const art=makeCanvas(1000);fullArt(art,fold,operations,color,revealProgress);
      const scale=.75+.25*revealProgress;ctx.save();ctx.translate(300,270);ctx.scale(scale,scale);ctx.shadowColor='#51251820';ctx.shadowBlur=10;ctx.shadowOffsetY=7;ctx.drawImage(art,-245,-245,490,490);ctx.restore();return;
    }
    const img=sectorImage();
    ctx.save();ctx.translate(300,450);ctx.scale(360/470,360/470);
    // Offset sheets make the folded stack visible; cuts go through every sheet.
    for(let i=3;i>=1;i--){ctx.save();ctx.translate(i*3,-i*2);ctx.globalAlpha=.12;ctx.drawImage(img,-512,-512);ctx.restore();}
    ctx.shadowColor='#62271b2d';ctx.shadowBlur=23;ctx.shadowOffsetX=8;ctx.shadowOffsetY=12;ctx.drawImage(img,-512,-512);ctx.restore();
    ctx.save();ctx.translate(300,450);ctx.scale(360,360);wedgePath(ctx,fold);ctx.clip();
    if($('#guide-toggle').checked){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-1);ctx.strokeStyle='#f8d6ae65';ctx.lineWidth=.002;ctx.setLineDash([.012,.012]);ctx.stroke();ctx.setLineDash([]);}
    for(const op of operations){if(op.type==='draw'){path(ctx,op.points,false);ctx.strokeStyle='#ffe5b6b8';ctx.lineWidth=.005;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}}
    ctx.restore();
    const points=active?.points||polygon;
    if(points.length){ctx.save();ctx.translate(300,450);ctx.scale(360,360);path(ctx,points,tool==='cut');if(tool==='cut'){ctx.fillStyle='#fff2d32b';ctx.fill('evenodd');ctx.strokeStyle='#fff5d8';ctx.lineWidth=.003;ctx.setLineDash([.012,.009]);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#f9e6c8';ctx.beginPath();ctx.arc(points[0][0],points[0][1],.009,0,Math.PI*2);ctx.fill();}else{ctx.strokeStyle='#ffe5b6';ctx.lineWidth=.005;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}ctx.restore();}
  }
  function pointFromEvent(e) {
    const r=canvas.getBoundingClientRect();const fit=Math.min(r.width/600,r.height/540);
    const left=r.left+(r.width-600*fit)/2,top=r.top+(r.height-540*fit)/2;
    return [((e.clientX-left)/fit-300)/360,((e.clientY-top)/fit-450)/360];
  }
  function area(points){let a=0;for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];a+=p[0]*q[1]-q[0]*p[1];}return Math.abs(a/2);}
  function alphaTotal(img){const data=img.getContext('2d',{willReadFrequently:true}).getImageData(0,0,img.width,img.height).data;let total=0;for(let i=3;i<data.length;i+=4)total+=data[i];return total;}
  function commit(op){
    if(op.points.length<2)return;
    if(op.type==='cut'){
      if(op.points.length<3||area(op.points)<.00015){toast('圈出的范围太小，再试着剪大一点');return;}
      const small=makeCanvas(256);const before=alphaTotal(sectorImage(fold,operations,color,small));
      const after=alphaTotal(sectorImage(fold,[...operations,op],color,small));
      if(before-after<255){toast('没有剪到纸，请把圈选范围移到纸上');return;}
    }
    operations.push(op);redoStack=[];update();persist();
  }
  canvas.addEventListener('pointerdown',e=>{
    if(revealed||animating||e.button!==0||active)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);downPoint=pointFromEvent(e);moved=false;active={type:tool,points:[downPoint],pointerId:e.pointerId};draw();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!active||active.pointerId!==e.pointerId)return;const p=pointFromEvent(e),last=active.points.at(-1);
    if(Math.hypot(p[0]-downPoint[0],p[1]-downPoint[1])>.009)moved=true;
    if(Math.hypot(p[0]-last[0],p[1]-last[1])>.003){active.points.push(p);draw();}
  });
  canvas.addEventListener('pointerup',e=>{
    if(!active||active.pointerId!==e.pointerId)return;
    const op={type:active.type,points:active.points};active=null;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(tool==='cut'&&!moved){const p=pointFromEvent(e);if(polygon.length>2&&Math.hypot(p[0]-polygon[0][0],p[1]-polygon[0][1])<.035){const points=polygon;polygon=[];commit({type:'cut',points});}else{polygon.push(p);toast('继续点击圈选，按回车完成，退出键取消');}}
    else {if(polygon.length){op.points=[...polygon,...op.points];polygon=[];}commit(op);}draw();
  });
  canvas.addEventListener('pointercancel',()=>{active=null;draw();});
  canvas.addEventListener('lostpointercapture',()=>{if(active){active=null;draw();}});
  function setTool(value){tool=value;active=null;polygon=[];$$('[data-tool]').forEach(b=>{b.classList.toggle('selected',b.dataset.tool===tool);b.setAttribute('aria-pressed',String(b.dataset.tool===tool));});update();}
  function update(){
    $('#undo').disabled=!operations.length||animating;$('#redo').disabled=!redoStack.length||animating;
    const cuts=operations.filter(x=>x.type==='cut').length;
    $('#cut-count').textContent=cuts?t(`已落 ${cuts} 剪`,`${cuts} ${cuts===1?'cut':'cuts'} made`):t('尚未落剪');
    $('#canvas-mode').textContent=revealed?t(`${names[fold]}重对称 · 一纸生花`,`${fold}-fold symmetry · Paper in Bloom`):t(`${names[fold]}折纸`,`${fold}-fold paper`);
    $('#stage-label').textContent=revealed?'展开 · 一纸生花':cuts?'折纸 · 心意渐成':'折纸 · 待你落剪';
    if($('#instruction')){
      $('#instruction span').textContent=tool==='cut'?'按住拖动，圈出想剪去的部分，松开即可裁剪':'在纸上轻轻勾画，草图不会出现在成品中';
      $('#instruction use').setAttribute('href',tool==='cut'?'#i-scissors':'#i-pencil');
    }
    $$('[data-fold]').forEach(b=>{b.classList.toggle('selected',+b.dataset.fold===fold);b.setAttribute('aria-pressed',String(+b.dataset.fold===fold));});
    $$('[data-color]').forEach(b=>{b.classList.toggle('selected',b.dataset.color===color);b.setAttribute('aria-pressed',String(b.dataset.color===color));if(b.dataset.color===color)$('#color-name').textContent=b.dataset.name;});
    $('#fold-note').textContent=t(`${names[fold]}重对称，剪出${fold===4?'方圆':fold===5?'灵动':'繁花'}之美`,`${fold}-fold symmetry · ${fold===4?'balanced forms':fold===5?'playful patterns':'floral rhythms'}`);
    translate();
    draw();
  }
  function confirmReplace(){return !operations.length||window.confirm(t('这会替换当前作品。是否继续？'));}
  $$('[data-fold]').forEach(b=>b.addEventListener('click',()=>{if(fold===+b.dataset.fold)return;if(!confirmReplace())return;fold=+b.dataset.fold;operations=[];redoStack=[];foldBack();update();persist();}));
  $$('[data-color]').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.color;update();persist();}));
  $$('[data-tool]').forEach(b=>b.addEventListener('click',()=>{if(revealed)foldBack();setTool(b.dataset.tool);}));
  $('#guide-toggle').addEventListener('change',draw);
  function undo(){if(animating||!operations.length)return;if(revealed)foldBack();redoStack.push(operations.pop());polygon=[];update();persist();}
  function redo(){if(animating||!redoStack.length)return;if(revealed)foldBack();operations.push(redoStack.pop());update();persist();}
  $('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
  $('#reset').addEventListener('click',()=>{if(!confirmReplace())return;operations=[];redoStack=[];foldBack();update();persist();toast('新纸已铺好，重新落剪吧');});
  document.addEventListener('keydown',e=>{
    if($('#help-dialog').open||!$('#window-preview').hidden)return;
    // Leave typing in the host site's own fields alone.
    if(!root.contains(e.target)&&e.target!==document.body&&e.target.closest?.('input, textarea, select, [contenteditable]'))return;
    if(e.key==='Escape'){polygon=[];active=null;draw();}
    if(e.key==='Enter'&&document.activeElement===canvas&&polygon.length>=3){e.preventDefault();const points=polygon;polygon=[];commit({type:'cut',points});draw();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
  },{signal});
  const normalBottom=$('.work-bottom').innerHTML;
  function unfold(){
    if(animating)return;polygon=[];active=null;revealed=true;animating=true;$('.work-area').classList.add('revealed');
    $('.work-bottom').innerHTML='<p>方寸红纸，展开便是满眼风华。</p><div class="reveal-actions"><button type="button" id="try-window" class="primary-button window-preview-button"><svg><use href="#i-window"/></svg><span>贴上窗，看看光影</span><svg class="arrow"><use href="#i-arrow"/></svg></button><button type="button" id="fold-back" class="secondary-button"><svg><use href="#i-open"/></svg><span>收起继续剪</span></button><button type="button" id="download" class="secondary-button"><svg><use href="#i-download"/></svg><span>保存我的剪纸</span></button></div>';
    $('#try-window').addEventListener('click',()=>windowPreview.open());
    // Start building the 3D window once the unfold settles, so the preview opens without a wait.
    $('#try-window').addEventListener('pointerenter',windowPreview.warm);$('#try-window').addEventListener('focus',windowPreview.warm);
    clearTimeout(warmTimer);warmTimer=setTimeout(windowPreview.warm,(reducedMotion.matches?0:1100)+200);
    $('#fold-back').addEventListener('click',foldBack);$('#download').addEventListener('click',download);
    update();const start=performance.now(),duration=reducedMotion.matches?0:1100;
    const tick=time=>{const p=duration?Math.min((time-start)/duration,1):1;revealProgress=1-Math.pow(1-p,4);draw();if(p<1)animationFrame=requestAnimationFrame(tick);else{animating=false;update();if($('#window-preview').hidden)$('#try-window').focus({preventScroll:true});}};
    animationFrame=requestAnimationFrame(tick);
  }
  function foldBack(){cancelAnimationFrame(animationFrame);animating=false;revealed=false;revealProgress=0;active=null;polygon=[];$('.work-area').classList.remove('revealed');$('.work-bottom').innerHTML=normalBottom;$('#reveal').addEventListener('click',unfold);update();}
  $('#reveal').addEventListener('click',unfold);
  function download(){const out=makeCanvas(2400);fullArt(out,fold,operations,color);out.toBlob(blob=>{if(!blob){toast('图片生成失败，请重试');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=t(`一纸生花-${names[fold]}折剪纸.png`,`Paper-in-Bloom-${fold}-fold.png`);a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);toast('剪纸已保存为透明背景图片');},'image/png');}
  function ellipse(cx,cy,rx,ry,angle=0,count=38){return Array.from({length:count},(_,i)=>{const a=i/count*2*Math.PI,x=Math.cos(a)*rx,y=Math.sin(a)*ry;return[cx+x*Math.cos(angle)-y*Math.sin(angle),cy+x*Math.sin(angle)+y*Math.cos(angle)];});}
  function preset(type,n=6){
    const w=Math.sin(Math.PI/(2*n));const cuts=[];
    const add=points=>cuts.push({type:'cut',points});
    if(type==='bloom'){
      add(ellipse(0,-.59,w*.29,.17));add(ellipse(w*.83,-.77,w*.48,.15,-.15));add(ellipse(w*.42,-.29,w*.28,.085,-.55));
      add(ellipse(-w*.7,-.91,w*.58,.10));add(ellipse(0,-1.015,w*.5,.135));add(ellipse(0,-.13,w*.13,.047));
    }else if(type==='star'){
      add([[0,-.82],[w*.43,-.62],[0,-.43],[-w*.43,-.62]]);
      add([[w*.3,-1.05],[w*1.2,-1.05],[w*.8,-.79]]);
      add([[w*.18,-.38],[w*.7,-.49],[w*.45,-.22]]);
      add(ellipse(0,-.23,w*.13,.038));add(ellipse(w*.82,-.71,w*.12,.032));
    }else{
      add(ellipse(0,-.63,w*.20,.25,-.08));
      for(let i=0;i<4;i++)add(ellipse(w*(.25+i*.14),-.34-i*.145,w*.30,.056,-.45));
      add(ellipse(-w*.75,-.91,w*.62,.08));add(ellipse(0,-1.025,w*.55,.12));
    }return cuts;
  }
  $$('[data-pattern]').forEach(b=>{fullArt(b.querySelector('canvas'),6,preset(b.dataset.pattern),'#b13730');b.addEventListener('click',()=>{if(!confirmReplace())return;operations=preset(b.dataset.pattern,fold);redoStack=[];foldBack();update();persist();toast('花样已铺好，添上属于你的一剪');});});
  fullArt($('#ornament'),6,preset('bloom'),'#b13730');
  $('#help-button').addEventListener('click',()=>$('#help-dialog').showModal());
  $('#language-toggle').addEventListener('click',()=>{toggleLanguage();update();windowPreview.relabel();});
  $('.dialog-close').addEventListener('click',()=>$('#help-dialog').close());$('#help-done').addEventListener('click',()=>$('#help-dialog').close());
  $('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  let savedDraft=null;
  $('#resume-draft').addEventListener('click',()=>{
    if(!savedDraft||!confirmReplace())return;
    fold=savedDraft.fold;color=savedDraft.color;operations=structuredClone(savedDraft.operations);redoStack=[];
    $('#resume-draft').hidden=true;foldBack();toast('已找回上次的剪纸');
  });
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved&&[4,5,6].includes(saved.fold)&&/^#[0-9a-f]{6}$/i.test(saved.color)&&Array.isArray(saved.operations)&&saved.operations.length<500&&saved.operations.every(op=>['cut','draw'].includes(op.type)&&Array.isArray(op.points)&&op.points.length<30000&&op.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<10)))){
      if(saved.operations.length){savedDraft=saved;$('#resume-draft').hidden=false;}
    }
  }catch{persisted=false;}
  update();

  let editor=null;
  if(editLayout)import('./layout-editor.js').then(({openLayoutEditor})=>{if(!signal.aborted)editor=openLayoutEditor(root,{saveEndpoint});}).catch(error=>console.warn('Layout editor unavailable',error));

  return function unmount(){
    lifetime.abort();
    // Leaving the page must not lose the last edit, which is saved after a short delay.
    if(saveTimer){clearTimeout(saveTimer);writeDraft();}
    clearTimeout(toastTimer);clearTimeout(warmTimer);cancelAnimationFrame(animationFrame);
    editor?.close();
    windowPreview.dispose();
    if($('#help-dialog')?.open)$('#help-dialog').close();
    root.innerHTML='';
    root.classList.remove('paper-studio','is-embedded','is-standalone','window-view');
    document.title=previousTitle;
    if(!embedded){document.documentElement.lang=previousLang;if(descriptionMeta)descriptionMeta.content=previousDescription;}
  };
}
