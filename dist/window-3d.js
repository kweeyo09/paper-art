import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

// The supplied model and its embedded textures are served from the same origin.
export async function createWindow3D(stage, artwork, onMove) {
  const {scene:model}=await new GLTFLoader().loadAsync(new URL('./models/wooden-window.glb',import.meta.url).href);
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.domElement.className='window-webgl';
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(43,1,.1,90);
  const room=new THREE.Group();scene.add(room);
  let active=false,mode='sunlight',angle=9,raf=0,drag=null,disposed=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let seed=2718;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function texture(kind){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const c=canvas.getContext('2d'),pixels=c.createImageData(512,512);
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const i=(y*512+x)*4;
      if(kind==='wood'){
        const grain=Math.sin(x*.15+Math.sin(y*.012)*2+Math.sin(x*.025)*4)*10+Math.sin(x*.8+y*.003)*3+random()*8;
        pixels.data[i]=101+grain;pixels.data[i+1]=69+grain*.72;pixels.data[i+2]=43+grain*.45;
      }else{const grain=random()*14;pixels.data[i]=209+grain;pixels.data[i+1]=200+grain;pixels.data[i+2]=183+grain;}
      pixels.data[i+3]=255;
    }
    c.putImageData(pixels,0,0);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return tex;
  }
  const woodMap=texture('wood'),plasterMap=texture('plaster');
  const wood=new THREE.MeshStandardMaterial({map:woodMap,bumpMap:woodMap,bumpScale:.018,roughness:.44,color:0xc5a67c});
  const plaster=new THREE.MeshStandardMaterial({map:plasterMap,bumpMap:plasterMap,bumpScale:.018,roughness:.95});
  const floorMaterial=new THREE.MeshStandardMaterial({map:woodMap,color:0xb89872,roughness:.58});
  function box(w,h,d,x,y,z,material=wood,parent=room){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  const bounds=new THREE.Box3().setFromObject(model),dimensions=bounds.getSize(new THREE.Vector3());
  const scale=4.7/dimensions.x;model.scale.setScalar(scale);
  model.position.copy(bounds.getCenter(new THREE.Vector3())).multiplyScalar(-scale);
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    const isGlass=materials.some(m=>m.name==='Glass');
    mesh.castShadow=!isGlass;mesh.receiveShadow=!isGlass;
    for(const material of materials){
      for(const key of ['map','roughnessMap','metalnessMap','normalMap'])if(material[key])material[key].anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      if(isGlass){material.transmission=.65;material.opacity=.22;material.roughness=.12;material.depthWrite=false;material.color.set(0xeaf1ed);}
      else {material.roughness=.82;material.envMapIntensity=.45;}
    }
  });
  room.add(model);
  box(12,20,.55,-8.02,0,-.23,plaster);box(12,20,.55,8.02,0,-.23,plaster);
  box(4.04,12,.55,0,8.04,-.23,plaster);box(4.04,12,.55,0,-8.04,-.23,plaster);
  box(10,.15,10,0,-3.03,2.5,floorMaterial);
  const paperTexture=new THREE.CanvasTexture(artwork);paperTexture.colorSpace=THREE.SRGBColorSpace;paperTexture.anisotropy=8;
  const paperMaterial=new THREE.MeshStandardMaterial({map:paperTexture,alphaTest:.2,side:THREE.DoubleSide,roughness:1,metalness:0,emissive:0xffffff,emissiveMap:paperTexture,emissiveIntensity:.16});
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(1,1),paperMaterial);paper.position.z=.025;paper.castShadow=true;paper.receiveShadow=true;
  paper.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:paperTexture,alphaTest:.2,side:THREE.DoubleSide});scene.add(paper);
  const skyFill=new THREE.HemisphereLight(0xcde8ff,0x716049,2.3);scene.add(skyFill);
  const interiorFill=new THREE.DirectionalLight(0xffecd2,.65);interiorFill.position.set(0,2,6);scene.add(interiorFill);
  const sun=new THREE.DirectionalLight(0xffe7b8,3.7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.camera.near=.1;sun.shadow.camera.far=30;sun.shadow.normalBias=.015;sun.shadow.bias=-.00015;sun.shadow.radius=3;sun.target.position.set(0,-1,2);scene.add(sun,sun.target);
  const garden=new THREE.Group();scene.add(garden);
  const groundMaterial=new THREE.MeshStandardMaterial({color:0x809170,roughness:1});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(70,60),groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.65,-31);ground.receiveShadow=true;garden.add(ground);
  const foliage=new THREE.MeshStandardMaterial({color:0x536b45,roughness:1});
  const trunk=new THREE.MeshStandardMaterial({color:0x685743,roughness:1});
  const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.09,1,7),trunk,34);
  const crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),foliage,102);
  const treeTransform=new THREE.Object3D();
  for(let i=0;i<34;i++){
    const tx=(random()-.5)*36,tz=-7-random()*25,height=2.4+random()*4;
    treeTransform.position.set(tx,-2.6+height/2,tz);treeTransform.scale.set(1,height,1);treeTransform.updateMatrix();stems.setMatrixAt(i,treeTransform.matrix);
    for(let j=0;j<3;j++){const radius=.8+random()*.6;treeTransform.position.set(tx+(random()-.5)*.7,-2.4+height-j*.55,tz);treeTransform.scale.set(radius,radius*(1.1+random()*.4),radius);treeTransform.updateMatrix();crowns.setMatrixAt(i*3+j,treeTransform.matrix);}
  }
  garden.add(stems,crowns);
  const snowPositions=new Float32Array(600*3);
  for(let i=0;i<snowPositions.length;i+=3){snowPositions[i]=(random()-.5)*14;snowPositions[i+1]=random()*10-3;snowPositions[i+2]=-1.5-random()*12;}
  const snowGeometry=new THREE.BufferGeometry();snowGeometry.setAttribute('position',new THREE.BufferAttribute(snowPositions,3));
  const flakeCanvas=document.createElement('canvas');flakeCanvas.width=flakeCanvas.height=32;const fc=flakeCanvas.getContext('2d');const fg=fc.createRadialGradient(16,16,1,16,16,15);fg.addColorStop(0,'#ffffffff');fg.addColorStop(.4,'#ffffffdd');fg.addColorStop(1,'#ffffff00');fc.fillStyle=fg;fc.fillRect(0,0,32,32);
  const flakes=new THREE.Points(snowGeometry,new THREE.PointsMaterial({color:0xffffff,size:.14,map:new THREE.CanvasTexture(flakeCanvas),transparent:true,opacity:1,depthWrite:false,toneMapped:false,fog:false}));scene.add(flakes);
  // A generated sky environment supplies physically based glass/metal reflections.
  const environments=new Map();
  function setLight(value){
    mode=value;const winter=value==='snow',dawn=value==='dawn';
    const sky=winter?0xaebfcc:dawn?0xe7b185:0xc9dce1;
    scene.background=new THREE.Color(sky);scene.fog=new THREE.Fog(sky,8,winter?28:45);
    groundMaterial.color.set(winter?0xe9eef0:dawn?0x827353:0x809170);foliage.color.set(winter?0x899c9c:dawn?0x5e6550:0x536b45);
    sun.color.set(winter?0xe6f0ff:dawn?0xffae60:0xffe1aa);sun.intensity=winter?1.4:dawn?4.4:3.7;
    sun.position.set(dawn?5:-4,dawn?1.8:7,-6);skyFill.color.set(winter?0xd8eaff:dawn?0xe5b5a1:0xcde8ff);skyFill.intensity=winter?2.7:dawn?1.2:2.2;
    interiorFill.intensity=winter?.75:dawn?.5:.65;paperMaterial.emissiveIntensity=dawn?.25:.16;
    renderer.toneMappingExposure=winter?1.25:dawn?1.05:1.15;flakes.visible=winter;
    if(environments.has(value)){scene.environment=environments.get(value).texture;renderer.shadowMap.needsUpdate=true;requestRender();return;}
    const envScene=new THREE.Scene();envScene.background=new THREE.Color(sky);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(20,24,12),new THREE.MeshBasicMaterial({color:sky,side:THREE.BackSide}));envScene.add(dome);
    const lightCard=new THREE.Mesh(new THREE.PlaneGeometry(12,9),new THREE.MeshBasicMaterial({color:dawn?0xffdb9b:0xffffff}));lightCard.position.set(-5,4,9);lightCard.lookAt(0,0,0);envScene.add(lightCard);
    const pmrem=new THREE.PMREMGenerator(renderer);const next=pmrem.fromScene(envScene,.02);scene.environment=next.texture;environments.set(value,next);pmrem.dispose();dome.geometry.dispose();dome.material.dispose();lightCard.geometry.dispose();lightCard.material.dispose();renderer.shadowMap.needsUpdate=true;requestRender();
  }
  function resize(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();setAngle(angle);}
  function setAngle(degrees){angle=degrees;const distance=Math.max(7.1,2.75/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));const rad=THREE.MathUtils.degToRad(angle);camera.position.set(Math.sin(rad)*distance,.18,Math.cos(rad)*distance);camera.lookAt(0,-.13,0);requestRender();}
  function setPlacement(x,y,size){const side=2.1*size/100;paper.scale.set(side,side,1);paper.position.x=THREE.MathUtils.clamp((x/100-.5)*4.3,-1.85+side/2,1.85-side/2);paper.position.y=THREE.MathUtils.clamp((.5-y/100)*3.2,-1.68+side/2,1.68-side/2);renderer.shadowMap.needsUpdate=true;requestRender();}
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),-.025),hit=new THREE.Vector3();
  function locate(e){const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);return ray.ray.intersectPlane(plane,hit);}
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0||!locate(e))return;if(Math.abs(hit.x-paper.position.x)>paper.scale.x/2||Math.abs(hit.y-paper.position.y)>paper.scale.y/2)return;e.preventDefault();drag={id:e.pointerId,dx:paper.position.x-hit.x,dy:paper.position.y-hit.y};renderer.domElement.setPointerCapture(e.pointerId);artwork.focus({preventScroll:true});renderer.domElement.style.cursor='grabbing';});
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||!locate(e))return;onMove(((hit.x+drag.dx)/4.3+.5)*100,(.5-(hit.y+drag.dy)/3.2)*100);});
  function stopDrag(){drag=null;renderer.domElement.style.cursor='grab';}renderer.domElement.addEventListener('pointerup',stopDrag);renderer.domElement.addEventListener('pointercancel',stopDrag);renderer.domElement.addEventListener('lostpointercapture',stopDrag);
  let last=0;
  function frame(now){raf=0;if(!active||disposed||document.hidden)return;const dt=Math.min((now-last)/1000,.05);last=now;
    if(mode==='snow'&&!reduced.matches){for(let i=0;i<snowPositions.length;i+=3){snowPositions[i+1]-=dt*(.35+(i%7)*.07);snowPositions[i]+=Math.sin(now*.0003+i)*dt*.06;if(snowPositions[i+1]<-3)snowPositions[i+1]=6;}snowGeometry.attributes.position.needsUpdate=true;}
    renderer.render(scene,camera);if(mode==='snow'&&!reduced.matches)raf=requestAnimationFrame(frame);
  }
  function requestRender(){if(active&&!raf&&!disposed)raf=requestAnimationFrame(frame);}
  const observer=new ResizeObserver(resize);observer.observe(stage);
  reduced.addEventListener('change',requestRender);
  document.addEventListener('visibilitychange',requestRender);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);raf=0;stage.classList.remove('has-3d');stage.dispatchEvent(new Event('previewfallback'));});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{stage.classList.add('has-3d');active=!document.querySelector('#window-preview').hidden;paperTexture.needsUpdate=true;requestRender();});
  stage.append(renderer.domElement);stage.classList.add('has-3d');
  return {setLight,setPlacement,setAngle,async prepare(){resize();await renderer.compileAsync(scene,camera);},refresh(){paperTexture.needsUpdate=true;renderer.shadowMap.needsUpdate=true;requestRender();},start(){active=true;last=performance.now();resize();requestRender();},stop(){active=false;drag=null;cancelAnimationFrame(raf);raf=0;},dispose(){disposed=true;observer.disconnect();reduced.removeEventListener('change',requestRender);document.removeEventListener('visibilitychange',requestRender);cancelAnimationFrame(raf);scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){for(const mat of Array.isArray(obj.material)?obj.material:[obj.material])mat.dispose();}});woodMap.dispose();plasterMap.dispose();paperTexture.dispose();for(const env of environments.values())env.dispose();renderer.dispose();renderer.domElement.remove();}};
}
