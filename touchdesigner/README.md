# Voice Canvas — TouchDesigner 原生声画

**麦克风或录音 → 实时音频分析 → 人物衣料与呼吸形变。**



打开 `VoiceCanvas.toe`（TouchDesigner 2025.33230 构建）。选中 `/project1`，参数面板的 **Audio Visual** 页：

- **Input / 输入**：Microphone 使用麦克风；Recording 使用音频文件。
- **Audio file / 录音文件**：选择自己的 WAV/MP3 等 TD 支持的录音。
- **Sensitivity / 灵敏度**：根据音量调整；**Intensity** 调整画面强度。
- **Play recording / 播放原音**：可选播放录音本身，默认关闭。麦克风永不监听输出。

按 **F1** 进入演出画面，**Esc** 返回编辑。麦克风设备可在 `microphone` CHOP 的 Device 参数选择；首次使用需允许 macOS 麦克风权限。

首次打开默认使用麦克风。切换 Recording 可使用附带的 `test_signal.wav`，这是代码生成的八秒测试信号（静音、低频、高频、中频），不是音乐作品或录音素材。换成自己的录音即可演出。

## 当前画面 / Portrait

`assets/performer-side.png`（默认侧面）和 `assets/performer.png`（正面）是一次性生成的虚构成年人物底图，衣着完整。可在 portrait 节点 File 参数切换这两个视角；它们是独立底图，不支持三维自由旋转。GLSL 在衣料区域做有界二维形变：声音包络驱动呼吸起伏，实时音量驱动细小衣料运动，脸部保持稳定。这不是三维人体或真实布料模拟；运行中无需图像模型或服务器。请将 assets 文件夹与工程一起保留。

实测麦克风输入约 55 fps，未测量端到端音频延迟。Esc 退出全屏，F1 返回；麦克风监听关闭。

## 修改与重建

`.toe` 内已嵌入 Python 和 GLSL，可直接改节点。磁盘源码修改后，在 TD Textport 中执行：

```python
VOICE_TD_DIR = project.folder
exec(compile(open(VOICE_TD_DIR + '/build.py').read(), VOICE_TD_DIR + '/build.py', 'exec'))
```

这会重建 `/project1`，请先另存自己的修改。源码仅依赖 TD 内置的 NumPy。

Open `VoiceCanvas.toe`, choose **Microphone** or **Recording** in `/project1` → **Audio Visual**, then F1 for performance. Recording monitoring is optional; microphone monitoring is always disabled. No server or AI service is used. The legacy browser show remains available separately.
