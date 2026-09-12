# Voice Canvas — TouchDesigner 原生声画

**麦克风或录音 → 实时音频分析 → 黑白空间线阵。**



打开 `VoiceCanvas.toe`（TouchDesigner 2025.33230 构建）。选中 `/project1`，参数面板的 **Audio Visual** 页：

- **Input / 输入**：Microphone 使用麦克风；Recording 使用音频文件。
- **Audio file / 录音文件**：选择自己的 WAV/MP3 等 TD 支持的录音。
- **Sensitivity / 灵敏度**：根据音量调整；**Intensity** 调整画面强度。
- **Play recording / 播放原音**：可选播放录音本身，默认关闭。麦克风永不监听输出。

按 **F1** 进入演出画面，**Esc** 返回编辑。麦克风设备可在 `microphone` CHOP 的 Device 参数选择；首次使用需允许 macOS 麦克风权限。

首次打开默认使用麦克风。切换 Recording 可使用附带的 `test_signal.wav`，这是代码生成的八秒测试信号（静音、低频、高频、中频），不是音乐作品或录音素材。换成自己的录音即可演出。

## 当前画面 / Phase Field

原创黑白相位线阵。当前声音推动整个平面的压缩、展开与剪切；约四秒的声音特征历史保留尾音和句子起伏。音量使用当前音频块与 12 ms 起音、90 ms 释放平滑，空间运动另外使用阻尼平滑。

参考 Ryoji Ikeda [Matrix](https://www.ryojiikeda.com/project/matrix/) 的空间和频率关系。原作是声音装置系列，本项目不是其复制品；没有使用原作音轨、影像，也不增加合成声音或频闪。

1280×720，目标60 fps。FFT1024样本约23 ms（44.1kHz），设备与显示另有延迟，未测量端到端延迟。

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
