# Voice Canvas — TouchDesigner 原生声画

**麦克风或录音 → 实时音频分析 → 水墨山水。**



打开 `VoiceCanvas.toe`（TouchDesigner 2025.33230 构建）。选中 `/project1`，参数面板的 **Audio Visual** 页：

- **Input / 输入**：Microphone 使用麦克风；Recording 使用音频文件。
- **Audio file / 录音文件**：选择自己的 WAV/MP3 等 TD 支持的录音。
- **Sensitivity / 灵敏度**：根据音量调整；**Intensity** 调整画面强度。
- **Play recording / 播放原音**：可选播放录音本身，默认关闭。麦克风永不监听输出。

按 **F1** 进入演出画面，**Esc** 返回编辑。麦克风设备可在 `microphone` CHOP 的 Device 参数选择；首次使用需允许 macOS 麦克风权限。

首次打开默认使用麦克风。切换 Recording 可使用附带的 `test_signal.wav`，这是代码生成的八秒测试信号（静音、低频、高频、中频），不是音乐作品或录音素材。换成自己的录音即可演出。

## 当前画面 / Ink Landscape

宣纸底色、五层远近山峦、淡月、雾气与水面。声音推动山脊起伏、层间错位和湿边扩散；历史声音使各层延迟呼应。纸纹与皴染纹理固定在空间中，不逐帧随机闪烁。

所有形态、纸纹、墨色和水波均由原创实时 GLSL 生成，没有图片素材。Esc 退出全屏，F1 返回演出。麦克风监听关闭。

`microphone` / `recording` → `audio` → `update` → `features` / `memory` → `visual` → `out1`。

## 修改与重建

`.toe` 内已嵌入 Python 和 GLSL，可直接改节点。磁盘源码修改后，在 TD Textport 中执行：

```python
VOICE_TD_DIR = project.folder
exec(compile(open(VOICE_TD_DIR + '/build.py').read(), VOICE_TD_DIR + '/build.py', 'exec'))
```

这会重建 `/project1`，请先另存自己的修改。源码仅依赖 TD 内置的 NumPy。

Open `VoiceCanvas.toe`, choose **Microphone** or **Recording** in `/project1` → **Audio Visual**, then F1 for performance. Recording monitoring is optional; microphone monitoring is always disabled. No server or AI service is used. The legacy browser show remains available separately.

## Motion references

- [Memo Akten — Simple Harmonic Motion](https://memo.tv/projects/2019/shm/): sound and image share structured, evolving movement.
- [TouchDesigner fluid component, citing Bruno Imbrizi](https://derivative.ca/community-post/asset/fluid-simulation-component/65741): source force, vorticity and persistence are useful references for continuous deformation.

Our implementation uses an original analytic folded-surface shader, not the referenced fluid solver or copied assets. Live sound immediately deforms the whole surface; the recent feature history preserves the phrase. Geometry moves strongly while material brightness remains comparatively stable.
