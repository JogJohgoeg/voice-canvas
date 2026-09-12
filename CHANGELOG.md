## 2026-09-12 — Native portrait

- Replaced the primitive mannequin with an original generated, fully clothed fictional adult portrait and bounded local GPU breathing/cloth deformation.
- Included the relative-path image asset and rebuild wiring; microphone verification: 55 fps, no operator errors.

## 2026-09-12 — Native TouchDesigner rebuild

- Microphone and audio recordings now drive one native analysis chain and an original 1280×720 GPU flow shader, with editable `.toe` network and source.
- Added source, recording file, sensitivity and intensity controls; optional recording playback, microphone monitoring always off.
- Included original diagnostic WAV, native verification script and guide. Legacy browser project preserved separately.
- Measured approximately 58–60 fps after warm-up on this Mac; end-to-end audio latency is not yet measured.

## 2026-09-12 — Random piano background

- Replaced exact repetition of the saved phrase with locally arranged variations: a fresh music seed each visit, changing rhythm, melody, register, dynamics and two/three-voice textures.
- Reused the existing piano arranger and shared phrase scheduler. New director plans take over and Stop clears variation scheduling; cached worlds remain unchanged.

## 2026-09-12 — Default background switch

- Added one visible background switch and B shortcut to cycle cached worlds. The browser remembers the selected default; switching uses no generation requests and leaves music running.

## 2026-09-12 — Automatic world tour

- The default camera now completes panoramic turns and moves along a gentle curved path without input. Dynamics adjust travel speed; cadences smoothly redirect the tour. No new worlds or model requests are needed.

## 2026-09-12 — Saved background playback

- Open directly into the cached Opening world; first scene click starts an already-generated original 16-beat piano loop. No new model call or world generation is needed.
- New descriptions replace the background through the shared phrase scheduler. Stop cancels sound and does not restart on later scene clicks.
- Browser autoplay restrictions are respected; no extra control or menu was added.

## 2026-09-12 — Cached World layer

- Added environment-only offline Marble generation, resumable operations, local SPZ/collider-GLB/thumbnail cache and persistent 12-draft / 4-full limit with measured credit deltas.
- Added lazy Three.js/Spark playback; music drives camera/exposure/haze plus existing particles. Missing caches retain Fusion. Explicit requested World/Narrative presets survive model style drift.
- Public cache export excludes account/operation records; projector and recording share the composite. No StreamDiffusion installation or UI was added.

## 2026-09-12 — Narrative piano visuals

- Added a sparse pale-stage renderer with twelve original cuboids per figure, fine text connectors, seeded crowd motion, pedal afterimages and silence settling; Glass defaults to Narrative.
- Piece text/poem persistence, seven Mishima labels and MIDI marker timing feed phrase/cadence transitions. The renderer also works without model calls through the one-prompt Zero-AI command.
- Explicit camera on/off provides a letterboxed performer view above the scene; projector uses visual composition only. Camera frames never leave the browser.
- Added primary-reference credits and tests for default selection, MIDI markers, seeded pixels, quiet motion and mocked camera lifecycle.

## 2026-09-12 — Cloud GLM director

- Cloudflare Worker serves the show and calls GLM-4.7-Flash; no local process or Codex login is required by the cloud page. GitHub Pages routes its director requests to the cloud API.
- One model still controls notes and visuals; provider credentials stay in encrypted Worker secrets. Added request/response limits, strict score validation, CORS allowlist and per-IP rate limiting.
- GLM-4.7 returned account-balance error 1113; the free Flash model succeeded in a direct 2.57-second probe. Model continuation is paced at least 15 seconds apart.

## 2026-09-12 — One model, one performance prompt

- Removed all feature menus from the surface; a single prompt starts or changes the performance, and “停止” stops continuation and sound.
- GPT-6 returns one validated JSON plan containing piano notes and coordinated visual parameters. Shared-clock phrase boundaries apply music and visuals together; asynchronous preparation keeps the previous phrase live.
- Browser synthesis remains default; explicit natural-language MIDI requests enable an external instrument and mute synthesis. Added bounded score validation and prompt/score/stop browser regression.
- Real GPT-6 probe: 34 notes, 24 beats, coordinated ink plan in 16.357 seconds. Static hosting explicitly requires the local model backend.

## 2026-09-12 — Consolidated two-mode performer

