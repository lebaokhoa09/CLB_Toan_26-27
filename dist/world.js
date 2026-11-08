import * as THREE from 'three';
import {samplePose,sampleCamera,LEG_DISTANCE,LEG_DURATION,TOTAL_DISTANCE,SHIP_WIDTH} from './route.js';
import {createAtlas} from './atlas.js';
import {createShipModel} from './ship-model.js';

export async function createWorld(canvas,{reduced=false,onError=()=>{}}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.info.autoReset=false;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-960,960,540,-540,.1,100);camera.position.z=10;
 const atlas=await createAtlas(THREE);scene.add(atlas.object);
 atlas.object.traverse(o=>{if(o.material?.map){o.material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());renderer.initTexture(o.material.map);}});
 // Real opaque geometry changes yaw; the display card never tilts or warps.
 const model=createShipModel(THREE),shipScene=new THREE.Scene();shipScene.add(model.group);
 const shipCamera=new THREE.OrthographicCamera(-4.8,4.8,4.8,-4.8,.1,60);shipCamera.up.set(0,0,1);shipCamera.position.set(0,-12,9);shipCamera.lookAt(0,0,2.2);shipCamera.updateMatrixWorld();
 const verticalProjection=new THREE.Vector3().setFromMatrixColumn(shipCamera.matrixWorld,1).y;
 shipScene.add(new THREE.HemisphereLight(0xffefd6,0x26364c,1.1));
 const key=new THREE.DirectionalLight(0xffe0ac,2.7);key.position.set(4,-6,9);shipScene.add(key);
 const fill=new THREE.DirectionalLight(0xc4d9ff,.75);fill.position.set(-5,3,5);shipScene.add(fill);
 const target=new THREE.WebGLRenderTarget(768,768,{samples:4,depthBuffer:true,stencilBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});target.texture.colorSpace=THREE.LinearSRGBColorSpace;
 const cardSize=310,geometry=new THREE.PlaneGeometry(cardSize,cardSize),waterline=new THREE.Vector3(0,0,0).project(shipCamera);
 geometry.translate(0,-waterline.y*cardSize/2,0);
 const ship=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:target.texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));ship.renderOrder=2;scene.add(ship);
 // A physical contact shadow, never a glass or reflection effect on the hull.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=64;
 const ctx=shadowCanvas.getContext('2d');ctx.scale(1,.25);const g=ctx.createRadialGradient(128,128,0,128,128,128);
 g.addColorStop(0,'rgba(0,0,0,.52)');g.addColorStop(.55,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
 const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadow=new THREE.Mesh(new THREE.PlaneGeometry(188,44),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));shadow.renderOrder=1;scene.add(shadow);
 let index=0,progress=0,pose=samplePose(0,0),cameraXY=sampleCamera(0),active=false,paused=false,disposed=false,quality='auto',previous=0,frames=0,frameMs=0,renderCpuMs=0,frameCount=0,pixelRatio=1,w=0,h=0,shipDirty=true,lastYaw=NaN;
 const intervals=new Float32Array(720);
 function render(){
  if(disposed)return;const now=performance.now();if(active&&!paused&&previous){const dt=now-previous;frameMs=frameMs*.9+dt*.1;intervals[frameCount++%720]=dt;}previous=active&&!paused?now:0;
  renderer.info.reset();
  // setRenderTarget applies its physical-pixel viewport. setViewport would
  // multiply it by the display DPR again and clip the vessel on HiDPI screens.
  if(shipDirty){renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(shipScene,shipCamera);shipDirty=false;}
  renderer.setRenderTarget(null);renderer.setClearColor(0x030a18,1);renderer.setScissorTest(false);renderer.setViewport(0,0,w||1,h||1);renderer.clear();
  if(w>1&&h>1){const scale=Math.min(w/1920,h/1080),fw=1920*scale,fh=1080*scale;renderer.setViewport((w-fw)/2,(h-fh)/2,fw,fh);renderer.setScissor((w-fw)/2,(h-fh)/2,fw,fh);renderer.setScissorTest(true);}
  renderer.render(scene,camera);frames++;renderCpuMs=renderCpuMs*.9+(performance.now()-now)*.1;
 }
 function update(){
  if(disposed)return;pose=samplePose(index,progress);cameraXY=sampleCamera(pose.distance);camera.position.set(cameraXY[0],-cameraXY[1],10);
  ship.position.set(pose.point[0]-960,540-pose.point[1],0);shadow.position.set(ship.position.x+8,ship.position.y-4,0);
  const yaw=Math.atan2(-pose.tangent[1]/verticalProjection,pose.tangent[0]);
  if(!Number.isFinite(lastYaw)||Math.abs(yaw-lastYaw)>1e-7){model.group.rotation.z=yaw;lastYaw=yaw;shipDirty=true;}
  render();
 }
 function resize(){
  if(disposed)return;const bounds=canvas.getBoundingClientRect();if(bounds.width<2||bounds.height<2)return;
  w=bounds.width;h=bounds.height;pixelRatio=Math.min(window.devicePixelRatio||1,quality==='low'?1:2);renderer.setPixelRatio(pixelRatio);renderer.setSize(w,h,false);
  const targetSize=quality==='low'?512:768;if(target.width!==targetSize){target.setSize(targetSize,targetSize);shipDirty=true;}render();
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('resize',resize);
 const lost=event=>{event.preventDefault();if(!disposed)onError();};canvas.addEventListener('webglcontextlost',lost);update();resize();
 return {cameraAuthored:true,
  setLeg(i,p){index=Math.max(0,Math.min(9,i));progress=Math.max(0,Math.min(1,p));update();},
  setActive(v){active=v;previous=0;},setPaused(v){paused=v;previous=0;},setQuality(v){quality=v;resize();},setReduced(v){reduced=v;update();},
  getState:()=>({renderer:'finite-curved-voyage-3d',index,progress,hullAnchor:[...pose.point],travelDistance:pose.distance,legDistance:LEG_DISTANCE,totalDistance:TOTAL_DISTANCE,seconds:LEG_DURATION,averageSpeed:LEG_DISTANCE/LEG_DURATION,tangent:[...pose.tangent],headingDegrees:Math.atan2(pose.tangent[1],pose.tangent[0])*180/Math.PI,shipYaw:model.group.rotation.z,camera:[...cameraXY],shipScreenAnchor:[pose.point[0]-cameraXY[0],pose.point[1]-cameraXY[1]],cameraTracking:true,finiteAtlas:true,atlas:atlas.getInfo(),ship:{type:'opaque-three-masted-3d-model',targetWidth:SHIP_WIDTH,renderTarget:[target.width,target.height],...model.stats},reduced,morphing:false,roll:0,heave:0,markers:0,route:false,label:false,pixelRatio}),
  getMetrics(){const samples=Array.from(intervals.subarray(0,Math.min(frameCount,720))).sort((a,b)=>a-b);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,frames,frameMedianMs:samples.length?samples[Math.floor(samples.length*.5)]:null,frameP95Ms:samples.length?samples[Math.floor(samples.length*.95)]:null,frameIntervalMs:Math.round(frameMs*10)/10,renderCpuMs:Math.round(renderCpuMs*100)/100,drawingBuffer:[canvas.width,canvas.height]};},
  dispose(){if(disposed)return;disposed=true;observer.disconnect();window.removeEventListener('resize',resize);canvas.removeEventListener('webglcontextlost',lost);atlas.dispose();model.dispose();target.dispose();for(const mesh of[ship,shadow]){mesh.geometry.dispose();mesh.material.dispose();}shadowTexture.dispose();renderer.dispose();}
 };
}
