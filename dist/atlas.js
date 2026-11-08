// A finite chart, drawn from Natural Earth vectors at native pixel resolution.
// Source, license, projection and styling limits: assets/atlas/provenance.json.
export const ATLAS_WIDTH = 9600;
export const ATLAS_HEIGHT = 3200;
export const ATLAS_NATIVE_WIDTH = 6144;
export const ATLAS_NATIVE_HEIGHT = 2048;
export const ATLAS_DATA_URL = new URL('./assets/atlas/countries-50m.json', import.meta.url);

export function projectLonLat(lon, lat, width = ATLAS_WIDTH, height = ATLAS_HEIGHT) {
  return [(.10 + .80 * (lon + 180) / 360) * width, (85 - lat) / 180 * height];
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function hash(x, y, seed = 17) {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function noise(x, y, seed = 17) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed), c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
}
function relief(x, y) {
  return noise(x / 260, y / 190, 23) * .35 + noise(x / 85, y / 69, 51) * .28
    + noise((x + y * .26) / 25, y / 20, 77) * .24 + noise(x / 8, y / 6, 83) * .13;
}

// TopoJSON delta decoding is deliberately local: no runtime CDN or dependency.
export function decodeAtlas(topology, width = ATLAS_WIDTH, height = ATLAS_HEIGHT) {
  const {scale, translate} = topology.transform;
  const arcs = topology.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(delta => { x += delta[0]; y += delta[1]; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
  });
  function ring(indices) {
    const points = [];
    for (const index of indices) {
      const part = index < 0 ? arcs[~index].slice().reverse() : arcs[index];
      if (points.length) points.pop();
      points.push(...part);
    }
    if (points.length && (points[0][0] !== points.at(-1)[0] || points[0][1] !== points.at(-1)[1])) points.push([...points[0]]);
    return points;
  }
  const polygonArcs = geometry => geometry.type === 'Polygon' ? [geometry.arcs] : geometry.type === 'MultiPolygon' ? geometry.arcs : [];
  function clipX(points, edge, keepRight) {
    const output = [];
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[j], b = points[i], aIn = keepRight ? a[0] >= edge : a[0] <= edge, bIn = keepRight ? b[0] >= edge : b[0] <= edge;
      if (aIn !== bIn) output.push([edge, a[1] + (b[1] - a[1]) * (edge - a[0]) / (b[0] - a[0])]);
      if (bIn) output.push(b);
    }
    return output;
  }
  function unwrap(points, near) {
    let previous = points[0][0];
    const result = points.map(([lon, lat]) => {
      while (lon - previous > 180) lon -= 360;
      while (lon - previous < -180) lon += 360;
      previous = lon; return [lon, lat];
    });
    if (near !== undefined) {
      const middle = result.reduce((sum, p) => sum + p[0], 0) / result.length, shift = Math.round((near - middle) / 360) * 360;
      if (shift) for (const p of result) p[0] += shift;
    }
    return result;
  }
  const polygons = [];
  for (const geometry of topology.objects.land.geometries) for (const polygon of polygonArcs(geometry)) {
    const outer = unwrap(ring(polygon[0]));
    // The Antarctic polygon is outside the authored chart's navigable latitude.
    if (Math.max(...outer.map(p => p[1])) < -60) continue;
    const near = outer.reduce((sum, p) => sum + p[0], 0) / outer.length;
    const rings = [outer, ...polygon.slice(1).map(indices => unwrap(ring(indices), near))];
    const minimum = Math.min(...outer.map(p => p[0])), maximum = Math.max(...outer.map(p => p[0]));
    for (let copy = Math.ceil((-180 - maximum) / 360); copy <= Math.floor((180 - minimum) / 360); copy++) {
      const clipped = rings.map(points => clipX(clipX(points.map(([lon, lat]) => [lon + copy * 360, lat]), -180, true), 180, false))
        .map(points => points.map(([lon, lat]) => projectLonLat(lon, lat, width, height)));
      if (clipped[0].length > 3) polygons.push(clipped.filter(points => points.length > 3));
    }
  }
  const counts = new Uint16Array(arcs.length);
  for (const country of topology.objects.countries.geometries) {
    if (country.id === '010') continue;
    for (const polygon of polygonArcs(country)) for (const indices of polygon) for (const index of indices) counts[index < 0 ? ~index : index]++;
  }
  const borders = arcs.filter((_, i) => counts[i] > 1).map(points => points.map(([lon, lat]) => projectLonLat(lon, lat, width, height)));
  return {polygons, landRings: polygons.map(polygon => polygon[0]), borders,
    stats: {sourceArcs: arcs.length, sourcePoints: arcs.reduce((n, points) => n + points.length, 0), coastalPolygons: polygons.length, borderArcs: borders.length}};
}

