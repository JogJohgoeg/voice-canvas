# One fast envelope + a rolling spectral window; history contains features, not audio.
import time
import numpy as np
history=np.zeros(1024,dtype=np.float32)
window=np.hanning(1024)
smoothed=np.zeros(4)
trace=np.zeros((1,256,4),dtype=np.float32)
previous=0.
last_source=None
last_time=time.perf_counter()
clock=0.
carry=0.
motion=0.
velocity=0.

def onFrameStart(frame):
 global history, smoothed, previous, last_source, last_time, clock, carry, motion, velocity
 now=time.perf_counter(); dt=min(.1,max(.001,now-last_time)); last_time=now
 c=parent(); source=c.par.Source.eval()
 if source != last_source:
  history[:]=0; trace[:]=0; smoothed[:]=0; previous=0.; carry=0.; last_source=source
 data=op('audio').numpyArray()
 mono=data.mean(axis=0)[-1024:] if data.size else np.zeros(1)
 history=np.roll(history,-len(mono)); history[-len(mono):]=mono
 # Envelope uses the current audio slice, not the slower FFT window.
 rms=float(np.sqrt(np.mean(mono*mono)))
 level=min(1.,max(0.,rms-.0005)*c.par.Sensitivity.eval())
 mag=np.abs(np.fft.rfft(history*window))
 freq=np.fft.rfftfreq(1024,1./op('audio').rate)
 total=float(mag.sum())+1e-9
 bass=float(mag[freq<300].sum()/total)
 bright=float(np.clip(np.sum(mag*freq)/total/4000.,0,1))
 onset=min(1.,max(0.,level-previous)*6.)
 previous+=(level-previous)*(1-np.exp(-dt/.07))
 target=np.array([level,bass*level,bright if level>.012 else 0,onset])
 decay=np.array([.012 if level>smoothed[0] else .09,.045,.12,.045])
 smoothed+=(target-smoothed)*(1-np.exp(-dt/decay))
 carry+=dt
 while carry>=1/60:
  trace[0,:-1]=trace[0,1:]; trace[0,-1]=smoothed; carry-=1/60
 # Integrate motion speed: silence settles instead of continuing autonomous swirls.
 # Critically damped architectural motion preserves momentum through phrase endings.
 remaining=dt
 while remaining>0:
  step=min(remaining,1/120); remaining-=step
  velocity+=(81.*(smoothed[0]-motion)-18.*velocity)*step
  motion+=velocity*step
 clock+=dt*(.035+motion*1.5)
 op('visual').par.vec1valuew=motion
 n=op('features')
 for i,v in enumerate(smoothed): n.par['value'+str(i)]=float(v)
 op('visual').par.vec1valuex=clock
 op('memory').cook(force=True)
 op('out1').cook(force=True)
