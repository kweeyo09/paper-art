import {t, translateDocument} from './i18n.js';
import {getGardenImages} from './scenery.js';

const palettes = {
  sunlight: {sky:['#b1cbd1','#e6e6d2','#f3dfb4'], sun:'#fff3c7',sunX:.76,sunY:.29,hills:['#a7b5ac','#819b90','#587b6c'],wood:['#72604b','#3e332a','#897058'],glow:'#ffe9aa',caption:'阳光穿过窗，照亮剪纸的每一处细节。'},
  snow: {sky:['#bac8d1','#e1e6e8','#f0f0e9'],sun:'#ffffff',sunX:.34,sunY:.22,hills:['#c0cdd0','#a1b2b8','#788d93'],wood:['#635e58','#343536','#79746b'],glow:'#eaf5ff',caption:'雪落无声，一抹纸色暖了整扇窗。'},
  dawn: {sky:['#b98682','#e9ac83','#f7d494'],sun:'#ffedbc',sunX:.73,sunY:.62,hills:['#b48c83','#896f70','#55565c'],wood:['#83583e','#382e29','#a0774b'],glow:'#ffbc6c',caption:'黎明的暖光，轻轻染上窗与纸。'},
};

export function createWindowPreview(renderArt) {
  const panel=document.querySelector('#window-preview'),stage=document.querySelector('#window-scene');
  const glass=document.querySelector('#window-glass'),art=document.querySelector('#window-art');
  const landscape=document.querySelector('#window-landscape'),sizeInput=document.querySelector('#window-size');
  let light='sunlight',x=73,y=58,size=62,drag=null,previousScroll=0;
  let scene3D=null,loading3D=null,gardenImages=null;
  const angleInput=document.querySelector('#window-angle');
  const motionButton=document.querySelector('#window-motion');
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled=!motionPreference.matches;
  function updateMotion(){motionButton.setAttribute('aria-pressed',String(motionEnabled));motionButton.textContent=t(motionEnabled?'暂停微风':'开启微风');stage.dataset.motion=String(motionEnabled);scene3D?.setMotion(motionEnabled);}
  motionButton.addEventListener('click',()=>{motionEnabled=!motionEnabled;updateMotion();});
  motionPreference.addEventListener('change',()=>{motionEnabled=!motionPreference.matches;updateMotion();});updateMotion();
  async function load3D(){
    if(scene3D){scene3D.refresh();scene3D.start();return;}
    if(loading3D)return loading3D;
    document.querySelector('#window-render-status').textContent=t('正在准备三维光影…');
    loading3D=import('./window-3d.js').then(async ({createWindow3D})=>{
      scene3D=await createWindow3D(stage,art,(nextX,nextY)=>{x=nextX;y=nextY;position();});
      scene3D.setLight(light);scene3D.setAngle(+angleInput.value);updateMotion();position();scene3D.refresh();
      await scene3D.prepare();
      if(!panel.hidden)scene3D.start();
      document.querySelector('#window-render-status').textContent=t('三维实景 · 拖动剪纸或调整视角');
      document.querySelector('.window-camera').hidden=false;
    }).catch(error=>{
      console.warn('3D window unavailable; keeping the 2D preview.',error);
      scene3D?.dispose();scene3D=null;
      document.querySelector('#window-render-status').textContent=t('此设备暂不支持三维，已显示平面预览');
      stage.classList.remove('has-3d');
    }).finally(()=>{loading3D=null;});
    return loading3D;
  }
  angleInput.addEventListener('input',()=>{document.querySelector('#window-angle-value').value=`${angleInput.value}°`;scene3D?.setAngle(+angleInput.value);});
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
  function chooseLight(value){light=value;stage.dataset.light=value;document.querySelectorAll('[data-light]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.light===light));});document.querySelector('#window-caption').textContent=t(palettes[value].caption);drawLandscape();scene3D?.setLight(value);}
  document.querySelectorAll('button[data-light]').forEach(b=>b.addEventListener('click',()=>chooseLight(b.dataset.light)));
  const snow=document.querySelector('#snowfall');
  for(let i=0;i<38;i++){const flake=document.createElement('i');flake.style.cssText=`--x:${(i*37.7)%100}%;--delay:${-(i*1.13)}s;--duration:${8+(i%7)}s;--flake:${2+i%4}px;--drift:${(i%2?1:-1)*(15+i%35)}px`;snow.append(flake);}
  function close(){if(panel.hidden)return;drag=null;scene3D?.stop();panel.hidden=true;document.body.classList.remove('window-view');window.scrollTo({top:previousScroll,behavior:'instant'});document.querySelector('#try-window')?.focus({preventScroll:true});}
  document.querySelector('#window-back').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(!panel.hidden&&!document.querySelector('#help-dialog').open&&e.key==='Escape'){e.preventDefault();close();}});
  sizeInput.addEventListener('input',()=>{size=+sizeInput.value;document.querySelector('#window-size-value').value=`${size}%`;position();});
  document.querySelector('#window-center').addEventListener('click',()=>{x=73;y=58;position();});
  art.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();art.focus({preventScroll:true});art.setPointerCapture(e.pointerId);drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y};art.classList.add('dragging');});
  art.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const r=glass.getBoundingClientRect();x=drag.x+(e.clientX-drag.startX)/r.width*100;y=drag.y+(e.clientY-drag.startY)/r.height*100;position();});
  function endDrag(){drag=null;art.classList.remove('dragging');}
  art.addEventListener('pointerup',endDrag);art.addEventListener('pointercancel',endDrag);art.addEventListener('lostpointercapture',endDrag);
  art.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?5:1;if(e.key==='ArrowLeft')x-=step;if(e.key==='ArrowRight')x+=step;if(e.key==='ArrowUp')y-=step;if(e.key==='ArrowDown')y+=step;position();});
  new ResizeObserver(()=>{if(!panel.hidden)position();}).observe(glass);
  stage.addEventListener('previewfallback',()=>{document.querySelector('#window-render-status').textContent=t('此设备暂不支持三维，已显示平面预览');document.querySelector('.window-camera').hidden=true;position();});
  return {open(){previousScroll=window.scrollY;renderArt(art);panel.hidden=false;document.body.classList.add('window-view');chooseLight(light);getGardenImages().then(images=>{gardenImages=images;drawLandscape();}).catch(()=>{});position();translateDocument();window.scrollTo({top:0,behavior:'instant'});document.querySelector('#window-heading').focus({preventScroll:true});load3D();}};
}
