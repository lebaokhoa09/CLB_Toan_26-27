import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
const require = createRequire(import.meta.url);
const runtimeModules = 'C:/Users/Le Bao Khoa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {loadImage} = require(path.join(runtimeModules, '@napi-rs/canvas'));
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const THREE = await import(pathToFileURL(path.join(project, 'dist/vendor/three.module.min.js')));
const {createAtlas} = await import(pathToFileURL(path.join(project, 'dist/atlas.js')));
globalThis.fetch = async url => ({ok: true, json: async () => JSON.parse(fs.readFileSync(fileURLToPath(url), 'utf8'))});
class LocalTextureLoader {
  async loadAsync(url) { return new THREE.Texture(await loadImage(fs.readFileSync(fileURLToPath(url)))); }
}
const atlas = await createAtlas({...THREE, TextureLoader: LocalTextureLoader});
const info = atlas.getInfo();
if (atlas.object.children.length !== 3) throw new Error('Atlas must have exactly three panels.');
if (!info.nativePanels.every(size => size[0] === 2048 && size[1] === 2048)) throw new Error('Unexpected native resolution.');
const first = atlas.object.children[0], last = atlas.object.children[2];
if (first.position.x - first.geometry.parameters.width / 2 !== -960 || last.position.x + last.geometry.parameters.width / 2 !== 8640) throw new Error('Atlas world transform mismatch.');
if (first.position.y + first.geometry.parameters.height / 2 !== 540) throw new Error('Atlas top edge mismatch.');
if (atlas.landRings.length !== 1326) throw new Error('Coastline geometry mismatch.');
const result = {passed: true, info, worldBounds: {left: -960, right: 8640, top: 540, bottom: -2660},
  fileBytes: [1, 2, 3].map(i => fs.statSync(path.join(project, `dist/assets/atlas/native-panel-${i}.webp`)).size)};
atlas.dispose(); atlas.dispose();
result.disposedChildren = atlas.object.children.length;
if (result.disposedChildren !== 0) throw new Error('Atlas resources did not dispose.');
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'atlas-api-smoke.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
