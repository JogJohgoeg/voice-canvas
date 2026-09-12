# Voice Canvas / 一句话声画演出

[Open the cloud show / 打开云端演出](https://voice-canvas.zhuoning2934293.workers.dev/)

**No local service is required.** The browser plays piano and renders the picture; a Cloudflare Worker calls GLM-4.7-Flash for one coordinated musical and visual plan. The provider credential is a Worker secret and never reaches the browser or repository. The GitHub Pages copy also connects to this cloud endpoint.

Describe a performance: **“蓝色水墨与温柔的钢琴，旋律逐渐上升”**. Submit to start. Type **“停止”** to stop music and model continuation. Browser synthesis is the default. For a hardware instrument ask for **MIDI** or **数码钢琴**; with multiple devices, include **设备: device name**. This mutes browser synthesis; Web MIDI still requires browser/device permission.

一个模型同时谱写音符与视觉计划，包含节奏、音高、时值、力度、风格、形态、颜色和强度。新计划在乐句边界一起切换；模型来不及时重复上一段。模型负责艺术决策，本地音频时钟与渲染器负责实时执行。没有预设选择、功能菜单或 Advanced 入口。

![One prompt, one show](docs/screenshots/show.png)

The cloud GLM backend returns a bounded JSON score: an original piano phrase plus a coordinated visual plan. One request controls both; separate music/image model calls are not used. The browser executes note data and procedural visual parameters, rather than asking a language model to generate every frame or audio sample. Model text is never executed as code. The accepted plan retains a seed and exact notes for reproducibility; a fresh model call need not return the same plan.

A direct GLM-4.7-Flash probe returned a validated coordinated plan in 2.57 seconds. Latency and availability vary. New phrases are requested asynchronously, at least 15 seconds apart. The prior phrase repeats if the next one is late. Errors are shown without fabricating model output. The cloud route limits requests per IP (6/minute), request/response bytes, model output, and call duration. Rate limits are approximate per Cloudflare location, not a billing cap.

For your own deployment: `wrangler deploy --config cloud/wrangler.jsonc`, then `wrangler secret put PROVIDER_SECRET --config cloud/wrangler.jsonc`. The selected model is a non-secret variable in that config. The original local Codex backend remains available with `python3 run.py`, but is optional. Code-generated browser piano voices are not sampled recordings; hardware latency remains unmeasured.

The underlying repertoire, renderer presets, GPU gallery and optional Blender implementation remain in the project, without separate UI entry points. [Repertoire sources and licences](docs/REPERTOIRE.md), [research credits](docs/RESEARCH.md). Visual inspiration: Tim Moyers, Van Gogh, Chinese ink wash and Monet; original code-generated assets. Code MIT; data retain their documented licences.
