---
name: "Kỳ Thư Đại Hải — projected edition"
description: "A source-art voyage and mathematics question presentation for a desktop projector."
colors:
  stage-black: "#000"
  night: "#0c102a"
  cream: "#fff1cf"
  gold: "#dfc58f"
  primary-ink: "#29203e"
  primary-hover: "#e4cda2"
  story: "#e4dcf1"
  answer-surface: "#151c3bea"
  answer-text: "#fff1d6"
  correct-surface: "#304943"
  correct-text: "#f2f8e8"
  wrong-surface: "#543044"
  wrong-text: "#ffebf0"
  muted-surface: "#171c35bf"
  muted-text: "#b2a6c7"
typography:
  display:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "clamp(35px, 4.1vw, 74px)"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "clamp(24px, 2vw, 39px)"
    fontWeight: 700
    lineHeight: 1.42
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "clamp(16px, 1.24vw, 23px)"
    fontWeight: 400
    lineHeight: 1.68
  body-long:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "clamp(18px, 1.25vw, 24px)"
    fontWeight: 400
    lineHeight: 1.6
  answer:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "clamp(16px, 1.25vw, 24px)"
    fontWeight: 600
    lineHeight: 1.45
  label:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
  action:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  start:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "20px"
    fontWeight: 700
rounded:
  control: "5px"
spacing:
  page: "clamp(22px, 4.2vw, 80px)"
  answer-grid: "12px"
  answer-inline: "15px"
  feedback-top: "24px"
components:
  button-start:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.start}"
    rounded: "{rounded.control}"
    padding: "20px 34px"
  button-continue:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  answer:
    backgroundColor: "{colors.answer-surface}"
    textColor: "{colors.answer-text}"
    typography: "{typography.answer}"
    rounded: "{rounded.control}"
    padding: "clamp(15px, 1.5vw, 25px)"
  answer-correct:
    backgroundColor: "{colors.correct-surface}"
    textColor: "{colors.correct-text}"
  answer-wrong:
    backgroundColor: "{colors.wrong-surface}"
    textColor: "{colors.wrong-text}"
  answer-muted:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.muted-text}"
---

# Design System: Kỳ Thư Đại Hải — projected edition

## Overview

**Creative North Star: "The Illustrated Projection"**

A continuous illustrated voyage gives way to large, readable mathematics slides. The user's latest image 2 establishes the voyage identity: a detailed dark wooden sailing vessel, cream canvas, fine rigging, textured navy ocean, violet land, gold coastline and upper-right sunlight. The supplied opening and question artwork retain their established roles. Opening lettering remains an image asset; ordinary reading text uses locally hosted Be Vietnam Pro.

The audience surface is deliberately sparse. A single start action hands the display to the presentation; question slides keep only their ordinal, story, prompt, choices and eventual feedback. One opaque three-masted 3D vessel follows a curved course across a finite atlas. Its physical yaw follows the route tangent while the camera tracks in both axes with fixed orientation and zoom. Brief speed ramps soften departure and arrival. Depth belongs to the textured navy/violet/gold chart, the lit wooden vessel and its subtle contact shadow. Screen controls use restrained flat fills and small corners so they remain readable against that world.

**Key Characteristics:**
- Finite vector-derived atlas and opaque three-masted vessel with physical yaw.
- Full-display staging with a preserved 16:9 voyage image.
- Cream reading text, gold functional accents and indigo-violet imagery.
- One smooth curved course, ten equal arc-length six-second legs and brief speed ramps.
- Host-paced answer feedback and continuation.
- Desktop and projector use; no mobile product requirement.

## Colors

Dark blue-violet imagery carries the atmosphere; warm text and gold marks carry reading and orientation. Frontmatter owns the exact reusable interface values. World-material colours belong to the native atlas renders and ship materials rather than an additional interface palette.

### Primary
- **Cream:** primary text and the filled start/continue buttons.
- **Gold:** answer letters, question ordinals and keyboard focus outlines. Gold coastlines and warm highlights belong to the chart artwork.
- **Primary Ink:** dark lettering within cream buttons.
- **Primary Hover:** the warmer cream response for pointer hover.

