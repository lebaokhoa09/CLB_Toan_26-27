# Cinematic native voyage — implementation record

The earlier web version made the vessel too small on screen and confined the journey to sea. The new native scene enlarges the atlas relative to the vessel while keeping the vessel readable through a nearby perspective camera. The route crosses both sea and continents, with ten equal-distance legs of five seconds each.

## Implemented and verified

- Native master: `blender/ship-voyage-v9/Ky-Thu-Voyage-v9.blend`, separately authored from v8; v8 SHA preserved.
- C2 geographic route with equal arc lengths: 3.378 vessel lengths per leg and minimum radius 3.236 vessel lengths. Rigid vessel yaw, no added heave/roll/wind/waves.
- Short acceleration, longer deceleration and six held frames before every question. Camera changes phase during legs 4 and 8, stays on one side of the route and opens slightly at the final stop.
- Camera A/C moved nearer broadside/front-quarter after the planned stern angle made the sails unreadable in real previews. The actual camera choice is recorded in the scene builder, rather than claiming the initial shot description was retained exactly.
- Reopened native: ten technical checks passed, nine matrix-identical root/camera/light seams and ten exact holds. Actual evaluated atlas geometry leaves at least 0.161 m below the ship; curve bounding boxes alone overestimated its height.
- Rendered 1,500 actual Workbench frames and decoded all ten H.264 clips, 30 fps, 5 seconds each; full review is 50 seconds. Raw pixel seams and held frames passed independent inspection.
- Video-driven player, preloading, decoded endpoint stills, pause/visibility/reduced-motion handling, save/resume and local byte-range serving. Eight synthetic integration checks, four race regressions and targeted hold-tail tests passed.
- Default headless Chrome, with Blender stopped: actual previs media passed all ten clips/questions without browser errors. This is a local integration check, not publication or final lighting acceptance.

## Review entrypoints

- Run `MO-BAN-THU-V9.cmd` from the site folder to open the local motion-previs game at port 54834. It requires Node.js and the adjacent Blender project/media folders.
- Existing review server for the current session: `http://127.0.0.1:54833`.
- `blender/ship-voyage-v9/previs-media/review-50s.mp4`: full motion review.
- `blender/ship-voyage-v9/pilot-blocking-leg04.mp4`: five-second motion pilot.
- `blender/ship-voyage-v9/review/REVIEW.md`: independent staging evidence.
- `motion-evidence/cinematic-v9/web-tests/motion-previs-test-report.json`: actual ten-question test.

The explicit `VOYAGE_MEDIA_ROOT` local override keeps these provisional assets out of the production media directory. Default serving behavior remains unchanged. No deployment was performed.

## Material/render work remaining

The procedural master remains intact. A separate 4K PBR cache experiment bakes only linear material data, without lighting or reference pixels. It reduces the measured cost of an isolated matched frame, but has not established a full-film steady-state speedup or final visual parity. The 1K version was visibly too soft and rejected; the 4K version preserves coarse land structure but changes some fine sea structure.

The textured pilot uses that separate cache only for provisional motion review. Final material fidelity, all-location lighting/temporal checks, full 1920×1080 film export and production media integration/publication remain pending. Do not label the current Workbench film or experimental cache as the finished audience film.

## Reproduction and operational limits

`build_voyage.py --build` recreates the master. `verify_native.py` reopens and checks it. `build_voyage.py --render` supports a separate `--native` variant and contiguous `--batch` rendering. `build_media.py` fully decodes the exported clips and publishes its manifest last; verified `holdFrom` metadata requires matching native/render proof.

Competing GPU render/browser tests stalled intermittently. Idle default Chrome and software diagnostics passed; the exact driver/presentation cause is unresolved. The player advances by actual media time and has a bounded optional guard only after a verified stationary tail has been displayed for the required active time.