- One home page: browser piano (default) or opt-in MIDI instrument output; browser synthesis mutes in instrument mode. Stop and mode changes release MIDI notes and pedal. Incoming MIDI is not echoed back.
- Main controls reduced; one collapsed Advanced drawer. Legacy entry pages redirect. Projector reuses the main compositor stream; removed independent voice/piano/projector entry engines.
- Expanded public repertoire: 2,590 entries, 1,073 fingerprints, 33 cleared files (455,596 bytes). Added 331 Krueger records and 12 IMSLP editions; MAESTRO remains local. Downloaded MIDI analysis: 2,349 successful, zero parse failures; two source URLs returned 404.
- Regression covers both outputs, default silence, mode muting, MIDI panic, redirects, catalogue filters and sequential setlists. Physical MIDI hardware remains untested.

## 2026-09-12 — Unified automatic performer

- Made the integrated performer workbench the home page; kept independent voice and piano pages.
- Added a seeded six-section, 32-bar autonomous score with theme return, development and coda.
- Added opt-in MIDI output, timestamped note releases, sustain and panic; shared music analysis drives all visual presets.
- Integrated speech/text scenes, MIDI input/files/demos, line-in, mappings, saved pieces, setlists, optional GPT-6/Blender, projector and recording into one clock and page.
- Preserved default-off sound, Zero-AI, existing Cinematic and electroacoustic modes.

# Changelog

## 2026-09-12 — Initial public release

- Standalone, bilingual Voice Canvas with Fusion default and three pure presets.
- Chinese-first live transcription, semantic parsing, microphone features, adaptive WebGL and opt-in synthesis.
- Portable seeded Random AV with shared audio clock, bounded evolution and WebM recording.
- Optional persistent GPT-6 CLI backend and asynchronous Blender ink/brush loops.
- Static Pages build, native LAN TLS, original screenshots and MIT license.

## 2026-09-12 — First live milestone

- Verified both Pages entries in Chrome, native audio output and 15-second VP9/Opus recording.
- Added seeded 2/4/6-fold symmetry, safe seed changes during recording and portable browser checks.
- Linked the voice and random entry pages; verified 390px mobile layout and DPR sizing.

## 2026-09-12 — Phase and palette coherence

- Matched visual breathing to the synth LFO and scheduled reform gestures from the particle phase.
- Prewarm all default Fusion families; preserve the single accent when choosing cached loops.
- Live optional GPT-6 Fusion probe completed in 15.24 seconds with 11 progressive previews.

## 2026-09-12 — Piano mode

- Added MIDI/audio musical features, six adjustable Fusion/Moyers mappings and saved piece presets.
- Added fixed-step Zero-AI performance, fullscreen and independent projector output.
- Added MIDI file playback, two public-domain Debussy excerpts and an original demo GIF.
- Added optional GPT-6 section briefs and setlist preloading, with local fallback.
- Documented verified performance research, musical heuristics and latency boundaries.

## 2026-09-12 — Monet / 印象派

- Added Monet and Fusion + Monet light, audio-driven water ripples and cloud density.
- Added optional Cinematic cello/piano synthesis, shared-clock phrase/cadence mapping and combined WebM recording.
- Added optional native EEVEE cloud/water/light rendering, cached asynchronously.

- Fixed local serving of new modules; dependency-route regression check added. Cinematic level and tempo display refined; Monet PNG/WebM also works without WebGL.

- Expanded cinematic piano into bass, arpeggio and treble parts with selectable density and bounded 24-note synthesis.
- Added Monet/Fusion light to Piano and projector, including saved piece presets and fixed mark counts in Zero-AI.

- Added seeded phrase-level random piano arrangements: voice combinations, arpeggios, inversions, registers, rhythmic rests, dynamics and decay; optional fixed arrangement.

- Vary now requests a new piano arrangement on the next beat without restarting the audio clock.

- Completed all six piano mappings in Monet light: palette, cloud motion, register placement, pedal haze/ripples and phrase breathing; fixed negative hue wrapping for red section palettes.

## 2026-09-12 — GPU plugins and real connectome

- Added eight original offline GLSL plugins, live parameter editing, bounded JSON gallery/import/export and asynchronous GPT-6 plugin generation.
- Compile and three-frame smoke checks run in a worker; completed draw budget is below 6 ms with resolution degradation and rejection.
- Added MaleCNS v1.0 visual-to-descending graph: 317 nodes, 20,937 weighted edges, 318 GF-target edges, labelled estimated spatial layout.
- Included plugin/connectome layers in projector and recording.

## 2026-09-12 — Searchable piano repertoire

- Indexed 3,523 local entries across MAESTRO, Mutopia, OpenScore and KernScores; analysed 1,306 MIDI files.
- Published 2,247 catalogue entries, 30 public-domain MIDI pieces and three CC0 MusicXML files; MAESTRO stays local.
- Added composer/title/opus search, era/mood/duration filters, audition, sequential setlists and saved library IDs to both workbench and piano analysis.
- Added reproducible download/export/fingerprint scripts, per-source licence status and a strict public subset size check.