### Secondary
- **Correct Surface / Correct Text:** the revealed correct option.
- **Wrong Surface / Wrong Text:** the selected incorrect option.
- **Muted Surface / Muted Text:** unselected incorrect options after locking.

### Neutral
- **Stage Black:** the waiting and standby stages.
- **Night:** the base dark surface behind the reading stages.
- **Story:** the slightly lavender reading paragraph.
- **Answer Surface / Answer Text:** readable dark choice panels over the question illustration.

**The Gold Means Orientation Rule.** Use the warm interface accent for question ordinals, answer letters and keyboard focus; retain gold coastline and lighting detail within the artwork.

The sidecar's eight-step colour ramps are synthesized inspection previews. They are not additional shipped tokens or approved new surface colours.

## Typography

**Display Font:** Be Vietnam Pro, with sans-serif fallback, for the closing heading.
**Body Font:** Be Vietnam Pro, with sans-serif fallback, for all reading text and controls.
**Opening Lettering:** the supplied calligraphy PNG, independently layered over the opening artwork. It is not a font family.

**Character:** Open Vietnamese letterforms and generous line spacing support projection reading. The calligraphy supplies the expressive title; interface type remains direct and compact. The supplied local font files are semibold and bold assets; the CSS assigns nominal weight ranges to those static files, so these are not a variable-font weight ramp.

### Hierarchy
- **Display:** the large, close-tracked closing heading.
- **Headline:** the question prompt; long questions use the observed smaller clamp (23px to 35px) while keeping its weight and line spacing.
- **Body:** narrative paragraphs with a maximum measure of 74ch and preserved source line breaks.
- **Body Long:** the projected edition's long-story override; keep its larger readable text and allow scrolling.
- **Answer:** option text; gold letters are heavier than their accompanying text.
- **Label:** the functional question ordinal, not a decorative eyebrow.
- **Action / Start:** the compact continuation label and larger opening action.

**The Lettering Is Artwork Rule.** Preserve the opening calligraphy layer; do not replace it with a system font or invent a display-face approximation.

## Layout

Each stage occupies the available desktop display. The document itself does not scroll; question and closing reading regions can scroll. The lobby centers its single action on black, with a preparation status below while assets load. The status becomes invisible when ready.

The voyage is authored in a 1920 by 1080 coordinate window with an orthographic camera over one finite 9600 by 3200 world. These are logical scene units, not source pixels or geographic distances. On other desktop aspect ratios, the renderer centers and scissors the 16:9 composition. Camera position is a pure function of route distance: look ahead 120 units along the same curve, place that point near [800, 650], and softly clamp within the atlas using a 180-unit edge band. Both camera axes may move; orientation and zoom remain fixed. Near an atlas boundary the ship may move within the frame rather than revealing empty space beyond the map. The vessel's target width is about 260 units in the 1920-wide frame; its fixed 310-unit display quad includes transparent padding, and visible model width varies with physical yaw. Render pixel ratio follows the display up to 2, with low quality capped at 1; HTML text retains browser text rendering. The renderer keeps its drawing buffer while hidden behind questions rather than reallocating at every slide boundary.

Question content is left aligned over the shaded left side of the wave/orb illustration. Its ordinary width is the lesser of 67% and 1050px; wide desktops from 1700px use 65%, still capped at 1050px. It uses 76% at the existing compact-desktop breakpoint (1100px). The page inset follows the spacing token, with projected vertical padding of 7vh above and 6vh below. Two equal answer columns use the answer-grid gap. Feedback sits beneath the grid, with explanation left and Continue right; the compact desktop layout stacks that row.

Short desktop windows use the existing height query (620px and below, at widths of at least 701px) to reduce some prompt, option and feedback dimensions. Long reading content retains its internal scroll area. These are desktop accommodations; legacy phone-width styles are not a supported product direction.

