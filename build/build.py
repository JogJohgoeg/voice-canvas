#!/usr/bin/env python3
"""Bundle our named ES modules into portable, dependency-free HTML pages."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
WEB=ROOT/'web'
def bundle(template,entry):
    seen=set(); chunks=['const __modules={};']
    def visit(name):
        if name in seen:return
        seen.add(name);source=(WEB/name).read_text()
        pattern=r"import\s*\{([^}]+)\}\s*from\s*['\"]\./([^'\"]+)['\"];?"
        for match in re.finditer(pattern,source):visit(match[2])
        source=re.sub(pattern,lambda m:'const {'+m[1]+"}=__modules['"+m[2]+"'];",source)
        exports=re.findall(r'export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)',source)
        source=re.sub(r'\bexport\s+','',source)
        chunks.append("__modules['"+name+"']=(()=>{\n"+source+'\nreturn {'+','.join(exports)+'};})();')
    visit(entry)
    script='\n'.join(chunks).replace('</script','<\\/script')
    return (WEB/template).read_text().replace('<script type="module" src="'+entry+'"></script>','<script>\n'+script+'\n</script>')
if __name__=='__main__':
    (ROOT/'docs').mkdir(exist_ok=True)
    (ROOT/'docs/.nojekyll').touch()
    html=bundle('av_random.template.html','av_random.js')
    redirect='<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./index.html"><title>Voice Canvas</title><a href="./index.html">Open Voice Canvas</a>'
    for directory in [WEB,ROOT/'docs']:
        (directory/'index.html').write_text(html)
        for name in ['av_random','piano','piano_projector','voice']:(directory/(name+'.html')).write_text(redirect)
    print('index.html',len(html.encode()),'bytes; four legacy redirects')

    import shutil
    repertoire=WEB/'repertoire'
    if repertoire.exists():
        import json
        entries=json.loads((repertoire/'index.json').read_text())['items']
        if any(p['id'].startswith('maestro-') or 'NC' in p['license'] for p in entries):raise ValueError('Run export_repertoire.py to exclude non-commercial data before a public build')
        (ROOT/'docs/repertoire').mkdir(parents=True,exist_ok=True)
        for name in ['index.json','sources.json']:shutil.copyfile(repertoire/name,ROOT/'docs/repertoire'/name)
        shutil.copytree(repertoire/'curated',ROOT/'docs/repertoire/curated',dirs_exist_ok=True)
