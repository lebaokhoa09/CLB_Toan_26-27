"""Author a route planning artifact. Does not modify the presentation runtime."""
from pathlib import Path
import base64, json, math
import numpy as np

HERE=Path(__file__).resolve().parent
PROJECT=HERE.parent.parent
WORLD=np.array([9600.,3200.])
NATIVE=np.array([2172.,724.])
# Authored open-ocean corridor, in the existing panorama's native pixels.
# Cubic clamped B-spline control points, not stops to interpolate through.
CONTROL=np.array([
 [430,360],[480,420],[500,550],[580,660],[730,665],
 [780,580],[830,470],[950,470],[1000,610],[1170,650],
 [1260,630],[1360,565],[1460,630],[1510,665],[1670,680],[1840,635]
],dtype=float)
DEGREE=3
n=len(CONTROL)
knots=np.r_[np.zeros(4),np.arange(1,n-3)/(n-3),np.ones(4)]

def evaluate(u):
    if u>=1: return CONTROL[-1].copy()
    k=max(DEGREE,int(np.searchsorted(knots,u,side='right')-1))
    d=[CONTROL[j+k-DEGREE].copy() for j in range(DEGREE+1)]
    for r in range(1,DEGREE+1):
        for j in range(DEGREE,r-1,-1):
            a=(u-knots[j+k-DEGREE])/(knots[j+1+k-r]-knots[j+k-DEGREE])
            d[j]=(1-a)*d[j-1]+a*d[j]
    return d[DEGREE]

parameters=np.linspace(0,1,30001)
points=np.array([evaluate(u) for u in parameters])*WORLD/NATIVE
increments=np.linalg.norm(np.diff(points,axis=0),axis=1)
distance=np.r_[0,np.cumsum(increments)]
total=float(distance[-1])
stop_s=np.linspace(0,total,11)
stops=np.c_[np.interp(stop_s,distance,points[:,0]),np.interp(stop_s,distance,points[:,1])]
assert np.all(np.diff(points[:,0])>0), 'No westward doubling or self intersection allowed'
assert np.all(increments>0), 'No zero derivative or duplicate samples'
assert np.all(points>0) and np.all(points<WORLD), 'Route outside finite atlas'
assert np.min(np.linalg.norm(np.diff(stops,axis=0),axis=1))>500
d1=np.gradient(points,axis=0)
d2=np.gradient(d1,axis=0)
curvature=np.abs(d1[:,0]*d2[:,1]-d1[:,1]*d2[:,0])/np.linalg.norm(d1,axis=1)**3
minimum_radius=float(1/curvature[3:-3].max())
assert minimum_radius>330, 'A turn is too tight for the planned vessel'
heading=np.degrees(np.arctan2(d1[:,1],d1[:,0]))

def soft_clamp(x,upper,margin=180):
    if x<=0:return 0.
    if x>=upper:return float(upper)
    if x<margin:
        t=x/margin
        return margin*(6*t**3-8*t**4+3*t**5)
    if x>upper-margin:return upper-soft_clamp(upper-x,upper,margin)
    return float(x)

# Camera top-left follows a pure position function, not frame-dependent lerp.
# 120 world units of look-ahead; the same state is held behind every question.
ahead=120
q=np.minimum(distance+ahead,total)
look=np.c_[np.interp(q,distance,points[:,0]),np.interp(q,distance,points[:,1])]
raw_camera=look-np.array([800,650])
camera=np.array([[soft_clamp(p[0],7680),soft_clamp(p[1],2120)] for p in raw_camera])
screen=points-camera
assert np.min(camera)>=0 and np.all(camera<=WORLD-[1920,1080])
assert screen[:,0].min()>260 and screen[:,0].max()<1660
assert screen[:,1].min()>260 and screen[:,1].max()<1000

labels=['Xuất phát','Ven phía tây Nam Mỹ','Vòng mũi Horn','Nam Đại Tây Dương',
 'Uốn lên giữa Đại Tây Dương','Vòng tây nam châu Phi','Nam Ấn Độ Dương',
 'Tiếp cận phía tây châu Úc','Vòng phía nam châu Úc','Phía nam New Zealand','Nam Thái Bình Dương']
