# Embedded Execute DAT. Both sources use the same bounded, rolling FFT.
import numpy as np
history=np.zeros(2048,dtype=np.float32)
window=np.hanning(2048)
smoothed=np.zeros(4)
previous=0.
last_source=None

def onFrameStart(frame):
 global history, smoothed, previous, last_source
 c=parent(); source=c.par.Source.eval()
 if source != last_source:
  history[:]=0; smoothed[:]=0; previous=0.; last_source=source
 data=op('audio').numpyArray()
 if data.size:
  mono=data.mean(axis=0)[-2048:]
  history=np.roll(history,-len(mono)); history[-len(mono):]=mono
 else:
  history[:]=0
 gain=c.par.Sensitivity.eval()
 rms=float(np.sqrt(np.mean(history*history)))
 mag=np.abs(np.fft.rfft(history*window))
 freq=np.fft.rfftfreq(2048,1./op('audio').rate)
 total=float(mag.sum())+1e-9
 bass=float(mag[freq<250].sum()/total)
 bright=float(np.clip(np.sum(mag*freq)/total/5000.,0,1))
 level=min(1.,rms*gain)
 onset=min(1.,max(0.,level-previous)*8.)
 previous=previous*.85+level*.15
 dt=min(.1,1./max(1.,project.cookRate))
 target=np.array([level,bass*level,bright if level>.005 else 0,onset])
 decay=np.where(target>smoothed,.045,.4)
 smoothed+=(target-smoothed)*(1-np.exp(-dt/decay))
 n=op('features')
 for i,v in enumerate(smoothed): n.par['value'+str(i)]=float(v)
 op('out1').cook(force=True)
 return
