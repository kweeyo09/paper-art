import {t, toggleLanguage, translateDocument} from './i18n.js';
import {createWindowPreview} from './window-preview.js';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const canvas = $('#paper-canvas');
const ctx = canvas.getContext('2d');
const names = {4:'四',5:'五',6:'六'};
const STORAGE_KEY = 'yizhi-shenghua-v1';
let fold = 6, color = '#b92e2a', tool = 'cut', operations = [], redoStack = [];
let revealed = false, active = null, polygon = [], animationFrame = 0, animating = false;
let revealProgress = 0, toastTimer, saveTimer, moved = false, downPoint = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const makeCanvas = (size) => {const c=document.createElement('canvas');c.width=c.height=size;return c;};
const sector = makeCanvas(1024);
const windowPreview = createWindowPreview(target => fullArt(target,fold,operations,color));
let persisted = true;

function toast(message) { const el=$('#toast');el.textContent=t(message);el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000); }
function persist() { clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({fold,color,operations}));persisted=true;$('#resume-draft').hidden=true;$('#save-status').textContent=t('已自动保存 · 仅此浏览器');}catch{if(persisted)toast('浏览器暂时无法保存，请展开后下载作品');persisted=false;$('#save-status').textContent=t('暂未保存，请下载作品');}},250); }
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
function alphaTotal(img){const data=img.getContext('2d').getImageData(0,0,img.width,img.height).data;let total=0;for(let i=3;i<data.length;i+=4)total+=data[i];return total;}
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
  if(revealed||animating||e.button!==0||active)return;e.preventDefault();canvas.focus();canvas.setPointerCapture(e.pointerId);downPoint=pointFromEvent(e);moved=false;active={type:tool,points:[downPoint],pointerId:e.pointerId};draw();
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
  translateDocument();
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
  if(e.key==='Escape'){polygon=[];active=null;draw();}
  if(e.key==='Enter'&&document.activeElement===canvas&&polygon.length>=3){e.preventDefault();const points=polygon;polygon=[];commit({type:'cut',points});draw();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
});
const normalBottom=$('.work-bottom').innerHTML;
function unfold(){
  if(animating)return;polygon=[];active=null;revealed=true;animating=true;$('.work-area').classList.add('revealed');
  $('.work-bottom').innerHTML='<p>方寸红纸，展开便是满眼风华。</p><div class="reveal-actions"><button id="fold-back" class="secondary-button"><svg><use href="#i-open"/></svg>收起继续剪</button><button id="download" class="primary-button"><svg><use href="#i-download"/></svg>保存我的剪纸</button></div><button id="try-window" class="window-preview-button"><svg><use href="#i-window"/></svg><span>贴上窗，看看光影</span><svg><use href="#i-arrow"/></svg></button>';
  $('#try-window').addEventListener('click',()=>windowPreview.open());
  $('#fold-back').addEventListener('click',foldBack);$('#download').addEventListener('click',download);
  update();const start=performance.now(),duration=reducedMotion.matches?0:1100;
  const tick=time=>{const t=duration?Math.min((time-start)/duration,1):1;revealProgress=1-Math.pow(1-t,4);draw();if(t<1)animationFrame=requestAnimationFrame(tick);else{animating=false;update();if($('#window-preview').hidden)$('#fold-back').focus({preventScroll:true});}};
  animationFrame=requestAnimationFrame(tick);
}
function foldBack(){cancelAnimationFrame(animationFrame);animating=false;revealed=false;revealProgress=0;active=null;polygon=[];$('.work-area').classList.remove('revealed');$('.work-bottom').innerHTML=normalBottom;$('#reveal').addEventListener('click',unfold);update();}
$('#reveal').addEventListener('click',unfold);
function download(){const out=makeCanvas(2400);fullArt(out,fold,operations,color);out.toBlob(blob=>{if(!blob){toast('图片生成失败，请重试');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=t(`一纸生花-${names[fold]}折剪纸.png`,`Paper-in-Bloom-${fold}-fold.png`);a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);toast('剪纸已保存为透明背景图片');},'image/png');}
function ellipse(cx,cy,rx,ry,angle=0,count=38){return Array.from({length:count},(_,i)=>{const t=i/count*2*Math.PI,x=Math.cos(t)*rx,y=Math.sin(t)*ry;return[cx+x*Math.cos(angle)-y*Math.sin(angle),cy+x*Math.sin(angle)+y*Math.cos(angle)];});}
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
$('#language-toggle').addEventListener('click',()=>{toggleLanguage();update();});
$('.dialog-close').addEventListener('click',()=>$('#help-dialog').close());$('#help-done').addEventListener('click',()=>$('#help-dialog').close());
$('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
let savedDraft=null;
$('#resume-draft').addEventListener('click',()=>{
  if(!savedDraft||!confirmReplace())return;
  fold=savedDraft.fold;color=savedDraft.color;operations=structuredClone(savedDraft.operations);redoStack=[];
  $('#resume-draft').hidden=true;$('#save-status').textContent=t('已找回上次的剪纸');foldBack();
});
try{
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
  if(saved&&[4,5,6].includes(saved.fold)&&/^#[0-9a-f]{6}$/i.test(saved.color)&&Array.isArray(saved.operations)&&saved.operations.length<500&&saved.operations.every(op=>['cut','draw'].includes(op.type)&&Array.isArray(op.points)&&op.points.length<30000&&op.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<10)))){
    if(saved.operations.length){savedDraft=saved;$('#resume-draft').hidden=false;$('#save-status').textContent='从一张完整的纸开始';}
  }
}catch{persisted=false;$('#save-status').textContent='暂未保存，请下载作品';}
update();
