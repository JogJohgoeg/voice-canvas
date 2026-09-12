"""Run inside TouchDesigner Textport: exec(open('.../build.py').read())."""
from pathlib import Path
import traceback
BASE=Path(__file__).resolve().parent if '__file__' in globals() else Path('/tmp')
# Caller supplies VOICE_TD_DIR when executing in the Textport.
BASE=Path(globals().get('VOICE_TD_DIR',BASE))
try:
 c=op('/project1')
 while c.children: c.children[0].destroy()
 c.destroyCustomPars()
 page=c.appendCustomPage('Audio Visual')
 p=page.appendMenu('Source',label='Input / 输入')[0]; p.menuNames=['mic','file']; p.menuLabels=['Microphone / 麦克风','Recording / 录音']; p.val='mic'
 p=page.appendFile('Recording',label='Audio file / 录音文件')[0]; p.val='test_signal.wav'
 p=page.appendFloat('Sensitivity',label='Sensitivity / 灵敏度')[0]; p.val=18; p.min=.1; p.max=30; p.clampMin=True
 p=page.appendFloat('Intensity',label='Intensity / 画面强度')[0]; p.val=1.3; p.min=.1; p.max=3; p.clampMin=True
 page.appendToggle('Listen',label='Play recording / 播放原音')[0].val=False
 mic=c.create('audiodeviceinCHOP','microphone'); mic.par.active.expr="parent().par.Source == 'mic'"; mic.par.bufferlength=.03
 f=c.create('audiofileinCHOP','recording'); f.par.file.expr='parent().par.Recording'; f.par.play.expr="parent().par.Source == 'file'"; f.par.repeat='on'
 s=c.create('switchCHOP','audio'); s.inputConnectors[0].connect(mic); s.inputConnectors[1].connect(f); s.par.index.expr="int(parent().par.Source == 'file')"
 out=c.create('audiodeviceoutCHOP','recording_monitor'); out.inputConnectors[0].connect(f); out.par.active.expr="parent().par.Listen and parent().par.Source == 'file'"
 features=c.create('constantCHOP','features')
 features.par.const=4
 for i,name in enumerate(['rms','bass','brightness','onset']): features.par['name'+str(i)]=name; features.par['value'+str(i)]=0
 shader=c.create('textDAT','flow'); shader.text=(BASE/'flow.frag').read_text()
 g=c.create('glslTOP','visual'); g.par.pixeldat=shader; g.par.outputresolution='custom'; g.par.resolutionw=1280; g.par.resolutionh=720
 g.par.vec=2; g.par.vec0name='uAudio'; g.par.vec1name='uScene'
 for i,axis in enumerate('xyzw'): g.par['vec0value'+axis].expr="op('features')[%d][0]"%i
 g.par.vec1valuex.expr='absTime.seconds'; g.par.vec1valuey.expr='parent().par.Intensity'; g.par.vec1valuez=1280/720; g.par.vec1valuew=0
 for suffix in ['_pixel','_compute']:
  unused=c.op('visual'+suffix)
  if unused: unused.destroy()
 output=c.create('nullTOP','out1'); output.inputConnectors[0].connect(g); output.viewer=True; output.display=True
 e=c.create('executeDAT','update'); e.text=(BASE/'audio_features.py').read_text(); e.par.framestart=True
 c.par.top='out1'; c.par.w=1280; c.par.h=720
 for i,n in enumerate(c.children): n.nodeX=(i%5)*220; n.nodeY=-(i//5)*160
 w=op('/perform')
 w.par.winop=output; w.par.size='fill'; w.par.borders=False
 w.par.includedialog=False; w.par.alwaysontop=True
 project.cookRate=60
 target=BASE/'VoiceCanvas.toe'
 if target.exists(): target.replace(BASE/'VoiceCanvas.previous.toe')
 project.save(str(target))
 (BASE/'build-result.txt').write_text('Saved native project\n')
except Exception:
 (BASE/'build-result.txt').write_text(traceback.format_exc())
