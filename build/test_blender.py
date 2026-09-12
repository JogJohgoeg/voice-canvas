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

from blender_worker import BlenderWorker
jobs=[];worker=object.__new__(BlenderWorker);worker.request=jobs.append;worker.prewarm()
assert len(jobs)==8
assert {specification(job)['family'] for job in jobs if job.get('style')=='fusion'}==set(range(5))
assert len({tuple(specification(job)['palette']) for job in jobs if job.get('style')=='fusion'})==2
print('Prewarm covers all five Fusion families and both accents in eight bounded jobs')
import tempfile,json,queue,threading
from unittest.mock import patch
with tempfile.TemporaryDirectory() as folder:
    cache=Path(folder);item=cache/'example';item.mkdir()
    warm=specification({'style':'fusion','variation':{'seed':317}})
    manifest={'status':'ready','spec':warm,'url':'/example.webm'}
    (item/'manifest.json').write_text(json.dumps(manifest))
    worker=object.__new__(BlenderWorker);worker.available=True;worker.jobs=queue.Queue(8);worker.pending=set();worker.lock=threading.Lock()
    with patch('blender_worker.CACHE',cache):
        assert worker.request({'style':'fusion','variation':{'seed':318}})['status']=='queued'
        assert worker.request({'style':'fusion','variation':{'seed':319}})['approximate'] is True
print('Cached Fusion fallback keeps the requested accent and accepts another matching seed')
assert specification({'style':'fusion','piano':True,'workStyle':{'palette':['#123456','#654321']}})['palette']==['#123456','#657075']
print('Piano section palette is retained by optional Fusion renders')

monet=specification({'style':'monet'});assert monet['style']=='monet'
assert key_for(monet)!=key_for(specification({'style':'fusion'}))
assert key_for(specification({'style':'fusion','monet':True}))!=key_for(specification({'style':'fusion'}))
print('Monet and Fusion light have distinct cache identities')
