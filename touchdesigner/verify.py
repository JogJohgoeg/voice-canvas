"""Run in TD Textport with exec(open(project.folder+'/verify.py').read()).
Measures the current input for ten seconds; saves feature statistics, not audio.
"""
c=op('/project1')
if c.op('verify'): c.op('verify').destroy()
n=c.create('executeDAT','verify')
n.text='''import json,time
from pathlib import Path
samples=[]
start=time.perf_counter()
def onFrameEnd(frame):
 now=time.perf_counter()
 samples.append([now-start]+[float(ch[0]) for ch in op('features').chans()])
 if len(samples)==120: op('out1').save(str(Path(project.folder)/'preview.png'))
 if now-start>10:
  result={'input':parent().par.Source.eval(),'frames':len(samples),'fps':len(samples)/(now-start),'ranges':[[min(s[i] for s in samples),max(s[i] for s in samples)] for i in range(1,5)],'errors':{n.name:n.errors() for n in parent().children if n.errors()}}
  Path(project.folder,'verification-'+parent().par.Source.eval()+'.json').write_text(json.dumps(result,indent=2))
  me.par.active=False
  assert not result['errors'], result['errors']
  if parent().par.Source == 'file' and str(parent().par.Recording.eval()).endswith('test_signal.wav'):
   assert result['ranges'][0][1] > .5, 'Test recording is not driving the feature chain'
   assert result['ranges'][0][1]-result['ranges'][0][0] > .4, 'Dynamics are not changing'
'''
n.par.frameend=True
