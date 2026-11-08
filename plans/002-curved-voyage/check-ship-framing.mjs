import * as THREE from '../../dist/vendor/three.module.min.js';
import {createShipModel} from '../../dist/ship-model.js';
import {sampleDistance,sampleCamera,TOTAL_DISTANCE} from '../../dist/route.js';
import fs from 'node:fs/promises';
const model=createShipModel(THREE),camera=new THREE.OrthographicCamera(-4.8,4.8,4.8,-4.8,.1,60);
camera.up.set(0,0,1);camera.position.set(0,-12,9);camera.lookAt(0,0,2.2);camera.updateMatrixWorld();
const vertical=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1).y,origin=new THREE.Vector3().project(camera);
const positions=[];model.group.traverse(o=>{if(o.geometry?.attributes.position){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++)positions.push(new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld));}});
// Vertices, not a loose box combining maximum mast height with bow length.
const extrema=[];
for(let q=0;q<160;q++){
 const yaw=-Math.PI/2+q/159*Math.PI;let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 const c=Math.cos(yaw),s=Math.sin(yaw);
 for(const p of positions){const v=new THREE.Vector3(c*p.x-s*p.y,s*p.x+c*p.y,p.z).project(camera);minX=Math.min(minX,(v.x-origin.x)*155);maxX=Math.max(maxX,(v.x-origin.x)*155);minY=Math.min(minY,-(v.y-origin.y)*155);maxY=Math.max(maxY,-(v.y-origin.y)*155);}
 extrema.push({yaw,minX,maxX,minY,maxY});
}
const bounds=[Infinity,Infinity,-Infinity,-Infinity];let worst=null;
for(let i=0;i<=10000;i++){
 const pose=sampleDistance(TOTAL_DISTANCE*i/10000),cam=sampleCamera(pose.distance),anchor=[pose.point[0]-cam[0],pose.point[1]-cam[1]],yaw=Math.atan2(-pose.tangent[1]/vertical,pose.tangent[0]);
 const e=extrema.reduce((a,b)=>Math.abs(a.yaw-yaw)<Math.abs(b.yaw-yaw)?a:b);
 const b=[anchor[0]+e.minX,anchor[1]+e.minY,anchor[0]+e.maxX,anchor[1]+e.maxY];
 bounds[0]=Math.min(bounds[0],b[0]);bounds[1]=Math.min(bounds[1],b[1]);bounds[2]=Math.max(bounds[2],b[2]);if(b[3]>bounds[3]){bounds[3]=b[3];worst={fraction:i/10000,anchor,yaw,bounds:b};}
}
const result={samples:10001,orientationSamples:160,frame:[1920,1080],projectedShipBounds:bounds,worst,inside:bounds[0]>=0&&bounds[1]>=0&&bounds[2]<=1920&&bounds[3]<=1080};
await fs.writeFile(new URL('./ship-framing-check.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);model.dispose();if(!result.inside)process.exitCode=1;
