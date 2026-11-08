# Kỳ Thư Đại Hải — finite curved voyage

## THESIS
A desktop/projector film interrupted by ten mathematics question slides. The audience sees an uninterrupted, readable presentation with essential answer controls only.

## OWN-WORLD
Reference2 remains the material authority: dark wood hull, cream sails, fine rigging, navy ocean, violet land and gold coasts. The user approved plan002 and requested deployment. A native vector-rendered finite chart and an authored opaque three-masted 3D galleon now support the enlargement and curved headings. Preserve opening art, separately animated calligraphy, question artwork and all PDF text. No liquid hull, pose crossfade, X marks, dashed paths or black Câu labels.

## STORY
One Bắt đầu trình chiếu click → five visible seconds fully black → automatic5.5second opening → ten six-second legs. Every leg covers778.934246world units along one continuous cubic B-spline, with0.18second speed ramps at either end and5.64seconds of cruise. Average pace129.822374units/s preserves the accepted130units/s. At an invisible stop, dissolve to its question. A–D locks immediately; manual Continue returns to the exact same endpoint/heading/camera before the next leg. Finish after10answers. Home from closing returns to the lobby.

## FIRST VIEWPORT
Black lobby with one cream start button. Standby is wholly black with no countdown. Intro shows artwork/title. Voyage has only the textured chart, solid ship and subtle contact shadow. ZERO X markers, route strokes/dashes or map question labels, including previous stops. Questions retain text, choices and Continue after feedback. No audience HUD/settings/score toolbar.

## FORM
Pinned-reference, code-led implementation of the approved route plan. The ship is about half its former visible width; the finite atlas is9600×3200logical units. Travel winds below South America, the south Atlantic, Africa and Australia/New Zealand without wrapping the world. CameraXY follows a120unit look-ahead with a180unit C2 soft clamp, keeping its angle/zoom fixed. Genuine model yaw follows the projected tangent while masts remain upright. No heave, roll, wobble, optical flow or whole-image rotation.

## Implementation and honest limits
Three.js renders a fixed1920×1080 reference viewport over a single finite chart. The chart is a true6144×2048 vector/procedural render, split into three2048² local WebP panels; it is not an enlargement of the former2172×724 image. Natural Earth generalized1:50m vectors use X=(.10+.80*(lon+180)/360)*9600,Y=(85-lat)/180*3200, with extra southern ocean. All chart textures clamp; no repeating geography or seam shader. Coastline-aware control refinements avoid small islands as well as large continents.

The ship is a stylized authored3D reconstruction with three masts, eleven opaque sails, wooden hull, ports and rigging. It is rendered into a768² multisampled target by a fixed upright orthographic camera and composited onto the chart. This permits real yaw without tilting the display card or blending source poses. It is not a pixel-identical copy of the reference vessel; sails/rigging have a fixed pose. Ten model draw calls and70,444triangles, plus the chart/card/shadow. The chart remains illustrated2D artwork; this is not a wholly reconstructed3D globe.

Desktop letterboxing preserves the frame; pixel ratio caps at2. No phone layout. Textures are preloaded before the start becomes available, buffers retained behind slides, hidden tabs pause clocks and reduced motion holds a still until arrival. Old ImageGen voyage files remain as reference/fallback only.

## Verification
Route checks sample10,001points: no land hits, minimum center-to-shore distance273.7468logical units, all camera footprints inside the finite atlas. A separate vertex projection check over160headings/10,001route positions keeps the full model inside1920×1080(max bottom1031.96). These are generalized-map/sample checks, not navigational certification. Verify actual1920×1080,1440×900 and2877×1604captures, all10question transitions, pause/resume, answer locking and closing. Measure frame times in their actual environment; no unmeasured60FPS/projector claim.
