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
    for template,entry,target in [('voice.template.html','app.js','voice.html'),('av_random.template.html','av_random.js','av_random.html'),('piano.template.html','piano.js','piano.html'),('piano_projector.template.html','piano_projector.js','piano_projector.html')]:
        html=bundle(template,entry)
        (ROOT/'docs'/target).write_text(html)
        if target!='index.html':(WEB/target).write_text(html)
        print(target,len(html.encode()),'bytes')

    for directory in [WEB,ROOT/"docs"]:(directory/"index.html").write_text((directory/"av_random.html").read_text())