function tracePolygons(context, polygons) {
  context.beginPath();
  for (const polygon of polygons) for (const ring of polygon) {
    context.moveTo(ring[0][0], ring[0][1]);
    for (let i = 1; i < ring.length; i++) context.lineTo(ring[i][0], ring[i][1]);
    context.closePath();
  }
}
function traceLines(context, lines, maximumJump) {
  context.beginPath();
  for (const points of lines) {
    context.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      if (Math.abs(b[0] - a[0]) > maximumJump) context.moveTo(b[0], b[1]);
      else context.lineTo(b[0], b[1]);
    }
  }
}
function pointInBounds(points, x0, x1, margin) {
  let min = Infinity, max = -Infinity;
  for (const p of points) { min = Math.min(min, p[0]); max = Math.max(max, p[0]); }
  return max >= x0 - margin && min <= x1 + margin;
}

function drawFacets(context, x0, x1, width, height, pitch, land) {
  const scale = width / ATLAS_WIDTH;
  const size = pitch * scale;
  const first = Math.floor(x0 / size) - 2, last = Math.ceil(x1 / size) + 2, rows = Math.ceil(height / size) + 2;
  function vertex(ix, iy) {
    return [(ix + (hash(ix, iy, 109) - .5) * .90) * size, (iy + (hash(ix, iy, 113) - .5) * .85) * size];
  }
  function triangle(a, b, c, ix, iy, side) {
    const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
    const random = hash(ix * 2 + side, iy, land ? 137 : 139), field = noise(cx / (170 * scale), cy / (130 * scale), 127);
    context.beginPath(); context.moveTo(...a); context.lineTo(...b); context.lineTo(...c); context.closePath();
    if (land) {
      const v = Math.round(20 + field * 33 + random * 70);
      const violet = noise(cx / (510 * scale), cy / (390 * scale), 163);
      context.fillStyle = `rgba(${v + Math.round(violet * 30)},${v + 8},${v + 57},${pitch < 25 ? .13 : .70 + random * .22})`;
    } else {
      const v = Math.round(22 + field * 21 + random * 17);
      context.fillStyle = `rgba(${Math.round(v * .44)},${v + 3},${v + 30},${.09 + random * .12})`;
    }
    context.fill();
    // Mineral grain edges use quiet blue highlights, never route-like gold dashes.
    if (random > (land ? .66 : .83)) {
      context.strokeStyle = land ? `rgba(169,174,203,${.045 + random * .035})` : 'rgba(65,100,145,.10)';
      context.lineWidth = .75 * scale; context.stroke();
      context.beginPath(); context.moveTo(a[0] + .7 * scale, a[1] + .8 * scale); context.lineTo(b[0] + .7 * scale, b[1] + .8 * scale);
      context.strokeStyle = land ? 'rgba(6,12,33,.19)' : 'rgba(0,4,14,.14)'; context.lineWidth = 1.1 * scale; context.stroke();
    }
  }
  for (let y = -1; y < rows; y++) for (let x = first; x < last; x++) {
    const a = vertex(x, y), b = vertex(x + 1, y), c = vertex(x, y + 1), d = vertex(x + 1, y + 1);
    if (hash(x, y, 149) > .5) { triangle(a, b, c, x, y, 0); triangle(b, d, c, x, y, 1); }
    else { triangle(a, b, d, x, y, 0); triangle(a, d, c, x, y, 1); }
  }
}

