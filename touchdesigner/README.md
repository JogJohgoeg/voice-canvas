# Voice Canvas — TouchDesigner 原生声画

**麦克风或录音 → 实时音频分析 → GPU 画面。** 无需浏览器、本地服务或模型。

打开 `VoiceCanvas.toe`（TouchDesigner 2025.33230 构建）。选中 `/project1`，参数面板的 **Audio Visual** 页：

- **Input / 输入**：Microphone 使用麦克风；Recording 使用音频文件。
- **Audio file / 录音文件**：选择自己的 WAV/MP3 等 TD 支持的录音。
- **Sensitivity / 灵敏度**：根据音量调整；**Intensity** 调整画面强度。
- **Play recording / 播放原音**：可选播放录音本身，默认关闭。麦克风永不监听输出。

按 **F1** 进入演出画面，**Esc** 返回编辑。麦克风设备可在 `microphone` CHOP 的 Device 参数选择；首次使用需允许 macOS 麦克风权限。

首次打开默认使用麦克风。切换 Recording 可使用附带的 `test_signal.wav`，这是代码生成的八秒测试信号（静音、低频、高频、中频），不是音乐作品或录音素材。换成自己的录音即可演出。

## 网络 / Native network

`microphone` / `recording` → `audio` Switch CHOP → `update` Execute DAT → `features` CHOP / `memory` Script TOP（声音特征历史） → `visual` GLSL TOP → `out1`。

连续丝带记录约 4 秒的声音过程，新声音从右侧进入、历史向左流动。音量和低频改变波面高度、展开程度和弯曲；音色缓慢影响材质。没有闪烁点或爆闪。音量分析使用当前音频块，12 ms 起音平滑、90 ms 释放；频谱使用 1024 样本滚动 FFT。安静时运动减缓。

1280×720、目标 60 fps。FFT 窗口约 23 ms（44.1 kHz）；设备缓冲和显示会额外增加延迟，未宣称端到端低于 30 ms。

## 修改与重建

`.toe` 内已嵌入 Python 和 GLSL，可直接改节点。磁盘源码修改后，在 TD Textport 中执行：

```python
VOICE_TD_DIR = project.folder
exec(compile(open(VOICE_TD_DIR + '/build.py').read(), VOICE_TD_DIR + '/build.py', 'exec'))
```

这会重建 `/project1`，请先另存自己的修改。源码仅依赖 TD 内置的 NumPy。

Open `VoiceCanvas.toe`, choose **Microphone** or **Recording** in `/project1` → **Audio Visual**, then F1 for performance. Recording monitoring is optional; microphone monitoring is always disabled. No server or AI service is used. The legacy browser show remains available separately.
