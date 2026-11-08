> Superseded by the latest reference2 revision: the user explicitly removed heave, roll, dolly, easing, X marks, dashed routes and labels. This document preserves the earlier experiment only. See WORLD-BIBLE.md.

# First-leg motion experiment — 24 October 2026

Scope: the first six-second leg, arrival at question 1, and retirement of its camera offset before leg 2. The supplied vessel, map, palette, question content, ten-stop progression and five-second black standby remain. This is a 2.5D source-image composite, not a reconstructed 3D vessel.

## Audit and direction

| Category | Existing evidence | Consequence |
| --- | --- | --- |
| Camera / choreography | `app.js` used `zoomTo()` but `world.js` never consumed `view.zoom` | Arrival's 0.65 seconds were a still hold, despite the function name. |
| Timing / easing | One `sine.inOut` drove both route position and source pose/camera time | All channels accelerated together, with little separation of anticipation, travel and arrival. This is an aesthetic judgement, not a measured frame-rate problem. |
| Spatial depth | Eight source poses plus an orthographic map transform | Existing perspective cues are baked into imagery. A free camera orbit would expose absent geometry. |
| Stage continuity | A rectangular, rotated artwork curtain moved over both scenes | Reads as a slide wipe; not physically related to the ship's approach. |
| Stagger | Question entry used 45 ms between items while curtain still covered it | Reasonable UI timing, but much of the entry was concealed. |
| CPU cost | Every update projected all 901 route vertices and recalculated distances | Avoidable first-leg work. No evidence of baseline frame drops in the visible desktop measurement. |

Three directions were considered before implementation:

1. **Chart-guided dolly (selected):** 0–0.9 s departure; 0.9–3.6 s tracking; 3.6–5.4 s approach; 5.4–6 s braking; 6–6.65 s final dolly; then question-background dissolve and text/answer entry.
2. **Sail occlusion:** 0–1 s establishment; 1–4 s track; 4–6 s close sail passage conceals the scene change. Stronger cut, but needs more high-resolution source detail and risks exposing the planar asset.
3. **Reference-film cadence:** 0–2 s overview; 2–4.5 s route following; 4.5–6 s the reference's late close-up. Needs additional segmented poses from the latter part of the supplied film.

## Implemented contract

- `first-leg-motion.js` is the deterministic shot sampler. Route speed ramps smoothly up, cruises, then brakes. Camera uses bounded quintic interpolation and starts from the original composition.
- Framing scale opens from 1.18 to approximately 1.125, reaches 1.26 at the destination, then 1.325 after the arrival dolly. No FOV, roll or perspective is fabricated for the map.
- Vessel heave is limited to 1.8 source pixels and roll to 0.0045 radians, both zero at the endpoints. Rotation is anchored at the hull contact point.
- A static 91-point first-leg route is projected in the vertex shader. Other legs retain their original route geometry and dash calculation.
- Question 1 uses its actual background as the dissolve layer (0.55 s); heading entry starts at 0.36 s; choices start at 0.52 s with 45 ms stagger. No new image or texture is loaded.
- Returning from question 1 retires the pilot framing over the existing 0.55-second settle. Leg 2 begins at the original camera and pose. The ship-region pixel comparison at this seam is identical; differences are restricted to destination markers and text.
- Reduced motion bypasses the pilot camera/heave/roll and uses short fades without stagger. Existing pause, visibility, fallback and answer locking logic remains.

## Verification evidence

Evidence is kept outside the deployed source under `../motion-evidence/`.

- Browser: Codex in-app Chromium, foreground visible run on this Windows host.
- Real WebGL milestone captures at 0, 1.5, 3, 4.5, 6 and 6.65 seconds, baseline and pilot at 1280×720; pilot also at 1440×900, 768×1024 and 390×844.
- Recorded renderer playback: `pilot-runtime.webm` and `pilot-runtime.mp4`. These show the 6.65-second WebGL shot, not the following DOM question transition.
- Ship and X remain within the authored 16:9 frame at inspected milestones. Narrow screens retain letterboxing; this remains a desktop/projector composition, not a new portrait composition.
- Numeric sampler check: 10,001 samples preserve endpoints, stay in [0,1], and advance monotonically. Node syntax checks passed. Impeccable detector returned no findings on changed JS.
- Actual application reached question 1 with the pilot camera at 1.325 and no busy hold. Incorrect answer A locked all choices; subsequent B input did not change the choice. Continue reached leg 2 at the original 1.18 framing. Space paused the second leg.
- After a separate interval, the paused progress remained exactly 0.347734. Resuming reached question 2. At 390×844 all four choices were visible, document width and scroll width were both 390 px, and no application console error was captured.

| Visible 1280×720 run | Baseline | Pilot |
| --- | ---: | ---: |
| rAF intervals observed | 799 | 799 |
| Median interval | 8.3 ms | 8.3 ms |
| p95 interval | 8.5 ms | 8.4 ms |
| Intervals over 25 ms | 0 | 0 |
| Median CPU work in shot update | 0.3 ms | 0.2 ms |
| p95 CPU work in shot update | 0.4 ms | 0.3 ms |
| Draw calls / triangles / textures | 7 / 12 / 5 | 7 / 12 / 5 |

These short runs do not demonstrate a meaningful FPS improvement: both sustained the host's approximately 120 Hz scheduling. Measurements use outer rAF intervals; the renderer may be called twice during arrival, so its internal per-render interval is not used as a display FPS measurement. CPU timings are approximate browser readings, not GPU execution time.

The texture estimate is 48,046,080 bytes (about 45.8 MiB), derived from dimensions and mipmap settings. This is not a measurement of total GPU memory; driver buffers, render targets and browser composition are excluded. No new texture was added. Physical mobile hardware, projector hardware and sustained thermal behavior have not been measured.

The earlier minimized Cốc Cốc run was invalid for performance comparison and has been superseded by these visible in-app measurements. Visual review supports the stated framing and continuity checks; aesthetic preference remains a user decision.
