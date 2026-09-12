import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'server'))
from director_score import validate
p=dict(description='test',tempo=60,beats=16,style='fusion',family=1,palette=['#112233','#aabbcc'],intensity=.5,seed=317,notes=[[0,60,1,70]])
assert validate(p)['notes']==p['notes']
for patch in [{'tempo':float('nan')},{'notes':[[15,60,2,70]]},{'notes':[[0,200,1,70]]},{'palette':['javascript:bad','#aabbcc']},{'intensity':2}]:
 try:validate({**p,**patch})
 except ValueError:pass
 else:raise AssertionError(patch)
print('Joint score schema bounds, finite numbers, note duration and palette validation passed')
