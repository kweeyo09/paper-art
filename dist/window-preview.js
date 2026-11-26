import {t} from './i18n.js';
import {getGardenImages} from './scenery.js';

const palettes = {
  sunlight: {sky:['#b1cbd1','#e6e6d2','#f3dfb4'], sun:'#fff3c7',sunX:.76,sunY:.29,hills:['#a7b5ac','#819b90','#587b6c'],wood:['#72604b','#3e332a','#897058'],glow:'#ffe9aa',caption:'阳光穿过窗，照亮剪纸的每一处细节。'},
  snow: {sky:['#bac8d1','#e1e6e8','#f0f0e9'],sun:'#ffffff',sunX:.34,sunY:.22,hills:['#c0cdd0','#a1b2b8','#788d93'],wood:['#635e58','#343536','#79746b'],glow:'#eaf5ff',caption:'雪落无声，一抹纸色暖了整扇窗。'},
  dawn: {sky:['#b98682','#e9ac83','#f7d494'],sun:'#ffedbc',sunX:.73,sunY:.62,hills:['#b48c83','#896f70','#55565c'],wood:['#83583e','#382e29','#a0774b'],glow:'#ffbc6c',caption:'黎明的暖光，轻轻染上窗与纸。'},
};

/**
 * The "try it on a window" view inside a mounted studio.
 * `signal` removes document-level listeners; `translate` re-applies the current language.
 */
