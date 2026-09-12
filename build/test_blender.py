import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'server'))
"""Offline cache-key/input tests; no renders started."""
from blender_worker import specification, key_for
s=specification({});assert key_for(s)==key_for(specification({}))
assert key_for(s)!=key_for(specification({'variation':{'seed':318}}))
assert key_for(s)==key_for(specification({'audioMood':{'level':.8}}))
assert specification({'workStyle':{'palette':['../../secret','red']}})['palette']==s['palette']
assert specification({'workStyle':{'family':999},'audioMood':{'level':3}})['family']==7
assert specification({'audioMood':{'level':3}})['mood']['level']==1
print('Blender key stability, seed variation, mood summary and input bounds passed')

assert specification({'objects':[{'kind':'fire','tint':'#ff0000'}]})['family']==0
assert specification({'objects':[{'kind':'fire','tint':'#ff0000'}]})['palette']==['#ff0000','#ff0000']
