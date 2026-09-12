# Piano and real-time visual performance / 钢琴与实时视觉

Research checked 2026-09-12. These projects inform interaction design; no images, videos, code or recordings from these performances are included. Voice Canvas is not affiliated with the artists. Musical demo files have their own public-domain provenance below.

| Project / 项目 | Verified approach / 已核实方法 | What this implementation takes from it / 设计启发 |
|---|---|---|
| Pianographique — Maki Namekawa, Dennis Russell Davies, Cori O’Lan | A collaboration dating from 2013; music analysis informs live imagery. The 2023 transart program explicitly describes responses to dynamics, harmony and timbre, and also used generative AI. | Keep dynamics, harmony and timbre as separate musical inputs. Do not describe every Pianographique edition as Zero-AI. [Ars Electronica overview](https://ars.electronica.art/center/en/aixmusic/), [transart23](https://ars.electronica.art/futurelab/en/projects-pianographique-transart23/) |
| Forms of Resonance — Agustin Muriago and Natan Sinigaglia | Premiered May 31, 2025 at Lincoln Center. The artist describes Disklavier data, hand/finger tracking and separate visual-artist motion control. The program includes Liszt, Scriabin, Ravel, Takemitsu and Debussy. | Event-level piano input plus a separately adjustable visual interpretation; preload sections of a recital. [Artist's project](https://natansinigaglia.com/work/forms-of-resonance/), [venue listing](https://www.lincolncenter.org/venue/clark-studio-theater/forms-of-resonance-an-audiovisual-recital-575) |
| Guardian of the Night — Natalia Kazaryan / Counterpoint | The 2025 Ravel program at Dupont Underground pairs performance with real-time animation; the artist's biography specifies Gaspard de la nuit and generative visuals. | Work/section-specific visual motifs rather than one generic piano meter. [Howard University](https://finearts.howard.edu/articles/natalia-kazaryan-pianist-expanding-horizon-classical-music), [artist biography](https://ray-seadragon-ws6x.squarespace.com/bio) |
| Charlie Hooper-Williams | The artist describes a handcrafted reactive visual/light system and a custom harmonics machine. His Play & See installation lets piano notes shape visual scenes. | A locally coded, performance-driven mode with no model requests. The explicit “Zero-AI” wording was supplied in the user brief; the cited about page supports handcrafted algorithms but does not use that exact label. [Artist](https://charliehooperwilliams.com/about/), [Play & See](https://charliehooperwilliams.com/installations/play-and-see/) |
| Serene — Rachmaninoff 2nd + Brainwaves | The artist describes a July 2023 performance using EEG and an AI model to render curated reactive shaders on multiple screens. | Treat additional sensors as modulation inputs; separate physiological data from musical interpretation. This project does not implement EEG. [Artist's account](https://serenepianist.com/updates/2023-rach2-eeg) |
| Echoes of Eternity — Min-Jung Kym, Pablo Esquivel, DECOL / EOSA | The studio describes EEG plus audio/data flows in TouchDesigner, with a Steinway Spirio\|r piano. | Separate feature extraction from visual mapping and keep a dedicated projection output. This project does not claim Spirio proprietary integration; it accepts standard MIDI exposed by a device/interface. [DECOL project](https://decol.tv/works/echoesofeternity) |

## Implementation boundaries / 实现边界

MIDI note, velocity and CC64 sustain values are direct device data. Key, chord and cadence labels are **heuristics**, not score following or a musicological verdict. Key estimates use a rolling pitch-class profile; tension combines tonal distance and interval dissonance. Audio chroma comes from local spectral peaks; acoustic-piano polyphony and pedal wash are estimates and cannot identify every sounding note or distinguish room reverb from sustain reliably.

MIDI 音符、力度和踏板来自设备。调性、和弦、终止式均为启发式估计；音频通道不是精确钢琴转录。完整和弦、低音、强混响和快速变调会增加误差。系统不采集 EEG，也不复制参考项目的作品素材。

The MIDI latency target is under 30 ms from browser event receipt to render submission. USB/device latency, display scanout and projector processing are outside that measurement. Audio analysis uses an 8192-sample FFT and updates about 30 times per second, so the audio path has a longer analysis window. A browser/device lacking Web MIDI can still use file playback and audio input.

Zero-AI uses a fixed 120 Hz musical simulation, seeded procedural geometry and a fixed particle ceiling. It disables this page's model/Blender requests and model-derived section plans. MIDI + seed + settings + section sequence reproduce the parameter trajectory. Live audio, human controls, GPU precision and viewport differences can change the resulting pixels; pixel-identical cross-device playback is not claimed.

[W3C Web MIDI specification](https://www.w3.org/TR/webmidi/) defines secure-context access and event timestamps. No System Exclusive access or MIDI output is requested.

## Public-domain MIDI excerpts / 公有领域示范

Both excerpts are the first 30 seconds of computer-generated MIDI from Mutopia editions by **Keith OHara**, whose LilyPond headers explicitly state **Public Domain**. The source compositions and the editions below are public-domain material according to the publisher. We retain channel events, flatten the tempo map to equivalent absolute timing and add all-notes-off at the end. No artist performance audio is used. These files are not covered by a new claim of exclusive ownership under the project's MIT license.

- **Claude Debussy — Clair de lune**, Suite bergamasque, L.75. Edition source: E. Fromont (1905). [Publisher files](https://www.mutopiaproject.org/ftp/DebussyC/L75/debussy_Ste_Bergamesq_Clair/), [edition/source declaration](https://www.mutopiaproject.org/ftp/DebussyC/L75/debussy_Ste_Bergamesq_Clair/debussy_Ste_Bergamesq_Clair.ly). Included as `web/demos/clair.mid`.
- **Claude Debussy — Arabesque No. 1**, L.66. Edition source: Durand et Fils (1904). [Publisher files](https://www.mutopiaproject.org/ftp/DebussyC/L66/debussy_Arabesque_1/), [edition/source declaration](https://www.mutopiaproject.org/ftp/DebussyC/L66/debussy_Arabesque_1/debussy_Arabesque_1.ly). Included as `web/demos/arabesque.mid`.

Liszt section presets are included as local visual interpretations, but no Liszt MIDI is bundled: the inspected Mutopia Consolations editions use CC BY 3.0, whereas this demo selection intentionally uses editions marked public domain. The demo GIF is recorded from this project's own piano renderer.

## Impressionist film reference

User-described [wind and memory film](https://x.com/0xSijijiu/status/2008130700520952253): pastel Monet-inspired animation and a cinematic cello/piano score. Direct retrieval returned HTTP 403; this implementation follows the supplied description. All dabs, cloud volumes, synthesis and reverb are generated by code; no film frames, generated songs or external textures were copied.

## GPU plugins and connectome

The user supplied a [Higgsfield demonstration reference](https://x.com/higgsfield_ai/status/2098634561517482314) describing prompt-to-editable GPU effects. Direct access was blocked; the implementation follows the supplied brief and copies no demo assets. Eight included fragment-shader studies are original code. GLSL runs in an OffscreenCanvas worker, with bounded manifests, loop-free shaders and no optional JavaScript init. Three smoke frames and subsequent completed draw time must stay below 6 ms; resolution falls before rejection. The measurement includes CPU submission and GPU completion, so it is conservative under recording load. Tier 1 remains active if a plugin stops.

Connectome data comes from **MaleCNS v1.0**, provided by the FlyEM Project Team at HHMI Janelia Research Campus and collaborators. The [official dataset download page](https://male-cns.janelia.org/download/) states CC-BY; see the [dataset home](https://male-cns.janelia.org/). The redistributed derivative contains 317 neurons (LC4/LPLC2 and six descending neurons), 20,937 directed connections, and 87,353 recorded synapses; 318 edges target GF. IDs, types and weights are retained from the local neuPrint export. Source-file SHA-256 hashes are embedded in `connectome_data.mjs`. No soma coordinates occur in the available neuron table. Positions therefore use a spring embedding with seed 317 and side labels, explicitly **not anatomical coordinates**. Curves, camera motion and activity are audiovisual interpretations, not measured neural activity. The dataset derivative retains CC-BY attribution; the repository MIT licence applies to original software.

Web rendering references: [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas), [WebGL finish](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/finish).

## Piano repertoire sources

- [MAESTRO v3, Google Magenta](https://magenta.tensorflow.org/datasets/maestro): CC BY-NC-SA 4.0, 1,276 performances. MIDI-only archive is 56 MiB; SHA-256 `70470ee253295c8d2c71e6d9d4a815189e35c89624b76d22fce5a019d5dde12c` was verified. Credit Google LLC, the International Piano-e-Competition and Hawthorne et al., *Enabling Factorized Piano Music Modeling and Generation with the MAESTRO Dataset*, ICLR 2019. These files and their derived fingerprints remain local and are excluded from the public catalogue and repository.
- [Mutopia](https://www.mutopiaproject.org/legal.html): 788 piano-related catalogue entries fetched from their paginated index with a 1.1-second request interval and cache. Licences are recorded per item. The public subset contains 30 MIDI files explicitly marked Public Domain, with source and edition links in the manifest. Other CC entries are catalogue links, not bundled files.
- [OpenScore Lieder](https://github.com/OpenScore/Lieder) and its [CC0 licence](https://github.com/OpenScore/Lieder/blob/main/LICENSE.txt): 1,356 voice-and-piano score entries, with three small compressed MusicXML examples included. Credit OpenScore Lieder, Mark Gotham and Peter Jonas. These are songs with piano, not solo-piano performances. Score-only entries link to MusicXML and do not pretend to contain MIDI.
- [KernScores Beethoven sonatas](https://github.com/craigsapp/beethoven-piano-sonatas): 103 movement entries indexed from the maintainer's repository. Craig Stuart Sapp's encoding/edition credits are in the files. Three example encodings are cached locally; no explicit redistribution grant was found in the inspected repository or files, so the public build contains links only. Humdrum conversion can be done with music21/humlib after checking the relevant file's rights.
- [Classical Piano MIDI Page](http://piano-midi.de/): 331 local MIDI files by Bernd Krueger, verified against the author’s [CC BY-SA 3.0 DE licence](http://piano-midi.de/copy.htm).
- [IMSLP](https://imslp.org/): 12 individually verified public-domain piano editions, official download-flow links only; see [REPERTOIRE.md](REPERTOIRE.md).

The local catalogue has 3,866 entries and 2,349 analysed MIDI files; the public catalogue has 2,590 entries and 30 playable bundled MIDIs. Three CC0 MusicXML files bring the curated subset to 455,596 bytes. Entries distinguish downloaded MIDI from linked scores. This is an extensible catalogue, not a claim to contain every piano score.

Fingerprints use velocity-weighted note-on chroma for estimated key, 64 time bins for a heuristic harmonic-tension curve, note-on density and MIDI velocity range. Mean tempo is the time-weighted **encoded MIDI tempo**, which need not equal perceived performance tempo. No learned model is involved. These estimates seed palette/scene briefs; live note features continue to drive the picture. All 2,349 local MIDI files parsed successfully.

## Narrative piano stage / 叙事钢琴舞台

Reference: Maki Namekawa, Philip Glass *Mishima*, piano arrangement by Michael Riesman, with realtime visuals by Cori O’Lan. The performer’s [2021 Home Delivery concert archive](https://www.makinamekawa.com/ars-electronica-home-delivery-live-stream-concerts-2021/) confirms the March 12, 2021 concert and credits. The user supplied [YouTube W92BMdscr_o](https://www.youtube.com/watch?v=W92BMdscr_o) and the video credit Yazdan Zand; direct automated video access was unavailable, so that video credit is retained as user-supplied, not independently verified. Related primary context: [Ars Electronica Pianographique 2021](https://ars.electronica.art/newdigitaldeal/en/pianographique/).

Our Narrative renderer uses 12 original procedural cuboids per figure, a pale void, restrained ground shadows, three floating text fragments and fine connectors. No Sketchfab models, concert imagery, music recording or artist assets are downloaded or copied. Names and movement titles are catalogue metadata, not a reproduction of the musical score or libretto.

Dynamics control crowd count/scale; harmony tension controls text drift and line agitation; onsets select one stepping/turning figure; register positions text; pedal leaves afterimages. Without energy, motion stops. Cadence or falling phrase arcs advance the text, with an eight-second debounce; Standard MIDI File marker events can explicitly name a section. The seven Mishima labels are the user-requested sequence, not a claim that all seven were played in the linked concert.

The optional webcam shows a desaturated, letterboxed performer above the visual stage. It requests video only after an explicit command, stays in the browser, and is excluded from projector composition. Camera access can be stopped without changing the music. The renderer itself needs no AI: the same seed and musical-feature sequence reproduce its geometry/motion. Tests cover seeded pixels, silence, MIDI markers and mocked camera on/off; actual webcam hardware was not accessed during testing.

### Cached worlds

World Labs Marble provides offline text-to-world generation; Spark (MIT, World Labs Technologies) renders the cached Gaussian splats through Three.js (MIT). Environments use original piece-inspired descriptions, with no performer images, commercial recordings or copied scene assets as inputs. Generated scene assets retain the applicable World Labs terms rather than being represented as third-party MIT software. See [World API](https://docs.worldlabs.ai/api), [Spark](https://sparkjs.dev/docs/) and [World implementation](WORLDS.md).
