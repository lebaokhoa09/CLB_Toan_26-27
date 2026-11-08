import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {decodeAtlas} from '../../dist/atlas.js';
import {sampleDistance,samplePose,sampleCamera,START,STOPS,TOTAL_DISTANCE,LEG_DISTANCE,LEG_DURATION} from '../../dist/route.js';
const topology=JSON.parse(await fs.readFile(new URL('../../dist/assets/atlas/countries-50m.json',import.meta.url)));
const {landRings}=decodeAtlas(topology),cell=256,grid=new Map(),segments=[];
const key=(x,y)=>`${x},${y}`;
for(const ring of landRings)for(let i=1;i<ring.length;i++){
 const a=ring[i-1],b=ring[i],id=segments.length;segments.push([a,b]);
 for(let x=Math.floor(Math.min(a[0],b[0])/cell);x<=Math.floor(Math.max(a[0],b[0])/cell);x++)for(let y=Math.floor(Math.min(a[1],b[1])/cell);y<=Math.floor(Math.max(a[1],b[1])/cell);y++){const k=key(x,y);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(id);}
}
const polys=landRings.map(points=>({points,bounds:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]}));
function inside(p,poly){const [x,y]=p,[l,t,r,b]=poly.bounds;if(x<l||x>r||y<t||y>b)return false;let hit=false;for(let i=0,j=poly.points.length-1;i<poly.points.length;j=i++){const a=poly.points[i],b=poly.points[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function shoreDistance(p){let min=Infinity;const cx=Math.floor(p[0]/cell),cy=Math.floor(p[1]/cell),ids=new Set();for(let x=cx-2;x<=cx+2;x++)for(let y=cy-2;y<=cy+2;y++)for(const id of grid.get(key(x,y))||[])ids.add(id);
 for(const id of ids){const [a,b]=segments[id],dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;min=Math.min(min,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy));}return min;}
let minShore=Infinity,closest=null,landHits=0,minX=Infinity,maxX=0,minY=Infinity,maxY=0,maxTurn=0;const failures=[],legShore=Array(10).fill(Infinity);
for(let i=0;i<=10000;i++){
 const pose=sampleDistance(i/10000*TOTAL_DISTANCE),p=pose.point,c=sampleCamera(pose.distance),sd=shoreDistance(p);
 if(sd<minShore){minShore=sd;closest={fraction:i/10000,point:p};}
 legShore[Math.min(9,Math.floor(i/1000))]=Math.min(legShore[Math.min(9,Math.floor(i/1000))],sd);
 if(polys.some(poly=>inside(p,poly))){landHits++;if(failures.length<5)failures.push({fraction:i/10000,point:p});}
 assert(c[0]>=0&&c[0]<=7680&&c[1]>=0&&c[1]<=2120);
 minX=Math.min(minX,p[0]-c[0]);maxX=Math.max(maxX,p[0]-c[0]);minY=Math.min(minY,p[1]-c[1]);maxY=Math.max(maxY,p[1]-c[1]);
 if(i&&i<10000){const a=sampleDistance(pose.distance-.1).tangent,b=sampleDistance(pose.distance+.1).tangent;maxTurn=Math.max(maxTurn,Math.acos(Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1])))/.2*LEG_DISTANCE/LEG_DURATION/.97*180/Math.PI);}
}
for(let i=0;i<9;i++)assert.deepEqual(samplePose(i,1),samplePose(i+1,0));
const result={totalDistance:TOTAL_DISTANCE,legDistance:LEG_DISTANCE,seconds:LEG_DURATION,minimumShoreDistance:minShore,legShore,closest,landHits,failures,screenHullBounds:[[minX,minY],[maxX,maxY]],maximumTurnDegreesPerSecond:maxTurn,stopCount:STOPS.length,START,STOPS};
await fs.writeFile(new URL('./runtime-route-check.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(landHits||minShore<210)process.exitCode=1;
