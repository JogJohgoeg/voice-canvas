# Cached piano worlds

The page opens with the cached Opening world as its default background. A first scene click starts the saved original piano phrase; it is not a recording or a transcription of Mishima. Playback loops locally without model calls. World remains selectable through the same one-prompt performance page. Try **“Glass Mishima Opening World”**, or **“Glass Mishima Opening World 零AI”** to play through MIDI input without a director request. Add “麦克风” for acoustic input. Drag to look around; scroll for a small dolly movement. The projector and recording use the same world + particle composition.

A Marble world is generated **before** performance, once per piece and movement. Music changes the camera, exposure, screen-space atmospheric haze and the existing particle overlay. It never regenerates or deforms the world. The supplied GLB is the provider's collider mesh, not a textured replacement for the splat. Free navigation is deliberately limited near the initial viewpoint; this viewer does not implement collision detection.

## Prepare locally

Provide `WORLDLABS_API_KEY` in the process environment. The worker does not read login files or embed credentials in browser assets.

```sh
python3 server/world_worker.py --piece glass-mishima --movement opening \
  --brief 'A sparse pale courtyard at dawn, paper walls and distant trees' \
  --quality draft
# After inspecting the preview, repeat with --quality full.
```

Run long jobs detached, with standard input closed and logs redirected. `--root` selects the persistent cache directory; default is `worlds/` at the repository root. The local server exposes that cache read-only. Generation is a separate offline command; there is no public paid-generation route or generation button.

Each `worlds/<piece>/<movement>/<draft|full>/manifest.json` records the prompt brief, seed, provider world ID, timing, assets, semantics metadata and credit balance delta. A root index selects cached worlds; full quality is preferred for the same movement. Repeating a completed request uses the cache; repeating a pending request resumes the saved operation. A process lock prevents concurrent jobs. A reserved submission whose response was lost is not automatically purchased again.

The persistent budget ledger caps new submissions at **12 drafts + 4 full worlds**. Keep the ledger when moving a cache. Reaching the cap requires a new user decision; the worker does not increase it. Text input currently costs **230 credits for Draft** and **1,580 for Marble 1.1**; Plus is not used. Recorded balance deltas can include other clients' spending if they share the account concurrently. [Official API pricing](https://docs.worldlabs.ai/api/pricing).

## Serve without a key

```sh
python3 build/export_worlds.py worlds
python3 build/build.py
```

The export copies only ready splats, thumbnails and public scene metadata into ignored `web/worlds/` and `docs/worlds/` build artifacts. Account balances, operation records, credentials and the local budget ledger are excluded. Cloud deployment serves these cached artifacts; GitHub Pages can read the cloud's cache with restricted CORS. A fresh static checkout still works with no key, backend or cached world: World reports unavailability and the live Fusion preset continues.

The viewer lazily loads pinned **Three.js 0.180.0** and **Spark 2.2.0** from their distribution CDNs. Neither is loaded until a matching world exists. Both are MIT-licensed. CDN/load failures preserve the live renderer. Where Marble supplies scale metadata, the viewer applies metric scale and ground offset, then the documented X-axis conversion. If metadata is absent, navigation uses native asset units; it does not claim metric distances. [Spark](https://sparkjs.dev/docs/), [Spark licence](https://github.com/sparkjsdev/spark/blob/main/LICENSE), [Marble coordinate conventions](https://docs.worldlabs.ai/api/rendering-spz).

Cadences choose a deterministic new viewing angle; MIDI section markers select matching cached movements. Dynamics change dolly speed and exposure, harmony tension changes orbit/roll, phrase arcs push/pull, and pedal controls a soft atmospheric overlay. Resolution decreases under slow frames. Cached radiance is baked into splats: “light” here means exposure, not physically relighting the scene.

## Measured on 2026-09-12

| Piece / movement | Quality | Seconds incl. download | Credits |
|---|---|---:|---:|
| glass-mishima / opening | draft | 34.95 | 230 |
| glass-mishima / opening | full | 316.89 | 1580 |
| glass-mishima / closing | draft | 54.37 | 230 |
| liszt-source / au-bord | draft | 34.7 | 230 |
| ravel-ondine / ondine | draft | 34.05 | 230 |

Total: 4 drafts + 1 full, **2,500 credits**. Opening draft and full playback each measured 16.7 ms median / P95 frame intervals in a 756×469 Chrome test window, with adaptive internal resolution. This is not a full-screen hardware guarantee. No StreamDiffusion software was installed.
