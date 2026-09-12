# Voice Canvas / 自动演奏家

[Open the show / 在线演出](https://jogjohgoeg.github.io/voice-canvas/)

One page, two output modes. 一个页面，两种演出方式。

1. **Browser piano + audiovisual show / 浏览器钢琴声画** — default. Click Start for an original seeded piano miniature, choose a library piece, or use MIDI/microphone input from Advanced. The browser synthesizes the piano while musical features animate the picture.
2. **MIDI to digital piano / sound module / MIDI 乐器输出** — browser synthesis is muted. Choose a Web MIDI output device; the same score goes to that instrument. Incoming MIDI drives the same visuals without echoing notes back to the instrument. Hardware output is opt-in.

Sound starts only on a click. Start/Stop controls the shared performance clock; stopping releases scheduled MIDI notes and sustain. The library picker, Random, style, intensity, Record, Fullscreen and Projector are the main controls. Everything else lives in one collapsed **Advanced** drawer. Old page addresses redirect to the home page.

声音需点击开启。浏览器模式为默认；MIDI 模式不会同时播放浏览器钢琴。谱库搜索支持作曲家、标题、作品号，以及时期、情绪和时长筛选。切换输出和停止演奏会发送停音信息。

![Unified show](docs/screenshots/show.png)

## Run / 运行

```sh
python3 run.py
```

Open `http://127.0.0.1:8765`. Python 3.9+; no required packages. For a static build: `python3 -m http.server 8765 --directory web`. Chrome is recommended for Web MIDI and microphone support; HTTPS or localhost is required. Browser speech recognition may use an online service.

## For pianists / 钢琴演奏者

Pick a library piece and press Play, or import a MIDI file in Advanced. Add pieces to a program and save a piece preset there. Automatic performance, library playback and instrument input share one musical-feature pipeline and visual renderer. A seed reproduces the generated note sequence; live microphone input changes the response.

In instrument mode, choose a connected digital piano or sound module. MIDI uses channel 1. Browser sound stays muted even with no output selected. A real instrument's audio is not automatically captured: the WebM records the browser mix, so MIDI-mode recordings are silent unless an external recording workflow captures the instrument. Hardware latency has not been measured. The browser voice is synthesized, with fixed note decays rather than concert-piano samples.

Projector opens a clean window carrying the main renderer's video stream, with no second score clock or duplicate scene engine. Press **P** for fullscreen, **Space** for Start/Stop, **R** for a 15-second WebM, **S** for PNG; text fields keep normal keyboard behavior.

## Styles and optional tools / 风格与可选工具

**Fusion / 融合** defaults to organic symmetry, curved luminous brush strokes and ink wash. Moyers, Van Gogh, Ink and Monet remain in the style dropdown. Advanced contains voice/text input, visual studies, sound arrangement, mappings, program preparation and the local shader gallery.

Zero-AI is the default. The procedural show needs no model. Optional GPT-6 scene briefs/shaders and Blender loops appear in Advanced only when a local backend responds. The backend uses an existing Codex CLI login; install/login separately if you want generation. Blender EEVEE works asynchronously and never blocks the live show. GPU load automatically reduces particle count or plugin resolution; 60 fps is a target, not a hardware guarantee.

## Repertoire / 曲库

The public catalogue has **2,590 entries**, **1,073 MIDI fingerprints**, and a **455,596-byte** curated subset: 30 public-domain MIDI files and three CC0 MusicXML scores. The expanded local catalogue has 3,866 entries, including 1,276 non-commercial MAESTRO performances that are excluded from this repository. Sources, licence details, failed links and local fetch instructions are in [REPERTOIRE.md](docs/REPERTOIRE.md).

## Credits and licence / 致谢与许可

Original code-generated visuals inspired by Tim Moyers' audiovisual work, Van Gogh, Chinese ink wash and Monet; no artwork or recordings copied. Piano-performance references and MaleCNS data credits are in [RESEARCH.md](docs/RESEARCH.md). Code is MIT; repertoire and connectome data retain their separately documented licences.
