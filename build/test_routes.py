"""Check every external entry-module import is reachable through the local server."""
import ast,re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
allowed={n.value for n in ast.walk(ast.parse((root/'server/serve.py').read_text())) if isinstance(n,ast.Constant) and isinstance(n.value,str) and n.value.startswith('/')}
seen=set()
def visit(name):
    if name in seen:return
    seen.add(name)
    assert '/'+name in allowed, 'Unserved module: '+name
    source=(root/'web'/name).read_text()
    for dependency in re.findall(r"from\s+['\"]\./([^'\"]+)['\"]",source):visit(dependency)
for page in (root/'web').glob('*.html'):
    if page.name.endswith('.template.html'):continue
    for entry in re.findall(r'<script[^>]+src="([^"]+)"',page.read_text()):visit(entry.removeprefix('./'))
print('Local server serves all',len(seen),'entry modules and transitive imports')
