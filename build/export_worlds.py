#!/usr/bin/env python3
"""Export ready splats + public metadata to the cloud build, never budget/account metadata."""
import argparse,json,shutil
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('cache',type=Path);a=p.parse_args();root=Path(__file__).resolve().parents[1]
items=json.loads((a.cache/'index.json').read_text())['items'];preferred={}
for item in items:
 key=(item['piece'],item['movement'])
 if key not in preferred or item['quality']=='full':preferred[key]=item
for directory in ['web','docs']:
 dest=root/directory/'worlds'
 if dest.is_symlink():dest.unlink()
 dest.mkdir(exist_ok=True)
 for item in preferred.values():
  source=a.cache/item['path'];target=dest/item['path'];target.mkdir(parents=True,exist_ok=True)
  for name in [item['splat'],'thumbnail.jpg']:
   if (source/name).is_file():
    if (source/name).stat().st_size>24*1024**2:raise ValueError('Splat too large for static hosting; export preview instead')
    shutil.copy2(source/name,target/name)
 (dest/'index.json').write_text(json.dumps({'items':list(preferred.values())},ensure_ascii=False))
print('Exported',len(preferred),'ready worlds; no credentials, operations or account balances')
