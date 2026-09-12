#!/usr/bin/env python3
"""Publish catalogue metadata and a <30 MB cleared subset, never MAESTRO files."""
import json,shutil,sys
from pathlib import Path
source=Path(sys.argv[1]).resolve();root=Path(__file__).resolve().parent.parent
web=root/'web/repertoire';web.mkdir(parents=True,exist_ok=True)
items=[];files=set()
index_path=source/'local/index.json' if (source/'local/index.json').exists() else source/'index.json'
for original in json.loads(index_path.read_text())['items']:
    if original['id'].startswith('maestro-') or 'NC' in original['license']:continue
    p=dict(original)
    for field in ['local_path','score_local_path']:
        relative=p.get(field)
        if relative and not relative.startswith('curated/'):p[field]=None
        elif relative:
            path=(source/relative).resolve()
            if not path.is_relative_to(source/'curated') or p['license'] not in ['Public Domain','CC0-1.0']:raise ValueError('Uncleared curated file')
            files.add(relative)
    items.append(p)
if sum((source/p).stat().st_size for p in files)>=30_000_000:raise ValueError('Public subset exceeds 30 MB')
(web/'index.json').write_text(json.dumps({'version':1,'items':items},ensure_ascii=False,separators=(',',':')))
shutil.copyfile(source/'sources.json',web/'sources.json')
fetch=(source/'fetch.py').read_text().replace("(ROOT/'index.json').write_text","(ROOT/'local/index.json').write_text").replace('sources()\n    for name',"(ROOT/'local').mkdir(exist_ok=True)\n    sources()\n    for name")
(web/'fetch.py').write_text(fetch)
fingerprint=(source/'fingerprint.mjs').read_text().replace("const root=path.dirname(fileURLToPath(import.meta.url)),index=","const root=path.dirname(fileURLToPath(import.meta.url)),indexFile=await fs.access(path.join(root,'local/index.json')).then(()=> 'local/index.json',()=> 'index.json'),index=").replace("path.join(root,'index.json')","path.join(root,indexFile)")
(web/'fingerprint.mjs').write_text(fingerprint)
for relative in files:
    target=web/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source/relative,target)
print('Public repertoire:',len(items),'catalogue items,',len(files),'files,',sum((source/p).stat().st_size for p in files),'bytes; zero MAESTRO items')