data={
 'status':'PLANNED — route geometry tested; runtime not changed',
 'sourceCommit':'e16168f','worldSize':WORLD.tolist(),'shipWidth':260,
 'viewport':[1920,1080],'legSeconds':6,'rampSeconds':.18,
 'curve':{'type':'open clamped cubic B-spline','degree':3,'knots':knots.tolist(),
          'controlPointsNative':CONTROL.tolist(),'nativeSize':NATIVE.tolist()},
 'arcLength':round(total,4),'legArcLength':round(total/10,4),
 'averageSpeed':round(total/60,4),'cruiseSpeed':round(total/60/.97,4),
 'stops':[{'index':i,'label':labels[i],'distance':round(float(stop_s[i]),4),
           'point':[round(float(v),4) for v in p]} for i,p in enumerate(stops)],
 'camera':{'anchor':[800,650],'lookAheadDistance':ahead,'softClampMargin':180,
           'bounds':[[0,7680],[0,2120]],'orientationChanges':False},
 'geometryChecks':{'sampleCount':len(points),'strictlyEastward':True,
   'selfIntersections':0,'zeroLengthSamples':0,'cameraAlwaysInsideAtlas':True,
   'shipScreenBounds':[screen.min(axis=0).round(3).tolist(),screen.max(axis=0).round(3).tolist()],
   'minimumStopChord':round(float(np.linalg.norm(np.diff(stops,axis=0),axis=1).min()),3)},
 'unverified':['Exact shoreline clearance: requires full-size visual pass and conservative shore mask.',
 'New high-resolution atlas master quality; current native2172x724 is preview-only at this zoom.',
 'Correct upright ship heading through turns; no whole-card rotation or alpha pose morph permitted.',
 'Continuous renderer FPS and all question boundaries after implementation.']
}
data['geometryChecks'].update({'minimumTurnRadiusEstimate':round(minimum_radius,3),
 'headingDegrees':[round(float(heading.min()),3),round(float(heading.max()),3)],
 'peakTurnRateCruiseDegreesPerSecondEstimate':round(float(np.degrees(curvature.max()*total/60/.97)),3)})
