# Voice Canvas — TouchDesigner 原生声画

**麦克风或录音 → 实时音频分析 → 液态金属。**



打开 `VoiceCanvas.toe`（TouchDesigner 2025.33230 构建）。选中 `/project1`，参数面板的 **Audio Visual** 页：

- **Input / 输入**：Microphone 使用麦克风；Recording 使用音频文件。
- **Audio file / 录音文件**：选择自己的 WAV/MP3 等 TD 支持的录音。
- **Sensitivity / 灵敏度**：根据音量调整；**Intensity** 调整画面强度。
- **Play recording / 播放原音**：可选播放录音本身，默认关闭。麦克风永不监听输出。

按 **F1** 进入演出画面，**Esc** 返回编辑。麦克风设备可在 `microphone` CHOP 的 Device 参数选择；首次使用需允许 macOS 麦克风权限。

首次打开默认使用麦克风。切换 Recording 可使用附带的 `test_signal.wav`，这是代码生成的八秒测试信号（静音、低频、高频、中频），不是音乐作品或录音素材。换成自己的录音即可演出。

## 当前画面 / Liquid Metal

舞台层次：明亮主雕塑、左右较暗的后景金属形体、五层远景轮廓、薄雾、压缩地面反射与前景边线。主雕塑跟随当前声音，后景分别跟随约0.85秒和1.7秒前的声音特征，形成错位呼应。银色镜面雕塑连续隆起、扭转与流动。麦克风的快速音量包络与阻尼运动共同控制表面褶皱和轮廓扩张；反射来自原创程序化摄影棚光带，没有图片素材或闪烁粒子。

这是实时着色器表面形变，不是离线视频或物理流体模拟。Esc 退出全屏，F1 返回演出；麦克风监听关闭。

`microphone` / `recording` → `audio` → `update` → `features` → `visual` → `out1`。原有特征历史保留在 `memory` 节点。

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