// Exported for reproducible, offline material QA. It renders geography from the
// vectors; it does not load or enlarge the earlier 2172×724 reference raster.
export function renderAtlasPanel({canvas, createCanvas, geometry, width = ATLAS_WIDTH, height = ATLAS_HEIGHT,
  x = 0, panelWidth = width, density = 1}) {
  const pixelWidth = Math.round(panelWidth * density), pixelHeight = Math.round(height * density);
  canvas.width = pixelWidth; canvas.height = pixelHeight;
  const context = canvas.getContext('2d', {alpha: false});
  const image = context.createImageData(pixelWidth, pixelHeight), pixels = image.data;
  const unit = width / ATLAS_WIDTH;
  // Height fields are global (including a one-cell halo), so material joins at
  // panel edges without repeating either coastline or ocean features.
  const step = 3, pixelOriginX = Math.round(x * density), gridOriginX = Math.floor(pixelOriginX / step) - 1;
  const gridWidth = Math.ceil((pixelOriginX + pixelWidth) / step) - gridOriginX + 2, gridHeight = Math.ceil(pixelHeight / step) + 3;
  const heights = new Float32Array(gridWidth * gridHeight);
  for (let gy = 0; gy < gridHeight; gy++) for (let gx = 0; gx < gridWidth; gx++) {
    heights[gy * gridWidth + gx] = relief(((gridOriginX + gx) * step / density) / unit, ((gy - 1) * step / density) / unit);
  }
  for (let py = 0; py < pixelHeight; py++) {
    const gy = Math.floor(py / step) + 1, fy = py % step / step, row = gy * gridWidth;
    const worldY = py / density / unit;
    for (let px = 0; px < pixelWidth; px++) {
      const globalPixelX = pixelOriginX + px;
      const gx = Math.floor(globalPixelX / step) - gridOriginX, fx = globalPixelX % step / step, cell = row + gx;
      const a = heights[cell], b = heights[cell + 1], c = heights[cell + gridWidth], d = heights[cell + gridWidth + 1];
      const value = (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
      const normalAt = i => (heights[i + 1] - heights[i - 1]) * 1.35 - (heights[i + gridWidth] - heights[i - gridWidth]) * 1.7;
      const na = normalAt(cell), nb = normalAt(cell + 1), nc = normalAt(cell + gridWidth), nd = normalAt(cell + gridWidth + 1);
      const normal = (na + (nb - na) * fx) * (1 - fy) + (nc + (nd - nc) * fx) * fy;
      const worldX = (x + px / density) / unit, fine = hash(Math.floor(worldX), Math.floor(worldY), 197) - .5;
      const light = clamp(.41 + (value - .49) * 1.02 + normal * 2.1 + fine * .13, .05, .96);
      const p = (py * pixelWidth + px) * 4;
      pixels[p] = Math.round(3 + light * 14); pixels[p + 1] = Math.round(12 + light * 34); pixels[p + 2] = Math.round(27 + light * 56); pixels[p + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  context.save(); context.scale(density, density); context.translate(-x, 0);
  drawFacets(context, x, x + panelWidth, width, height, 27, false);
  const relevant = geometry.polygons.filter(polygon => pointInBounds(polygon[0], x, x + panelWidth, 24 * unit));
  tracePolygons(context, relevant);
  context.shadowColor = 'rgba(0,2,10,.84)'; context.shadowBlur = 13 * unit * density; context.shadowOffsetY = 5 * unit * density;
  context.fillStyle = '#182a4b'; context.fill('evenodd');
  context.shadowColor = 'transparent'; context.shadowBlur = 0; context.shadowOffsetY = 0;
  context.save(); tracePolygons(context, relevant); context.clip('evenodd');
  const land = context.createLinearGradient(width * .05, height * .30, width * .88, height * .48);
  land.addColorStop(0, '#302c57'); land.addColorStop(.30, '#39335f'); land.addColorStop(.54, '#293f66'); land.addColorStop(.79, '#38395f'); land.addColorStop(1, '#302d57');
  context.fillStyle = land; context.fillRect(x, 0, panelWidth, height);
  drawFacets(context, x, x + panelWidth, width, height, 54, true);
  drawFacets(context, x, x + panelWidth, width, height, 16, true);
  // Reuse the physical relief as monochrome fine land weathering. This native
  // grain is generated per pixel; it is not a tiled or enlarged raster.
  for (let p = 0; p < pixels.length; p += 4) {
    const v = clamp((pixels[p + 1] - 12) / 34, 0, 1);
    pixels[p] = pixels[p + 1] = pixels[p + 2] = Math.round(v * 255); pixels[p + 3] = 92;
  }
  const grain = createCanvas(pixelWidth, pixelHeight), grainContext = grain.getContext('2d');
  grainContext.putImageData(image, 0, 0);
  context.globalCompositeOperation = 'soft-light'; context.drawImage(grain, x, 0, panelWidth, height);
  context.globalCompositeOperation = 'source-over';
  const light = context.createRadialGradient(width * .88, height * -.07, 0, width * .88, height * -.07, width * .44);
  light.addColorStop(0, 'rgba(246,204,136,.25)'); light.addColorStop(.5, 'rgba(198,159,126,.05)'); light.addColorStop(1, 'rgba(198,159,126,0)');
  context.fillStyle = light; context.fillRect(x, 0, panelWidth, height);
  context.restore();
  // The source's shared arcs form true country borders. These are finer and
  // quieter than the coast, preserving the reference's engraved hierarchy.
  const borders = geometry.borders.filter(points => pointInBounds(points, x, x + panelWidth, 2 * unit));
  traceLines(context, borders, width * .4);
  context.strokeStyle = 'rgba(213,174,99,.53)'; context.lineWidth = 1.0 * unit; context.lineJoin = 'round'; context.stroke();
  tracePolygons(context, relevant);
  context.strokeStyle = 'rgba(15,16,28,.80)'; context.lineWidth = 9 * unit; context.lineJoin = 'round'; context.stroke();
  context.strokeStyle = '#ad8d52'; context.lineWidth = 4.7 * unit; context.stroke();
  context.strokeStyle = 'rgba(246,217,143,.84)'; context.lineWidth = 1.5 * unit; context.stroke();
  // Warm directional bloom belongs to the chart material, not a giant gold
  // route or an identifying label. It is subtle outside the northeast corner.
  const glow = context.createRadialGradient(width * .89, -height * .09, 0, width * .89, -height * .09, width * .31);
  glow.addColorStop(0, 'rgba(245,199,128,.16)'); glow.addColorStop(.35, 'rgba(223,178,125,.05)'); glow.addColorStop(1, 'rgba(223,178,125,0)');
  context.fillStyle = glow; context.fillRect(x, 0, panelWidth, height);
  context.restore();
  grain.width = grain.height = 1;
  return canvas;
}

export async function createAtlas(THREE, {width = ATLAS_WIDTH, height = ATLAS_HEIGHT} = {}) {
  const loader = new THREE.TextureLoader(), count = 3;
  const [topology, textures] = await Promise.all([
    fetch(ATLAS_DATA_URL).then(response => {
      if (!response.ok) throw new Error(`Atlas geometry could not load (${response.status}).`);
      return response.json();
    }),
    Promise.all(Array.from({length: count}, (_, i) => loader.loadAsync(new URL(`./assets/atlas/native-panel-${i + 1}.webp`, import.meta.url).href)))
  ]);
  const geometry = decodeAtlas(topology, width, height);
  const object = new THREE.Group(); object.name = 'finite-vector-engraved-atlas';
  const materials = [], meshes = [], panelWidth = width / count;
  // Separate square textures avoid dependence on 9600px-wide WebGL support.
  // All three panels contain different parts of one world, without wrapping.
  // Panels are baked from renderAtlasPanel by the offline QA helper. Loading
  // these local native renders keeps procedural generation out of startup.
  for (let index = 0; index < count; index++) {
    const texture = textures[index];
    texture.name = `native-vector-atlas-panel-${index + 1}`; texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter;
    const material = new THREE.MeshBasicMaterial({map: texture, depthTest: false, depthWrite: false, toneMapped: false});
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(panelWidth, height), material);
    mesh.position.set(index * panelWidth + panelWidth / 2 - 960, 540 - height / 2, 0);
    mesh.name = `finite-chart-panel-${index + 1}`; mesh.renderOrder = 0; object.add(mesh);
    materials.push(material); meshes.push(mesh);
  }
  let disposed = false;
  return {object, landRings: geometry.landRings, landPolygons: geometry.polygons,
    getInfo: () => ({type: 'native-vector-procedural-atlas', logicalSize: [width, height], nativeSize: [ATLAS_NATIVE_WIDTH, ATLAS_NATIVE_HEIGHT],
      nativePanels: textures.map(texture => [texture.image.width, texture.image.height]), atlasDrawCalls: count, repeat: false, labels: false, markers: false, route: false,
      data: 'Natural Earth 4.1.0 / world-atlas 2.0.2 countries-50m', resolution: '1:50m generalized vectors; native6144x2048 vector render; 0.64 pixels per logical unit',
      style: 'illustrative navy mineral grain, violet facets, gold coasts and borders', referenceRasterUsed: false, bakedFromVectors: true, ...geometry.stats}),
    dispose() { if (disposed) return; disposed = true; for (const mesh of meshes) { mesh.geometry.dispose(); object.remove(mesh); }
      for (const material of materials) material.dispose(); for (const texture of textures) { texture.dispose(); if (texture.image?.close) texture.image.close(); } }
  };
}
