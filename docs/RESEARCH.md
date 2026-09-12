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
