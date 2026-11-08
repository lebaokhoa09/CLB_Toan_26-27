# 001 — Increase actual travel distance while retaining six seconds

- Status: DONE — implemented and verified2026-10-24
- Commit:4802a87
- Severity: HIGH
- Category: Easing/duration and spatial motion
- Scope: dist/route.js,dist/world.js; retain app.js six-second linear progress.

## Evidence and reviewed finding

| Before | After | Why |
| --- | --- | --- |
| route.js:4 advances130px per leg; app.js:80 spends6seconds | Advance780world pixels per leg in the same6seconds | The old21.67px/s is only0.26ship widths per leg. The user explicitly requires a longer distance, not a shorter duration. |
| Fixed camera and a finite1920map restrict ten legs to small increments | Horizontal tracking camera over a periodic wide chart | Preserve the vessel in frame while it covers the longer course, like a tracking shot. |

Verdict before execution: Block for this user's requested pace. No measured dropped-frame finding is established merely by the slow travel. Existing source is linear and the main issue is distance/time.

## Target

World route: START=[720,620], LEG_DISTANCE=780, LEG_DURATION=6. Ten endpoints are[720+780*(i+1),620]. sampleLeg integrates a smooth speed ramp lasting0.18s at either end, then cruises for5.64s; no modulo in global travel. Average speed130px/s at1920reference scale, exactly6times prior130/6; cruise134.02px/s. Hidden point coordinates are illustrative, not GPS. The short ramps address the latest user report that starts/stops still feel stiff, while keeping the spatial course perfectly straight.

Camera: OrthographicCamera(-960,960,540,-540,.1,100), z10. At point[x,y], camera.position.x=x-START[0]. The vessel remains at720screen pixels and y620; its absolute world X advances. No orientation, zoom, heave, roll, warping, blur, reflection, opacity change or extra pose. Shadow follows same world translation.

Floor: a wide horizontally periodic reference2-style chart. One viewport-plane follows camera X, with textureRepeat.x=1920/(nativeAspect*1080), textureOffset.x=(1-repeat)/2+cameraX/tileWidth. GPU UV transform provides scrolling of static art. If a residual seam exists, a small static ocean-only edge material blend may join the tile, preserving central land and leaving ship shader untouched. New chart must not include X/routes/labels. Global time/distance must never wrap, so question-return retains exact world coordinate, tile offset and camera.

Existing GSAP progress remains6s,ease:none,pause/visibility holds and epoch guards. No ScrollTrigger/Lenis scrolling controls, new UI, unrelated transition redesign or dependency installation. Keep supplied solid ship asset and question/opening flows unchanged.

## Steps

1. Preserve prior world/route under ../motion-evidence/speed-revision/baseline for a real-renderer comparison.
2. Replace only route constants and sampler to the collinear global course.
3. Configure periodic chart texture, tracking orthographic camera and camera-aligned floor plane in world.js. Keep one standard solid ship and contact shadow.
4. Expose read-only diagnostics of global travel,camera,screen anchor,speed and tile offset. Keep reduced motion static and existing GSAP holds respected.
5. Build a local QA page outside deployment that records six-second old/new actual renderer playback and frame intervals via visible buttons. Do not use hidden state shortcuts in game QA.
6. Verify production flow, ship/map continuity through question return and late wrapping points; update current docs.

## Verification

Node sampler assertions for all10legs: each displacement780, six-second pace, exact neighboring endpoint equality, monotone horizontal motion, y620.
Supported browser QA at1920×1080and1440×900, plus actual user's2877×1604frame. Verify map/ship relative motion by video and actual recorded source code (not just stills). Measure outer frame intervals and render CPU, distinguish from FPS guarantee. Compare6second old/new distance and movement visually. Exercise Space pause/resume, wrong-answer lock, manual Continue, all10questions and closing. No X/dashes/labels or reintroduced liquid/morph artifacts.

Done when the actual six-second recording shows the chart passing the rigid vessel markedly faster, no seam jump/teleport at wraps or question return, and flow checks pass. Independent motion review should score pace, continuity and performance at this scope.

## Execution evidence

Actual supported-browser recordings: ../motion-evidence/speed-revision/leg1-comparison.webm and leg3-comparison.webm, with metrics and0/3/6second PNG exports. Leg3 recording includes456 frame callbacks in6seconds; median11.4ms,p9525.9ms in the dual-renderer/recorder harness, medianCPU0.5ms. Leg1 was slower under host load (median30.1ms,p9557.6ms). These describe this recording environment, not a stable60FPS or projector certification. Exported MP4 cadence is an encoding setting, not measured unique FPS.

Production UI checks: all10questions reached in sequence; each end coordinate advanced780world pixels, six-second configured duration; first wrong answer locked with correct feedback; subsequent answers/Continue passed; Space paused/resumed without resetting, retained endpoint after question return; closing and Home-to-lobby passed; no browser warning/error logs. Actual full-page viewport captures at1920×1080,1440×900 and2877×1604 were viewed. Source sampler checks covered all10endpoints,10001samples per leg, monotonicity and constantY. Three render calls/six triangles/three textures; shader compiled without warnings.

Independent fresh finish review: disposition: ship for this narrow pace correction. Continuous video smoothness and original-video perspective changes are not certified by that review; it inspected real recording samples, metrics, current code and valid captures. No claim of100% source3D reproduction. Documenter reconciled DESIGN.md and sidecar. One detector pass:0anti-patterns,68advisories on existing hidden controls/style tokens; no unrelated design drift repaired.
