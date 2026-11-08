/**
 * Authored galleon, model units in metres (approximately).
 * Local X is bow, Y is beam, Z is up. The origin is the amidships waterline.
 * All structure is real, opaque geometry. Only group.rotation.z should change
 * with the course; there are no sprites, camera-facing parts or animation.
 */
export function createShipModel(THREE) {
  const group = new THREE.Group();
  group.name = 'three-masted-curved-hull-galleon';
  const buckets = new Map(), textures = [], geometries = [], materials = [];
  let sourceParts = 0, sailCount = 0;
  let seed = 817294;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const V = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function canvasMap(kind) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const c = canvas.getContext('2d');
    if (kind === 'canvas') {
      c.fillStyle = '#e8d5a9'; c.fillRect(0, 0, 512, 512);
      const g = c.createLinearGradient(0, 0, 512, 0);
      g.addColorStop(0, 'rgba(131,101,56,.17)');
      g.addColorStop(.2, 'rgba(255,247,221,.05)');
      g.addColorStop(.72, 'rgba(255,255,237,.18)');
      g.addColorStop(1, 'rgba(137,108,65,.15)');
      c.fillStyle = g; c.fillRect(0, 0, 512, 512);
      // Narrow woven threads and panel seams remain part of the cloth material.
      for (let x = 0; x < 512; x += 3) {
        c.strokeStyle = `rgba(115,94,61,${.025 + random() * .035})`;
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x + .7, 512); c.stroke();
      }
      for (let y = 0; y < 512; y += 3) {
        c.strokeStyle = 'rgba(255,255,238,.065)';
        c.beginPath(); c.moveTo(0, y); c.lineTo(512, y); c.stroke();
      }
      for (let x = 0; x <= 512; x += 64) {
        c.fillStyle = 'rgba(113,86,49,.16)'; c.fillRect(x, 0, 2, 512);
        c.fillStyle = 'rgba(255,246,220,.28)'; c.fillRect(x + 2, 0, 1, 512);
        for (let y = 4; y < 512; y += 10) {
          c.fillStyle = 'rgba(105,79,44,.2)'; c.fillRect(x - 1, y, 4, 1);
        }
      }
      c.strokeStyle = 'rgba(112,82,44,.35)'; c.lineWidth = 6; c.strokeRect(2, 2, 508, 508);
      for (let i = 0; i < 4200; i++) {
        c.fillStyle = random() > .5 ? 'rgba(255,255,231,.07)' : 'rgba(110,82,46,.035)';
        c.fillRect(random() * 512, random() * 512, 1, 1);
      }
    } else {
      const deck = kind === 'deck';
      c.fillStyle = deck ? '#8f623b' : '#633b21'; c.fillRect(0, 0, 512, 512);
      const boards = deck ? 16 : 12, h = 512 / boards;
      for (let p = 0; p < boards; p++) {
        const n = Math.floor(random() * 14 - 7);
        c.fillStyle = deck ? `rgb(${145+n},${99+n},${60+n})` : `rgb(${105+n},${63+n},${35+n})`;
        c.fillRect(0, p * h, 512, h);
        c.fillStyle = 'rgba(20,10,5,.56)'; c.fillRect(0, p * h, 512, 1.5);
        c.fillStyle = 'rgba(225,168,103,.17)'; c.fillRect(0, p * h + 2, 512, 1);
        const joint = (p % 3) * 156 + 30;
        c.fillStyle = 'rgba(27,13,6,.45)'; c.fillRect(joint, p * h, 1.5, h);
        for (let j = 0; j < 40; j++) {
          const y = p * h + 3 + random() * (h - 6), x = random() * 512;
          c.strokeStyle = random() > .45 ? 'rgba(36,17,7,.21)' : 'rgba(219,159,94,.12)';
          c.lineWidth = .4 + random() * .65;
          c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x+28, y-1.8, x+60, y+2, x+95+random()*130, y); c.stroke();
        }
        for (const x of [joint+5, (joint+250)%512]) {
          c.fillStyle = 'rgba(20,13,8,.6)'; c.fillRect(x, p*h+5, 2, 2); c.fillRect(x, (p+1)*h-7, 2, 2);
        }
      }
      for (let i = 0; i < 16; i++) {
        const x=random()*512, y=random()*512;
        c.strokeStyle='rgba(29,13,5,.22)'; c.lineWidth=1;
        c.beginPath(); c.ellipse(x,y,9+random()*8,1.5,0,0,Math.PI*2); c.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    textures.push(texture); return texture;
  }
  const woodMap = canvasMap('wood'), deckMap = canvasMap('deck'), clothMap = canvasMap('canvas');
  function material(name, options) {
    const m = new THREE.MeshStandardMaterial(options); m.name = name;
    materials.push(m); buckets.set(name, {material:m, parts:[]}); return name;
  }
  const wood = material('warm-dark-oak-hull', {color:0xe7d1b4, map:woodMap, roughness:.86, metalness:0});
  const darkWood = material('tarred-walnut-structure', {color:0x332116, map:woodMap, roughness:.87, metalness:0});
  const deck = material('worn-oak-deck', {color:0xdac3a1, map:deckMap, roughness:.95, metalness:0});
  const bronze = material('restrained-aged-bronze', {color:0x9a743b, roughness:.63, metalness:.62});
  const iron = material('blackened-iron', {color:0x202220, roughness:.79, metalness:.48});
  const port = material('recessed-dark-gunports', {color:0x100d09, roughness:1, metalness:0});
  const windows = material('opaque-stern-window-insets', {color:0x202925, roughness:.48, metalness:.1});
  const cloth = material('opaque-cream-woven-canvas', {color:0xfff4d7, map:clothMap, roughness:1, metalness:0, side:THREE.DoubleSide});
  const flag = material('plain-dark-brown-pennants', {color:0x382719, roughness:1, side:THREE.DoubleSide});

  // Convert each part to transformed, non-indexed attributes, then combine each
  // material once. This uses no geometry utility addon or extra dependency.
  function add(key, geo, position, quaternion, scale) {
    if (position || quaternion || scale) {
      const matrix = new THREE.Matrix4().compose(position ? V(position) : new THREE.Vector3(), quaternion || new THREE.Quaternion(), scale ? V(scale) : new THREE.Vector3(1,1,1));
      geo.applyMatrix4(matrix);
    }
    const flat = geo.index ? geo.toNonIndexed() : geo;
    if (flat !== geo) geo.dispose();
    if (!flat.getAttribute('normal')) flat.computeVertexNormals();
    if (!flat.getAttribute('uv')) flat.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(flat.getAttribute('position').count * 2), 2));
    buckets.get(key).parts.push(flat); sourceParts++;
  }
  function box(key, size, center, rotation) {
    const q=rotation ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)) : null;
    add(key,new THREE.BoxGeometry(...size),center,q);
  }
  function rod(key, a, b, r=.02, rEnd=r, segments=8) {
    const av=V(a), bv=V(b), direction=bv.clone().sub(av), length=direction.length();
    if (length<.00001) return;
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    add(key,new THREE.CylinderGeometry(rEnd,r,length,segments,1,false),av.add(bv).multiplyScalar(.5).toArray(),q);
  }
  function ring(key, center, radius, thickness, rotation=[0,0,0]) {
    add(key,new THREE.TorusGeometry(radius,thickness,5,28),center,new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)));
  }
  function ball(key, center, radius) { add(key,new THREE.SphereGeometry(radius,8,6),center); }
  function surface(key, fn, nu, nv, reverse=false, uvScale=[1,1]) {
    const positions=[],uv=[],indices=[];
    for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++) {
      positions.push(...fn(i/nu,j/nv)); uv.push(i/nu*uvScale[0],j/nv*uvScale[1]);
    }
    for(let j=0;j<nv;j++) for(let i=0;i<nu;i++) {
      const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;
      if(reverse) indices.push(a,c,b,b,c,d); else indices.push(a,b,c,b,d,c);
    }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(indices); g.computeVertexNormals(); add(key,g);
  }
  const ropePoints=[];
  function rope(a,b,sag=0,steps=1) {
    let last=a;
    for(let i=1;i<=steps;i++) {
      const t=i/steps, p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)-sag*Math.sin(Math.PI*t)];
      ropePoints.push(...last,...p); last=p;
    }
  }
  function ropePath(fn, steps=20) { let p=fn(0); for(let i=1;i<=steps;i++) {const n=fn(i/steps);rope(p,n);p=n;} }

  const stations=[[-3.03,.59],[-2.85,.81],[-2.45,.95],[-1.8,1.01],[-.7,1.035],[.5,.98],[1.4,.84],[2.12,.56],[2.62,.27],[2.94,.055],[3.04,.002]];
  function beamAt(x) {
    let i=0; while(i<stations.length-2 && x>stations[i+1][0]) i++;
    const a=stations[i],b=stations[i+1],t=clamp((x-a[0])/(b[0]-a[0]),0,1), s=t*t*(3-2*t);
    return lerp(a[1],b[1],s);
  }
  function sheer(x) {return .91+.25*Math.pow(Math.abs(x)/3.04,2)+(x<0?.11*Math.pow(-x/3.04,4):0);}
  function hullPoint(x,t,side) {
    const low=-.56+.20*Math.pow(Math.abs(x)/3.04,3);
    return [x,side*beamAt(x)*(.027+.973*Math.pow(Math.sin(t*Math.PI/2),.64))*(1-.045*t),lerp(low,sheer(x),t)];
  }
  for(const side of [-1,1]) surface(wood,(u,v)=>hullPoint(lerp(-3.03,3.04,u),v,side),100,30,side>0,[2,1]);
  // Solid transom closes the squared stern; the bow closes at the stem.
  surface(wood,(u,v)=>{const p=hullPoint(-3.03,v,1);return[-3.032,lerp(-p[1],p[1],u),p[2]];},14,24,true);
  rod(darkWood,[-2.99,0,-.51],[2.79,0,-.34],.07,.055,10);
  rod(darkWood,[2.78,0,-.32],[3.08,0,1.21],.075,.065,10);
  box(darkWood,[.17,.12,.7],[-3.09,0,-.28]);
  // Broad wales, narrow rubbing strakes, and individual plank seams follow the hull.
  for(const side of [-1,1]) {
    for(const [t,width,key] of [[.42,.026,darkWood],[.66,.032,darkWood],[.86,.032,darkWood],[.985,.019,bronze]]) {
      surface(key,(u,v)=>{const p=hullPoint(lerp(-3.03,3.025,u),t+(v-.5)*width,side);p[1]+=side*.012;return p;},90,1,side>0,[2,1]);
    }
    for(let row=1;row<13;row++) ropePath(t=>{const p=hullPoint(lerp(-2.97,2.99,t),row/13,side);p[1]+=side*.006;return p;},85);
  }
  function deckShape(x0,x1,z,shrink=.95,key=deck) {
    const shape=new THREE.Shape(), n=54;
    for(let i=0;i<=n;i++) {const x=lerp(x0,x1,i/n),y=beamAt(x)*shrink;i===0?shape.moveTo(x,-y):shape.lineTo(x,-y);}
    for(let i=n;i>=0;i--) {const x=lerp(x0,x1,i/n);shape.lineTo(x,beamAt(x)*shrink);} shape.closePath();
    const g=new THREE.ShapeGeometry(shape,4),p=g.getAttribute('position'),uv=g.getAttribute('uv');
    for(let i=0;i<p.count;i++) uv.setXY(i,(p.getX(i)+3.03)/6.07*1.5,(p.getY(i)+1.04)/2.08);
    g.translate(0,0,z);add(key,g);
  }
  deckShape(-3.01,3.015,1.005);
  // Low, solid bulwarks and delicate open railings rather than a gold cage.
  for(const side of [-1,1]) {
    const rail=(u,z)=>{const x=lerp(-2.94,2.85,u);return[x,side*beamAt(x)*.955,z+(sheer(x)-.96)*.6];};
    for(const [z,r,key] of [[1.075,.045,darkWood],[1.29,.022,darkWood],[1.325,.012,bronze]]) {
      let last=rail(0,z);for(let i=1;i<=54;i++){const p=rail(i/54,z);rod(key,last,p,r,r,6);last=p;}
    }
    for(let i=0;i<=31;i++) {
      const u=i/31,a=rail(u,1.075),b=rail(u,1.31);rod(darkWood,a,b,.018,.016,6);
      if(i%4===0) ball(bronze,b,.026);
    }
  }
  // Gunport lids are inset dark rectangles with a small visible black iron bore.
  for(const side of [-1,1]) {
    for(let i=0;i<9;i++) {
      const x=-2.48+i*.565, t=.69, hp=hullPoint(x,t,side), y=hp[1]+side*.024,z=hp[2];
      box(darkWood,[.275,.045,.255],[x,y,z]);
      box(port,[.21,.018,.185],[x,y+side*.029,z+.004]);
      rod(iron,[x,y+side*.028,z-.006],[x,y+side*.168,z-.006],.046,.041,12);
      ring(bronze,[x,y+side*.165,z-.006],.042,.007,[Math.PI/2,0,0]);
      // Hinge, not a bright outline around every port.
      box(iron,[.14,.028,.019],[x,y+side*.043,z+.112]);
    }
    for(let i=0;i<8;i++) {
      const x=-2.3+i*.59,p=hullPoint(x,.36,side);
      box(darkWood,[.11,.035,.11],[x,p[1]+side*.018,p[2]]);
      ball(iron,[x,p[1]+side*.04,p[2]],.025);
    }
  }
  // Raised stern cabin, projecting gallery, opaque panes and restrained frames.
  box(wood,[1.04,1.49,.61],[-2.49,0,1.31]);
  box(darkWood,[1.16,1.66,.075],[-2.49,0,1.64]);
  box(deck,[1.12,1.61,.042],[-2.49,0,1.693]);
  for(const side of [-1,1]) {
    box(darkWood,[1.12,.105,.06],[-2.49,side*.807,1.21]);
    box(bronze,[1.1,.025,.022],[-2.49,side*.864,1.245]);
    for(let i=0;i<4;i++) {
      const x=-2.89+i*.267;
      box(windows,[.205,.024,.24],[x,side*.756,1.43]);
      for(const xx of [x-.112,x+.112]) box(bronze,[.018,.037,.277],[xx,side*.778,1.43]);
      box(bronze,[.22,.037,.018],[x,side*.778,1.565]);
      box(bronze,[.22,.037,.018],[x,side*.778,1.295]);
      box(darkWood,[.205,.035,.015],[x,side*.782,1.42]);
    }
    for(let i=0;i<7;i++) rod(darkWood,[-3+i*.17,side*.8,1.72],[-3+i*.17,side*.8,1.96],.015,.014,6);
    rod(darkWood,[-3.04,side*.8,1.96],[-1.93,side*.8,1.96],.024,.024,8);
    rod(bronze,[-3.04,side*.8,1.982],[-1.93,side*.8,1.982],.009,.009,6);
  }
  box(darkWood,[.08,1.55,.74],[-3.037,0,1.31]);
  for(let row=0;row<2;row++) for(let i=0;i<5;i++) {
    const y=-.59+i*.295,z=1.18+row*.3;
    box(windows,[.012,.229,.236],[-3.084,y,z]);
    for(const yy of [y-.126,y+.126]) box(bronze,[.026,.016,.27],[-3.102,yy,z]);
    for(const zz of [z-.134,z+.134]) box(bronze,[.026,.257,.017],[-3.102,y,zz]);
    box(bronze,[.027,.012,.236],[-3.104,y,z]);
  }
  for(const z of [.99,1.32,1.64,1.76]) rod(bronze,[-3.10,-.79,z],[-3.10,.79,z],.018,.018,8);
  rod(darkWood,[-3.09,-.8,1.95],[-3.09,.8,1.95],.026,.026,8);
  for(let i=0;i<9;i++) rod(darkWood,[-3.09,-.8+i*.2,1.74],[-3.09,-.8+i*.2,1.95],.016,.016,6);
  // Forecastle, stairs, hatch grating, barrels, windlass and the ship's wheel.
  deckShape(1.86,2.81,1.20,.88);
  box(wood,[.08,1.13,.18],[1.88,0,1.11]);
  for(let i=0;i<6;i++) box(deck,[.17,.54,.055],[-1.88+i*.085,-.44,1.64-i*.102]);
  for(const y of [-.74,-.15]) rod(darkWood,[-1.94,y,1.95],[-1.37,y,1.27],.018,.018,8);
  box(darkWood,[.72,.55,.045],[.16,0,1.038]);
  for(let i=0;i<9;i++) box(deck,[.02,.53,.018],[-.17+i*.082,0,1.067]);
  for(let i=0;i<6;i++) box(deck,[.69,.02,.018],[.16,-.25+i*.1,1.067]);
  function barrel(x,y,z,r=.13,h=.31) {
    const profile=[];for(let i=0;i<=8;i++){const t=i/8;profile.push(new THREE.Vector2(r*(.88+.12*Math.sin(Math.PI*t)),h*t));}
    const geo=new THREE.LatheGeometry(profile,14);geo.rotateX(Math.PI/2); // native Y becomes Z
    add(wood,geo,[x,y,z]);
    for(const dz of [.035,h*.5,h-.035]) ring(iron,[x,y,z+dz],r*.99,.012);
    add(deck,new THREE.CylinderGeometry(r*.87,r*.87,.012,14),[x,y,z+h],new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)));
  }
  barrel(-1.42,.56,1.015);barrel(-1.12,.65,1.015,.1,.25);
  rod(darkWood,[2.12,-.36,1.32],[2.12,.36,1.32],.07,.07,12);
  for(const y of [-.35,.35]) box(wood,[.13,.12,.3],[2.12,y,1.18]);
  rod(bronze,[.72,0,1.02],[.72,0,1.29],.09,.075,12);
  rod(darkWood,[.72,-.31,1.25],[.72,.31,1.25],.02,.02,8);
  ring(darkWood,[-2.05,0,1.91],.14,.025,[0,Math.PI/2,0]);
  rod(bronze,[-2.15,0,1.91],[-1.99,0,1.91],.036,.036,10);
  for(let i=0;i<10;i++) {const a=i*Math.PI/5;rod(deck,[-2.05,0,1.91],[-2.05,Math.cos(a)*.18,1.91+Math.sin(a)*.18],.009,.011,6);}
  box(darkWood,[.07,.12,.25],[-2.11,0,1.79]);
  // Stem decoration, real rising bowsprit and its triangular stays.
  rod(darkWood,[2.4,0,1.13],[4.35,0,1.73],.09,.029,12);
  for(let i=0;i<6;i++) {const t=i/6;ring(bronze,[lerp(2.6,4.2,t),0,lerp(1.19,1.69,t)],lerp(.083,.035,t),.008,[0,Math.PI/2-.30,0]);}
  for(const side of [-1,1]) {
    rope([4.32,0,1.72],[2.3,side*.55,.43],.10,14);
    rod(darkWood,[2.64,side*.26,.71],[3.09,side*.17,1.12],.025,.021,8);
    rope([3.8,0,1.56],[2.0,side*.7,1.3],.05,10);
    // A scroll at the cheek of the prow, not a large novelty figurehead.
    ring(bronze,[2.73,side*.292,1.08],.10,.018,[Math.PI/2,0,0]);
    ball(bronze,[2.73,side*.31,1.08],.031);
    const ax=2.15,ay=side*.64;
    rod(iron,[ax,ay,1.05],[ax-.08,ay+side*.15,.52],.026,.026,8);
    rod(iron,[ax-.2,ay,.99],[ax+.19,ay,.99],.018,.018,6);
    rod(iron,[ax-.08,ay+side*.15,.52],[ax-.23,ay+side*.17,.63],.021,.014,6);
    rod(iron,[ax-.08,ay+side*.15,.52],[ax+.10,ay+side*.17,.62],.021,.014,6);
  }

  const yardDirection=[.50,.8660254];
  const masts=[{x:-2.10,top:3.92,platform:2.62,r:.052},{x:-.48,top:5.17,platform:3.12,r:.074},{x:1.13,top:4.76,platform:2.94,r:.063}];
  for(let mi=0;mi<masts.length;mi++) {
    const m=masts[mi],base=mi===0?1.7:1.01;
    rod(wood,[m.x,0,base],[m.x,0,m.top],m.r,m.r*.38,12);
    for(let z=base+.15;z<m.top-.05;z+=.34) ring(darkWood,[m.x,0,z],lerp(m.r,m.r*.38,(z-base)/(m.top-base))+.004,.011);
    // Circular fighting tops and their small open parapets.
    add(darkWood,new THREE.CylinderGeometry(.235,.19,.055,18),[m.x,0,m.platform],new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)));
    ring(bronze,[m.x,0,m.platform+.025],.231,.012);
    ring(darkWood,[m.x,0,m.platform+.16],.22,.016);
    for(let j=0;j<10;j++){const a=j/10*Math.PI*2;rod(darkWood,[m.x+.218*Math.cos(a),.218*Math.sin(a),m.platform],[m.x+.218*Math.cos(a),.218*Math.sin(a),m.platform+.16],.009,.009,5);}
    for(const side of [-1,1]) {
      const z0=mi===0?1.72:1.12, y0=side*(mi===0?.78:.96), z1=m.platform+.13;
      const anchors=[];
      for(let j=0;j<5;j++) {
        const a=[m.x-.46+j*.23,y0,z0],b=[m.x-.045+j*.0225,side*.07,z1]; anchors.push([a,b]);rope(a,b,.015,8);
        ball(darkWood,[a[0],a[1],a[2]+.04],.034);
      }
      for(let r=1;r<18;r++) {
        const t=r/18,a=anchors[0],b=anchors[4];
        rope([lerp(a[0][0],a[1][0],t),lerp(a[0][1],a[1][1],t),lerp(z0,z1,t)],[lerp(b[0][0],b[1][0],t),lerp(b[0][1],b[1][1],t),lerp(z0,z1,t)]);
      }
      rope([m.x,0,m.top-.1],[m.x-.65,y0,z0],.035,10);
    }
    ball(bronze,[m.x,0,m.top+.017],.045);
  }

  function squareSail(mx, top, bottom, topWidth, bottomWidth, fullness) {
    const half=topWidth/2, height=top-bottom;
    const point=(u,v)=>{
      const across=(u*2-1), width=lerp(topWidth,bottomWidth,v)*(.99-.035*Math.sin(Math.PI*v)), y=across*width*.5;
      const belly=fullness*Math.pow(Math.sin(Math.PI*v),.8)*(1-.88*across*across);
      return [mx+yardDirection[0]*y+belly,yardDirection[1]*y-.035*Math.sin(Math.PI*v),top-height*v-.075*(1-across*across)*v];
    };
    surface(cloth,point,28,20);sailCount++;
    const left=[mx-yardDirection[0]*(half+.10),-yardDirection[1]*(half+.10),top+.025];
    const right=[mx+yardDirection[0]*(half+.10),yardDirection[1]*(half+.10),top+.025];
    rod(wood,left,right,.027,.019,10);
    for(const t of [.06,.26,.5,.74,.94]) {
      const p=[lerp(left[0],right[0],t),lerp(left[1],right[1],t),top+.025];
      ball(bronze,p,.025);
    }
    ropePath(t=>point(t,0),28);ropePath(t=>point(t,1),28);
    ropePath(t=>point(0,t),20);ropePath(t=>point(1,t),20);
    // Reef points, clew ropes and braces belong to the same geometry as the rig.
    for(let i=1;i<8;i++) {const p=point(i/8,.20);rope(p,[p[0]+.006,p[1],p[2]-.07]);}
    for(const u of [0,1]) {
      const p=point(u,1);rope(p,[mx-.25,(u?1:-1)*.79,1.22],.045,10);
      rope(u?right:left,[mx-.52,(u?1:-1)*.79,1.26],.035,10);
    }
  }
  // Eight filled square sails; the yard angle is a fixed physical bracing angle.
  squareSail(-.48,3.03,1.42,2.10,1.80,.36);
  squareSail(-.48,4.30,3.17,1.72,1.51,.27);
  squareSail(-.48,4.99,4.38,1.13,.98,.16);
  squareSail(1.13,2.88,1.39,1.90,1.58,.32);
  squareSail(1.13,4.02,3.02,1.49,1.29,.24);
  squareSail(1.13,4.57,4.10,.96,.84,.13);
  squareSail(-2.10,2.86,1.84,1.35,1.18,.24);
  squareSail(-2.10,3.65,2.98,1.07,.90,.17);

  function triangleSail(a,b,c,belly=.12) {
    const n=22,ps=[],uv=[],ix=[];
    // Barycentric grid with a curved, filled membrane; no alpha texture.
    for(let j=0;j<=n;j++) for(let i=0;i<=n;i++) {
      const u=i/n,v=j/n,w=(1-u)*v,aa=(1-u)*(1-v),bb=u;
      ps.push(a[0]*aa+b[0]*bb+c[0]*w,a[1]*aa+b[1]*bb+c[1]*w-belly*27*aa*bb*w,a[2]*aa+b[2]*bb+c[2]*w);
      uv.push(u,v);
    }
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*(n+1)+i;ix.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();add(cloth,g);sailCount++;
    rope(a,b,.008,22);rope(b,c,.008,22);rope(c,a,.008,22);
  }
  triangleSail([1.24,-.015,4.32],[4.13,-.015,1.74],[2.19,-.015,1.66],.17);
  triangleSail([1.23,.12,3.43],[3.47,.12,1.61],[1.74,.12,1.46],.14);
  triangleSail([-2.15,.11,3.44],[-2.98,.11,1.89],[-1.40,.11,1.84],.12);
  // Standing stays are separated from sail edges so the vessel reads at any yaw.
  rope([1.13,0,4.73],[4.35,0,1.75],.035,24);
  rope([-.48,0,5.14],[1.13,0,3.07],.025,18);
  rope([-2.1,0,3.9],[-.48,0,3.1],.025,16);
  rope([-.48,0,5.14],[2.61,0,1.27],.04,24);
  rope([-2.1,0,3.86],[-3.02,0,1.91],.025,16);
  for(const m of masts) for(const y of [-.16,.16]) rope([m.x,y,m.platform+.19],[m.x-.06,y,m.top-.17],0,10);
  // Small plain pennants, with no heraldry or pirate symbols.
  for(const [x,z,len] of [[-.48,5.14,.55],[-2.1,3.9,.35],[1.13,4.73,.40]]) {
    surface(flag,(u,v)=>[x-u*len,.035*Math.sin(u*Math.PI*2),z-.045-v*(.16-.08*u)-.025*Math.sin(u*Math.PI)],16,4);
    rope([x,0,z-.045],[x-len,0,z-.08]);
  }

  let triangleCount=0,vertexCount=0;
  for(const [name,bucket] of buckets) {
    if(!bucket.parts.length) continue;
    const count=bucket.parts.reduce((n,g)=>n+g.getAttribute('position').count,0);
    const position=new Float32Array(count*3),normal=new Float32Array(count*3),uv=new Float32Array(count*2);let offset=0;
    for(const g of bucket.parts) {
      const p=g.getAttribute('position'),n=g.getAttribute('normal'),t=g.getAttribute('uv');
      position.set(p.array,offset*3);normal.set(n.array,offset*3);uv.set(t.array,offset*2);offset+=p.count;g.dispose();
    }
    bucket.parts.length=0;
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(position,3));geo.setAttribute('normal',new THREE.BufferAttribute(normal,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.computeBoundingBox();geo.computeBoundingSphere();
    const mesh=new THREE.Mesh(geo,bucket.material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);geometries.push(geo);
    vertexCount+=count;triangleCount+=count/3;
  }
  const ropeGeometry=new THREE.BufferGeometry();ropeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(ropePoints,3));ropeGeometry.computeBoundingSphere();geometries.push(ropeGeometry);
  const ropeMaterial=new THREE.LineBasicMaterial({color:0x3d2b19,transparent:false,depthWrite:true});ropeMaterial.name='opaque-standing-and-running-rigging';materials.push(ropeMaterial);
  const rigging=new THREE.LineSegments(ropeGeometry,ropeMaterial);rigging.name='shrouds-ratlines-stays-sail-edges-and-plank-seams';group.add(rigging);
  group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(group),size=new THREE.Vector3();bounds.getSize(size);
  const stats={
    origin:'amidships waterline',axes:{bow:'+X',beam:'Y',up:'+Z'},
    size:size.toArray().map(v=>Number(v.toFixed(3))),bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},
    masts:3,sails:sailCount,squareSails:8,meshDrawCalls:group.children.length-1,riggingDrawCalls:1,
    drawCalls:group.children.length,triangles:triangleCount,vertices:vertexCount,ropeSegments:ropePoints.length/6,
    authoredParts:sourceParts,textures:textures.length,opaque:true,viewDependentGeometry:false,
    materials:materials.map(m=>({name:m.name,type:m.type,opacity:m.opacity,transparent:m.transparent,roughness:m.roughness,metalness:m.metalness,side:m.side})),
    limitations:['Stylized authored reconstruction, not an exact photogrammetric copy of the raster reference.','Fine ropes use one-pixel LineSegments and may become subpixel at the 260px projector size.','The sail bracing and billow are fixed; yaw is the only intended animation.','Gunport recesses are dark insets with protruding barrels, not boolean holes through the hull.']
  };
  group.userData.shipModel=stats;
  let disposed=false;
  return {group,stats,dispose(){if(disposed)return;disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();group.clear();}};
}