Starting the presentation changes stage content without entering fullscreen, resizing the stage or recreating the presentation surface. F or the browser's F11 may be used separately during setup.

## Elevation & Depth

The audience controls are flat. Answer surfaces use translucent dark fills and fine lavender strokes, with no card elevation shadows. A left-to-right reading shade separates text from the supplied wave/orb artwork; a vignette encloses the voyage. The atlas carries native baked mineral grain, violet facets, gold coasts and warm upper-right illumination. The opaque ship uses real geometry, rough wood and cream cloth materials, hemisphere light and directional key/fill lights. A separate soft elliptical contact shadow moves with the vessel; it is scene shading, not a generic interface shadow language. The moving artwork curtain alone has a soft inset edge shade (inset 0 20px 90px #0005).

**The Illustration Carries Depth Rule.** Keep ordinary reading and action surfaces flat; retain the scene-specific shading that belongs to the illustrated world.

## Shapes

Audience buttons and answer panels share gently squared corners through the control radius. Choice panels have a thin border rather than a raised frame. Preserve the reference-informed wooden hull, three masts, cream sails and fine rigging, alongside the vector-derived coastline contours. The vessel retains rigid geometry as its physical heading changes; its display quad remains upright. The voyage contains no X, route stroke, dash or destination label. The wave/orb artwork's native curves are part of the visual identity.

## Components

### Start and Continue Buttons

Cream, quiet and legible. The start button has a minimum height of 64px and a small outlined play symbol. Continue keeps the base minimum height of 54px, the compact action type, and a right-arrow symbol. Both use the control radius. Their exact padding is in the frontmatter. Pointer hover warms the fill; active press scales to 0.98 over 130ms. Keyboard focus has a gold outline (3px, offset 5px). Disabled primary controls reduce opacity to 0.5; the lobby action remains disabled until world preparation succeeds or the explicit still-image fallback is ready.

### Answer Panels

Four real buttons form a two-column grid. Each carries an A–D letter, option text and a result label when answered. Default minimum height is 77px. Pointer hover adds a gold stroke and a purple-dark fill; keyboard focus uses the common gold outline. A single pointer or A–D / 1–4 action immediately locks all choices. Correct, selected-wrong and muted results receive distinct fills, borders and written statuses. Disabled options remain fully opaque. Colour is accompanied by text, not used as the sole result signal.

### Question Slide and Feedback

Use the exact supplied wave/orb background with the observed reading shade. The small ordinal is essential navigation information; retain the story and prompt as separate reading levels. Feedback uses a bold short result line, explanation text and the cream Continue action. That action appears after locking and requires a deliberate press, Enter, ArrowRight or PageDown. Held keys do not repeat an answer or chain advancement. No scrolling gesture advances a slide.

### Voyage and Invisible Stops

The finite chart is a native 6144 by 2048 render drawn from locally decoded Natural Earth vectors and deterministic material styling, split into three distinct 2048-square panels. It is placed over the 9600 by 3200 logical world with clamped texture edges; geography does not repeat. Its projection spans 180 degrees of latitude, includes authored southern-ocean padding and omits Antarctica. Coastlines and country borders come from generalized data; mineral grain, relief, facets and sunlight are illustrative styling. This is a native vector-derived chart render, not an enlargement of the previous raster. At a full 1920 by 1080 logical view, the atlas material contributes about 1229 by 691 source pixels, so native texture resolution and display resolution remain distinct.

The ship is an authored opaque three-masted 3D galleon, rendered through a fixed upright ship camera to a 768-square transparent render target (512-square at low quality). The world displays that result on an upright quad above the contact shadow. Physical model yaw aligns the projected bow with the route tangent; the quad does not roll, tilt or warp to fake a turn. No optical-flow deformation, pose crossfade, heave, roll, wobble, water-reflection duplicate or glass/transmission effect is applied to the vessel. Wood, woven cream canvas, bronze details and rigging retain the reference's material character without claiming an exact photogrammetric or source-video reconstruction. Sail bracing and billow are fixed; yaw is the intended model motion.

One open clamped cubic B-spline supplies the entire course. A 30001-sample arc-length table gives a total distance of about 7789.34 logical units, split into ten equal legs of about 778.93 units. Each leg lasts six visible seconds, with a smooth 0.18-second speed ramp at either end and 5.64 seconds of constant-speed cruise; average speed is about 129.82 units per second. The route curves from the ocean west of South America, around Cape Horn, across the southern Atlantic and Indian oceans, then south of Australia and New Zealand toward the South Pacific. Stops remain invisible: no X marks, dashed route, map question labels or accumulated stop decorations. At arrival, route distance, position, tangent, physical yaw and camera position are retained behind the question and through its return fade before the next leg begins. Space pauses/resumes sailing without adding a toolbar. Hidden tabs suspend clocks and motion; rendering stops behind the question. No scroll gesture or new scroll control drives travel.

The current geometry reports sample the actual runtime route at 10001 positions: the centerline has no land hits and a minimum sampled shore distance of about 273.75 logical units. A separate projected-model framing check uses 10001 route positions and 160 sampled headings; its full ship bounds remain within 1920 by 1080, with maximum sampled Y about 1031.96. These are sampled geometric checks, not a projector-performance or pixel-identical reproduction claim. Fine one-pixel rigging can become subpixel at the target size; dark gunport insets are modeled details rather than boolean hull openings. Those limitations are not visual rules or quality targets. Earlier raster voyage assets remain fallback/reference material and are not loaded by the normal voyage renderer. The still-image WebGL fallback is explicitly labelled.

### Stage Changes and Closing

One start action gives a completely black standby (five visible seconds), then an automatic opening (5.5 seconds), then sailing. The opening title reveals over 2.1 seconds with small, slow artwork drift. The illustrated curtain takes 0.58 seconds to cover, holds briefly (0.03 seconds), then leaves over 0.66 seconds when entering the voyage from the opening and when entering closing.

Every sailing arrival dissolves the question surface in over 0.55 seconds. Heading/story content enters over 0.27 seconds; answers enter over 0.24 seconds with a 0.045-second stagger. Continuing fades the question out over 0.45 seconds to reveal the exact retained endpoint; the next leg then departs. The ship itself does not fade or deform. This choreography applies to all ten questions.

Reduced motion retains preparation time and content, holds a static sailing position until the invisible endpoint, removes drifting dust and press scaling, and substitutes gentle curtain fades (0.2 seconds each). Question arrival and return fades each become 0.2 seconds. Closing retains the supplied background, compass, heading and short completion line. The running score, replay/review buttons and editing controls are hidden. Home from closing returns to the black waiting stage.

## Do's and Don'ts

### Do:
- **Do** preserve the supplied calligraphy and wave/orb artwork, and the detailed voyage identity established by image 2.
- **Do** keep the five-second standby completely black and start the opening automatically.
- **Do** preserve the centered 16:9 voyage image on other desktop display ratios.
- **Do** keep one smooth course with ten equal arc-length six-second legs, 0.18-second speed ramps and identical endpoint, tangent, physical yaw and camera state through question return.
- **Do** provide written answer statuses and a deliberate continuation action after locking.
- **Do** retain readable long-question text with an internal scroll region when needed.

### Don't:
- **Don't** add an audience header, settings gear, sound/fullscreen toolbar, progress dashboard or running score.
- **Don't** add another departure button between standby, opening and the first leg.
- **Don't** add X markers, route strokes or dashes, or map question labels.
- **Don't** simulate heading changes by rolling or warping the display quad or crossfading vessel poses; do not add heave, roll, wobble, camera rotation or zoom.
- **Don't** repeat the atlas or replace its reference-informed navy/violet/gold material world with an unrelated visual direction.
- **Don't** describe the authored ship as an exact source-video reconstruction or confuse the 9600 by 3200 logical atlas with its 6144 by 2048 native render.
- **Don't** promote hidden legacy controls or phone layouts into supported audience patterns.