export function createWindowPreview(root, renderArt, {signal, translate}) {
  const $ = selector => root.querySelector(selector);
  const panel=$('#window-preview'),stage=$('#window-scene');
  const glass=$('#window-glass'),art=$('#window-art');
  const landscape=$('#window-landscape'),sizeInput=$('#window-size');
  const status=$('#window-render-status');
  let light='sunlight',x=73,y=58,size=62,drag=null,previousScroll=0,statusKey='';
  let scene3D=null,loading3D=null,gardenImages=null,disposed=false;
  const motionButton=$('#window-motion');
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled=!motionPreference.matches;
  function setStatus(key){statusKey=key;status.textContent=key?t(key):'';}
  function updateMotion(){motionButton.setAttribute('aria-pressed',String(motionEnabled));motionButton.textContent=t(motionEnabled?'暂停微风':'开启微风');stage.dataset.motion=String(motionEnabled);scene3D?.setMotion(motionEnabled);}
  motionButton.addEventListener('click',()=>{motionEnabled=!motionEnabled;updateMotion();});
  motionPreference.addEventListener('change',()=>{motionEnabled=!motionPreference.matches;updateMotion();},{signal});updateMotion();
  // Builds the 3D scene once and resolves to it (or null if WebGL is unavailable). warm() runs this in
  // the background after the unfold, so opening the preview is instant.
  function load3D(){
    if(scene3D)return Promise.resolve(scene3D);
    if(loading3D)return loading3D;
    setStatus('正在准备三维光影…');
    loading3D=import('./window-3d.js').then(async ({createWindow3D})=>{
      const created=await createWindow3D(stage,art,(nextX,nextY)=>{x=nextX;y=nextY;position();});
      if(disposed){created.dispose();return null;}
      scene3D=created;
      scene3D.setLight(light);updateMotion();position();scene3D.refresh();
      await scene3D.prepare();
      setStatus('三维实景 · 拖动画面空白处可转换视角');
      return scene3D;
    }).catch(error=>{
      if(disposed)return null;
      console.warn('3D window unavailable; keeping the 2D preview.',error);
      scene3D?.dispose();scene3D=null;
      setStatus('此设备暂不支持三维，已显示平面预览');
      stage.classList.remove('has-3d');drawLandscape();
      return null;
    }).finally(()=>{loading3D=null;});
    return loading3D;
  }
  function show3D(){load3D().then(scene=>{if(scene&&!panel.hidden){scene.refresh();scene.start();}});}
  function warm(){
    if(disposed||scene3D||loading3D||navigator.connection?.saveData)return;
    const run=()=>{if(!disposed&&!scene3D&&!loading3D)load3D();};
    'requestIdleCallback' in window?requestIdleCallback(run,{timeout:2000}):setTimeout(run,200);
  }
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function position(){
    if(scene3D&&stage.classList.contains('has-3d')){x=clamp(x,0,100);y=clamp(y,0,100);scene3D.setPlacement(x,y,size);return;}
    const rect=glass.getBoundingClientRect();
    // Keep the whole square artwork within the glass, even on narrow screens.
    const side=Math.min(rect.width,rect.height)*size/100;
    const halfX=rect.width?side/rect.width*50:0,halfY=rect.height?side/rect.height*50:0;
    x=clamp(x,halfX+1,99-halfX);y=clamp(y,halfY+1,99-halfY);
    art.style.width=`${side}px`;art.style.left=`${x}%`;art.style.top=`${y}%`;
    scene3D?.setPlacement(x,y,size);
  }
  function drawLandscape(){
    // The 2D landscape sits under the WebGL canvas; skip the costly blurred redraw while 3D covers it.
    if(stage.classList.contains('has-3d'))return;
    const c=landscape.getContext('2d'),w=landscape.width,h=landscape.height,p=palettes[light];
    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h);p.sky.forEach((v,i)=>sky.addColorStop(i/2,v));c.fillStyle=sky;c.fillRect(0,0,w,h);
    const sx=w*p.sunX,sy=h*p.sunY;
    const halo=c.createRadialGradient(sx,sy,12,sx,sy,w*.42);halo.addColorStop(0,p.sun+'d9');halo.addColorStop(.28,p.sun+'66');halo.addColorStop(1,p.sun+'00');c.fillStyle=halo;c.fillRect(0,0,w,h);
    c.fillStyle=p.sun;c.beginPath();c.arc(sx,sy,light==='dawn'?49:31,0,Math.PI*2);c.fill();
    // Soft, layered landscape forms stay deliberately out of focus behind the glass.
    c.save();c.filter='blur(5px)';
    p.hills.forEach((tint,layer)=>{
      c.fillStyle=tint;c.beginPath();c.moveTo(-20,h);
      const base=h*(.66+layer*.12);
      for(let i=0;i<=40;i++){const px=i/40*w;const py=base+Math.sin(i*.22+layer*1.9)*h*.06+Math.sin(i*.57+layer)*h*.025;c.lineTo(px,py);}
      c.lineTo(w+20,h);c.closePath();c.fill();
      if(light==='snow'){c.strokeStyle='#f3f4ed99';c.lineWidth=10;c.stroke();}
    });
    c.restore();
    // Diffused garden shadows suggest nearby branches without competing with the paper.
    c.save();c.filter='blur(8px)';c.strokeStyle=light==='snow'?'#61747d55':'#3d554b66';c.lineCap='round';
    for(let i=0;i<7;i++){const bx=w*(.02+i*.025);c.lineWidth=5-i*.4;c.beginPath();c.moveTo(bx,h);c.bezierCurveTo(bx+25,h*.8,bx-30,h*.6,bx+60,h*(.33+i*.055));c.stroke();for(let j=0;j<4;j++){const yy=h*(.51+j*.09);c.beginPath();c.moveTo(bx+10,yy);c.lineTo(bx+(j%2?65:-45),yy-50);c.stroke();}}
    c.restore();
    const haze=c.createLinearGradient(0,h*.4,0,h);haze.addColorStop(0,p.sky[1]+'00');haze.addColorStop(1,p.sky[1]+'3b');c.fillStyle=haze;c.fillRect(0,0,w,h);
    if(gardenImages){const image=gardenImages[light],scale=Math.max(w/image.width,h/image.height);c.drawImage(image,(w-image.width*scale)/2,(h-image.height*scale)/2,image.width*scale,image.height*scale);}
    stage.style.setProperty('--wood-light',p.wood[0]);stage.style.setProperty('--wood-dark',p.wood[1]);stage.style.setProperty('--wood-edge',p.wood[2]);stage.style.setProperty('--window-glow',p.glow);
  }
  function chooseLight(value){light=value;stage.dataset.light=value;root.querySelectorAll('button[data-light]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.light===light)));$('#window-caption').textContent=t(palettes[value].caption);drawLandscape();scene3D?.setLight(value);}
  root.querySelectorAll('button[data-light]').forEach(b=>b.addEventListener('click',()=>chooseLight(b.dataset.light)));
  const snow=$('#snowfall');
  for(let i=0;i<38;i++){const flake=document.createElement('i');flake.style.cssText=`--x:${(i*37.7)%100}%;--delay:${-(i*1.13)}s;--duration:${8+(i%7)}s;--flake:${2+i%4}px;--drift:${(i%2?1:-1)*(15+i%35)}px`;snow.append(flake);}
  // Bring the studio's top edge into view, below a sticky host-site header if there is one.
  function scrollToStudio(){const header=document.querySelector('header.site-header');const offset=header&&getComputedStyle(header).position!=='static'?header.offsetHeight:0;window.scrollTo({top:Math.max(0,root.getBoundingClientRect().top+window.scrollY-offset),behavior:'instant'});}
  function close(){if(panel.hidden)return;drag=null;scene3D?.stop();panel.hidden=true;root.classList.remove('window-view');window.scrollTo({top:previousScroll,behavior:'instant'});$('#try-window')?.focus({preventScroll:true});}
  $('#window-back').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(!panel.hidden&&!$('#help-dialog').open&&e.key==='Escape'){e.preventDefault();close();}},{signal});
  sizeInput.addEventListener('input',()=>{size=+sizeInput.value;$('#window-size-value').value=`${size}%`;position();});
  $('#window-center').addEventListener('click',()=>{x=73;y=58;position();});
  art.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();art.focus({preventScroll:true});art.setPointerCapture(e.pointerId);drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y};art.classList.add('dragging');});
  art.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const r=glass.getBoundingClientRect();x=drag.x+(e.clientX-drag.startX)/r.width*100;y=drag.y+(e.clientY-drag.startY)/r.height*100;position();});
  function endDrag(){drag=null;art.classList.remove('dragging');}
  art.addEventListener('pointerup',endDrag);art.addEventListener('pointercancel',endDrag);art.addEventListener('lostpointercapture',endDrag);
  art.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?5:1;if(e.key==='ArrowLeft')x-=step;if(e.key==='ArrowRight')x+=step;if(e.key==='ArrowUp')y-=step;if(e.key==='ArrowDown')y+=step;position();});
  const resizeObserver=new ResizeObserver(()=>{if(!panel.hidden)position();});resizeObserver.observe(glass);
  stage.addEventListener('previewfallback',()=>{drawLandscape();setStatus('此设备暂不支持三维，已显示平面预览');position();});
  return {
    warm,
    open(){previousScroll=window.scrollY;renderArt(art);panel.hidden=false;root.classList.add('window-view');chooseLight(light);getGardenImages().then(images=>{gardenImages=images;drawLandscape();}).catch(()=>{});position();translate();scrollToStudio();$('#window-heading').focus({preventScroll:true});show3D();},
    /** Re-applies texts this module sets itself after a language switch. */
    relabel(){updateMotion();setStatus(statusKey);$('#window-caption').textContent=t(palettes[light].caption);},
    dispose(){disposed=true;resizeObserver.disconnect();scene3D?.dispose();scene3D=null;},
  };
}
