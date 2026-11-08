// Reproducible local QA; no server, browser, remote requests or dependency install.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
const require = createRequire(import.meta.url);
const runtimeModules = 'C:/Users/Le Bao Khoa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {createCanvas} = require(path.join(runtimeModules, '@napi-rs/canvas'));
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const {decodeAtlas, renderAtlasPanel, projectLonLat} = await import(pathToFileURL(path.join(project, 'dist/atlas.js')));
const topology = JSON.parse(fs.readFileSync(path.join(project, 'dist/assets/atlas/countries-50m.json'), 'utf8'));
const started = performance.now();
const geometry = decodeAtlas(topology);
const overview = createCanvas(2400, 800), overviewContext = overview.getContext('2d');
const crops = [[0, 1430, 660, 'america'], [1, 320, 770, 'africa'], [2, 40, 1520, 'australia']];
const output = path.dirname(fileURLToPath(import.meta.url));
const panels = [];
const master = createCanvas(1, 1), density = .64;
const materialStart = performance.now();
renderAtlasPanel({canvas: master, createCanvas, geometry, panelWidth: 9600, density});
const fullMaterialMs = Math.round(performance.now() - materialStart);
overviewContext.drawImage(master, 0, 0, 2400, 800);
for (let index = 0; index < 3; index++) {
  const canvas = createCanvas(2048, 2048);
  const time = performance.now();
  canvas.getContext('2d').drawImage(master, index * 2048, 0, 2048, 2048, 0, 0, 2048, 2048);
  fs.writeFileSync(path.join(project, `dist/assets/atlas/native-panel-${index + 1}.webp`), await canvas.encode('webp', 94));
  const crop = crops[index], detail = createCanvas(1920, 1080);
  detail.getContext('2d').drawImage(master, (index * 3200 + crop[1]) * density, crop[2] * density, 1920 * density, 1080 * density, 0, 0, 1920, 1080);
  fs.writeFileSync(path.join(output, `atlas-detail-${crop[3]}.jpg`), await detail.encode('jpeg', 90));
  panels.push({index, native: [canvas.width, canvas.height], milliseconds: Math.round(performance.now() - time)});
  canvas.width = canvas.height = 1;
}
fs.writeFileSync(path.join(output, 'atlas-overview.jpg'), await overview.encode('jpeg', 92));
let invalidCoordinates = 0, longEdges = 0;
for (const polygon of geometry.polygons) for (const ring of polygon) for (let i = 1; i < ring.length; i++) {
  if (!ring[i].every(Number.isFinite)) invalidCoordinates++;
  if (Math.abs(ring[i][0] - ring[i - 1][0]) > 3840) longEdges++;
}
const checks = {data: geometry.stats, logicalSize: [9600, 3200], nativeVectorRender: [6144, 2048], nativeTexturePixels: 6144 * 2048, panels, fullMaterialMs, totalMs: Math.round(performance.now() - started),
  seams: 'Panels extracted without resampling from one continuous6144x2048 native render; global material phase and geometry are shared',
  invalidCoordinates, antimeridianSpanningEdges: longEdges,
  knownProjectionPoints: {greenwichEquator: projectLonLat(0, 0), southCape: projectLonLat(18.5, -34.8), capeHorn: projectLonLat(-67.3, -55.98)}};
fs.writeFileSync(path.join(output, 'atlas-qa.json'), JSON.stringify(checks, null, 2) + '\n');
console.log(JSON.stringify(checks));
