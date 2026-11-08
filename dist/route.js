// One finite, C2-continuous course. Equal arc-length stops share the same
// endpoint, tangent and camera state through every question/return.
export const ATLAS_SIZE=[9600,3200];
export const LEG_DURATION=5;
export const RAMP_SECONDS=.18;
export const SHIP_WIDTH=260;
// Refined against actual vector coasts, rather than the AI planning image.
export const CONTROL_POINTS=[
 [400,500],[470,560],[620,650],[750,710],[900,710],
 [1020,680],[1100,540],[1210,540],[1300,670],[1400,680],
 [1500,640],[1600,590],[1690,650],[1770,700],[1870,700],[1960,635]
].map(([x,y])=>[x*9600/2172,y*3200/724]);
const degree=3,n=CONTROL_POINTS.length;
const knots=[0,0,0,0,...Array.from({length:n-4},(_,i)=>(i+1)/(n-3)),1,1,1,1];
function spline(u,controls=CONTROL_POINTS,p=degree,knot=knots){
 if(u>=1)return [...controls.at(-1)];
 let k=p;while(k<controls.length-1&&u>=knot[k+1])k++;
 const d=Array.from({length:p+1},(_,j)=>[...controls[j+k-p]]);
 for(let r=1;r<=p;r++)for(let j=p;j>=r;j--){const a=(u-knot[j+k-p])/(knot[j+1+k-r]-knot[j+k-p]);d[j][0]=(1-a)*d[j-1][0]+a*d[j][0];d[j][1]=(1-a)*d[j-1][1]+a*d[j][1];}
 return d[p];
}
const derivativePoints=CONTROL_POINTS.slice(0,-1).map((v,i)=>v.map((x,a)=>3*(CONTROL_POINTS[i+1][a]-x)/(knots[i+4]-knots[i+1])));
const count=30000,arc=new Float64Array(count+1);let previous=spline(0);
for(let i=1;i<=count;i++){const p=spline(i/count);arc[i]=arc[i-1]+Math.hypot(p[0]-previous[0],p[1]-previous[1]);previous=p;}
export const TOTAL_DISTANCE=arc[count];
export const LEG_DISTANCE=TOTAL_DISTANCE/10;
export function sampleDistance(distance){
 const s=Math.max(0,Math.min(TOTAL_DISTANCE,distance));let lo=0,hi=count;
 while(lo+1<hi){const m=(lo+hi)>>>1;if(arc[m]<s)lo=m;else hi=m;}
 const u=s===TOTAL_DISTANCE?1:(lo+(s-arc[lo])/(arc[hi]-arc[lo]))/count;
 const point=spline(u),d=spline(u,derivativePoints,2,knots.slice(1,-1)),length=Math.hypot(...d);
 return {point,tangent:[d[0]/length,d[1]/length],distance:s,u};
}
export function travelProgress(progress){
 const p=Math.max(0,Math.min(1,progress)),r=RAMP_SECONDS/LEG_DURATION,integral=t=>t*t*t-.5*t*t*t*t;
 return (p<r?r*integral(p/r):p>1-r?1-r-r*integral((1-p)/r):p-r/2)/(1-r);
}
export function samplePose(index,progress){return sampleDistance((Math.max(0,Math.min(9,index))+travelProgress(progress))*LEG_DISTANCE);}
export function sampleLeg(index,progress){return samplePose(index,progress).point;}
export const START=sampleDistance(0).point;
const names=['Ven phía tây Nam Mỹ','Vòng mũi Horn','Nam Đại Tây Dương','Giữa Đại Tây Dương','Tây nam châu Phi','Nam Ấn Độ Dương','Tây châu Úc','Nam châu Úc','Nam New Zealand','Chân trời tri thức'];
export const STOPS=Array.from({length:10},(_,i)=>({name:names[i],coord:sampleDistance((i+1)*LEG_DISTANCE).point}));
export function softClamp(x,upper,margin=180){
 if(x<=0)return 0;if(x>=upper)return upper;
 if(x<margin){const t=x/margin;return margin*(6*t**3-8*t**4+3*t**5);}
 if(x>upper-margin)return upper-softClamp(upper-x,upper,margin);return x;
}
export function sampleCamera(distance){const [x,y]=sampleDistance(Math.min(TOTAL_DISTANCE,distance+120)).point;return [softClamp(x-800,7680),softClamp(y-650,2120)];}
