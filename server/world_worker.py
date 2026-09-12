#!/usr/bin/env python3
"""Offline Marble preparation. One paid submission, resumable polling, env-only credential."""
import argparse,fcntl,json,os,re,time,urllib.request,urllib.error
from pathlib import Path
BASE='https://api.worldlabs.ai/marble/v1'
LIMITS={'draft':12,'full':4}
MODELS={'draft':'marble-1.0-draft','full':'marble-1.1'}
COST={'draft':230,'full':1580}
def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2));temp.replace(path)
def api(path,data=None):
    key=os.environ.get('WORLDLABS_API_KEY')
    if not key:raise RuntimeError('WORLDLABS_API_KEY is not set')
    request=urllib.request.Request(BASE+path,data=json.dumps(data).encode() if data else None,headers={'WLT-Api-Key':key,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(request,timeout=45) as response:return json.load(response)
    except urllib.error.HTTPError as e:raise RuntimeError('World API HTTP '+str(e.code)) from None

def prepare(root,piece,movement,brief,quality='draft',seed=317):
    for value in [piece,movement]:
        if not re.fullmatch('[a-z0-9][a-z0-9_-]{0,79}',value):raise ValueError('Use lowercase piece/movement identifiers')
    root.mkdir(parents=True,exist_ok=True)
    # A process lock covers reservations, submission and polling: no duplicate paid retries.
    with (root/'.lock').open('w') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        folder=root/piece/movement/quality;manifest=folder/'manifest.json'
        m=json.loads(manifest.read_text()) if manifest.exists() else {}
        if m.get('status')=='ready':return m
        ledger_path=root/'budget.json';ledger=json.loads(ledger_path.read_text()) if ledger_path.exists() else []
        if not m:
            if sum(x['quality']==quality for x in ledger)>=LIMITS[quality]:raise RuntimeError('Authorized world limit reached; ask before increasing it')
            before=api('/credits')['remaining_credits']
            if before<COST[quality]:raise RuntimeError('Insufficient World API credits; no generation submitted')
            m={'piece':piece,'movement':movement,'quality':quality,'seed':seed,'brief':brief,'status':'reserved','credits_before':before,'estimated_credits':COST[quality],'started':time.time()}
            ledger.append({'piece':piece,'movement':movement,'quality':quality,'reserved_at':m['started']});write(ledger_path,ledger);write(manifest,m)
            prompt='A coherent fixed navigable environment for a piano performance, no text or logos. '+brief+'. Quiet cinematic space with clear room for a camera near the origin. The environment stays still; music will move only the camera.'
            operation=api('/worlds:generate',{'display_name':(piece+' '+movement)[:64],'model':MODELS[quality],'seed':seed,'permission':{'public':False},'world_prompt':{'type':'text','text_prompt':prompt}})
            m.update(operation_id=operation['operation_id'],status='generating');write(manifest,m)
        if not m.get('operation_id'):raise RuntimeError('Uncertain submission: reservation retained; inspect account before retrying')
        deadline=time.monotonic()+900
        while time.monotonic()<deadline:
            operation=api('/operations/'+m['operation_id'])
            if operation.get('done'):break
            print(json.dumps({'piece':piece,'movement':movement,'status':'generating','elapsed_s':round(time.time()-m['started'])}),flush=True);time.sleep(5)
        else:raise RuntimeError('Polling deadline; rerun to resume without a new purchase')
        if operation.get('error'):
            m.update(status='failed',error='Provider generation failed');write(manifest,m);raise RuntimeError(m['error'])
        world=operation['response'];world=world.get('world',world)
        world_id=world.get('id') or world.get('world_id')
        world=api('/worlds/'+world_id).get('world',world)
        assets=world['assets'];splats=assets['splats'];urls=splats['spz_urls']
        downloads={'world.spz':urls.get('500k') or urls.get('100k') or urls['full_res'],'preview.spz':urls.get('100k'),'collider.glb':assets.get('mesh',{}).get('collider_mesh_url'),'thumbnail.jpg':assets.get('thumbnail_url')}
        for name,url in downloads.items():
            if not url:continue
            target=folder/name
            if target.exists():continue
            if not url.startswith('https://'):raise RuntimeError('Invalid asset URL')
            with urllib.request.urlopen(url,timeout=120) as response,target.with_suffix('.part').open('wb') as dest:
                total=0
                while True:
                    chunk=response.read(1024*1024)
                    if not chunk:break
                    total+=len(chunk)
                    if total>1024**3:raise RuntimeError('Asset exceeds 1 GB limit')
                    dest.write(chunk)
            target.with_suffix('.part').replace(target)
        after=api('/credits')['remaining_credits']
        m.update(status='ready',world_id=world_id,semantics=splats.get('semantics_metadata',{}),credits_after=after,credits_used=m['credits_before']-after,render_seconds=round(time.time()-m['started'],2),splat='world.spz',preview='preview.spz',mesh='collider.glb',thumbnail='thumbnail.jpg')
        write(manifest,m)
        items=[]
        for p in root.glob('*/*/*/manifest.json'):
            entry=json.loads(p.read_text())
            if entry.get('status')=='ready':items.append({k:entry[k] for k in ['piece','movement','quality','brief','semantics','world_id']}|{'path':str(p.parent.relative_to(root))+'/','splat':entry['splat']})
        write(root/'index.json',{'items':items});print(json.dumps(m,ensure_ascii=False),flush=True);return m
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=Path(__file__).resolve().parent.parent/'worlds');p.add_argument('--piece',required=True);p.add_argument('--movement',required=True);p.add_argument('--brief',required=True);p.add_argument('--quality',choices=LIMITS,default='draft');p.add_argument('--seed',type=int,default=317);a=p.parse_args()
    try:prepare(a.root,a.piece,a.movement,a.brief,a.quality,a.seed)
    except Exception as e:print(type(e).__name__+': '+str(e),flush=True);raise SystemExit(1)