(HERE/'route-spec.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sample_dist=np.linspace(0,total,1001)
samples=np.c_[np.interp(sample_dist,distance,points[:,0]),np.interp(sample_dist,distance,points[:,1])]
(HERE/'arc-samples.json').write_text(json.dumps(samples.round(5).tolist(),separators=(',',':')),encoding='utf-8')

def uri(p,mime): return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
chart=uri(PROJECT/'dist/assets/voyage-panorama/chart.png','image/png')
ship=uri(PROJECT/'dist/assets/voyage-v2/ship-clean.png','image/png')
font=uri(PROJECT/'dist/fonts/be-vietnam-pro-semibold.ttf','font/ttf')
path='M'+' L'.join(','.join(f'{v:.3f}' for v in p) for p in samples[::2])
markers=''.join(f'<g transform="translate({p[0]},{p[1]})"><circle r="50"/><text y="2">{i}</text></g>' for i,p in enumerate(stops))
table=''.join(f'<tr><td>{i:02}</td><td>{labels[i]}</td><td>6 giây</td></tr>' for i in range(1,11))
template='''<!doctype html><html lang="vi"><meta charset="utf-8"><title>Kế hoạch hải trình — 10 chặng</title>
<style>@font-face{font-family:Viet;src:url(FONT)}*{box-sizing:border-box}body{margin:0;background:#080d1c;color:#fff0c8;font-family:Viet,Arial,sans-serif}main{max-width:1920px;margin:auto;padding:38px 48px}h1{font-size:38px;line-height:1.2;margin:0 0 14px}p{font-size:19px;margin:0 0 24px;color:#d3d9e7}.meta{display:flex;gap:42px;font-size:19px;padding:0 0 24px}.overview{display:block;width:100%;height:auto;border:1px solid #7d754f}.route{fill:none;stroke:#f8df8d;stroke-width:13;stroke-linecap:round;stroke-linejoin:round}.route-shadow{fill:none;stroke:#101728;stroke-width:36;stroke-linecap:round;stroke-linejoin:round}.stops circle{fill:#fff0c8;stroke:#080d1c;stroke-width:10}.stops text{fill:#0b1224;font:600 62px Viet,Arial;text-anchor:middle;dominant-baseline:middle}.note{font-size:17px;margin:16px 0 40px;color:#bdc8df}.lower{display:grid;grid-template-columns:1.4fr 1fr;gap:40px}h2{font-size:27px;margin:0 0 18px}.camera{width:100%;display:block;background:#020917;border:1px solid #7d754f}button{font:inherit;padding:12px 20px;margin:16px 10px 12px 0;background:#fff0c8;color:#080d1c;border:0;cursor:pointer}select{font:inherit;background:#fff0c8;color:#080d1c;padding:11px}table{width:100%;border-collapse:collapse;font-size:17px}td{padding:10px;border-bottom:1px solid #29334b}td:first-child{color:#e3c982}#state{display:block;min-height:28px;color:#d3d9e7}</style>
<main><h1>Kế hoạch hải trình · 10 chặng trên một bản đồ</h1>
<p>Đi vòng dưới các lục địa, nối bằng cung lớn. Số và đường sáng chỉ thuộc sơ đồ kế hoạch.</p>
<div class="meta"><span>Tàu: 260 px / khung 1920 px</span><span>Bản đồ hữu hạn: 9600 × 3200</span><span>Mỗi chặng: 6 giây</span></div>
<svg class="overview" viewBox="0 0 9600 3200" role="img" aria-label="Sơ đồ dự kiến gồm mười điểm dừng, vòng dưới Nam Mỹ, châu Phi và châu Úc"><image width="9600" height="3200" href="CHART"/><path class="route-shadow" d="PATH"/><path class="route" d="PATH"/><g class="stops">MARKERS</g></svg>
<p class="note">0 = xuất phát. 1–10 = câu hỏi. Khi trình chiếu thật sẽ ẩn toàn bộ số và đường đi; không có dấu X. Đây là bản tính đường, chưa phải đồ họa mới đã xuất bản.</p>
<div class="lower"><section><h2>Khung máy quay và tỷ lệ tàu dự kiến</h2>
<svg class="camera" viewBox="0 0 1920 1080" role="img" aria-label="Mô phỏng khung máy quay của lộ trình dự kiến"><g id="scene"><image width="9600" height="3200" href="CHART"/><g id="boat"><image x="-130" y="-221" width="260" height="260" href="SHIP"/></g></g></svg>
<button id="play">Chạy thử chặng 1</button><button id="pause">Tạm dừng</button><label>Chặng <select id="leg">OPTIONS</select></label><span id="state"></span>
<p class="note">Bản xem thử chỉ kiểm tra quãng đường, cung cua, tỷ lệ và khung máy. Hình tàu tạm giữ nguyên hướng; hướng nhìn khi vào cua cần được dựng và kiểm tra riêng. Nền này vẫn là ảnh gốc 2172 × 724.</p></section>
<section><h2>Thứ tự các điểm dừng</h2><table>TABLE</table></section></div></main>
<script>const samples=SAMPLES,total=TOTAL,stops=STOPS;let leg=0,progress=0,running=false,start=0,raf=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=document.querySelector('#scene'),boat=document.querySelector('#boat'),state=document.querySelector('#state'),select=document.querySelector('#leg');
function at(s){let v=Math.max(0,Math.min(1000,s/total*1000)),i=Math.min(999,Math.floor(v)),f=v-i;return samples[i].map((x,a)=>x+(samples[i+1][a]-x)*f)}
function clamp(x,m){if(x<=0)return 0;if(x>=m)return m;let a=180;if(x<a){let t=x/a;return a*(6*t**3-8*t**4+3*t**5)}if(x>m-a)return m-clamp(m-x,m);return x}
function travel(p){let r=.03;const I=t=>t*t*t-.5*t*t*t*t;return(p<r?r*I(p/r):p>1-r?1-r-r*I((1-p)/r):p-r/2)/(1-r)}
function draw(){let v=reduced&&progress<1?0:travel(progress),s=(leg+v)*total/10,p=at(s),ahead=at(Math.min(s+120,total)),camera=[clamp(ahead[0]-800,7680),clamp(ahead[1]-650,2120)];scene.setAttribute('transform',`translate(${-camera[0]},${-camera[1]})`);boat.setAttribute('transform',`translate(${p[0]},${p[1]})`);state.textContent=`Chặng ${leg+1}/10 · ${(progress*6).toFixed(1)}/6 giây · ${running?'đang chạy':progress===1?'đến điểm dừng':'tạm dừng'}${reduced?' · chế độ giảm chuyển động':''}`}
function tick(now){if(!running)return;progress=Math.min(1,(now-start)/6000);if(progress===1)running=false;draw();if(running)raf=requestAnimationFrame(tick)}
function pause(){cancelAnimationFrame(raf);running=false;draw()}
document.querySelector('#play').onclick=()=>{if(running)return;cancelAnimationFrame(raf);if(progress===1)progress=0;start=performance.now()-progress*6000;running=true;raf=requestAnimationFrame(tick)};
document.querySelector('#pause').onclick=pause;select.onchange=()=>{pause();leg=+select.value;progress=0;document.querySelector('#play').textContent=`Chạy thử chặng ${leg+1}`;draw()};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});draw();</script></html>'''
replacements={'FONT':font,'CHART':chart,'SHIP':ship,'PATH':path,'MARKERS':markers,'TABLE':table,
 'OPTIONS':''.join(f'<option value="{i}">{i+1}</option>' for i in range(10)),
 'SAMPLES':json.dumps(samples.round(5).tolist(),separators=(',',':')),'TOTAL':str(total),'STOPS':json.dumps(stops.tolist())}
for key,value in replacements.items():template=template.replace(key,value)
(HERE/'preview.html').write_text(template,encoding='utf-8')
print(json.dumps({k:data[k] for k in ['arcLength','legArcLength','averageSpeed','cruiseSpeed','geometryChecks']},ensure_ascii=False,indent=2))
