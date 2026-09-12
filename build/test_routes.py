"""One executable entry page; legacy URLs are redirects."""
from pathlib import Path
root=Path(__file__).resolve().parent.parent
for folder in ['web','docs']:
 assert '<script>' in (root/folder/'index.html').read_text()
 for name in ['voice','piano','av_random','piano_projector']:
  text=(root/folder/(name+'.html')).read_text()
  assert 'url=./index.html' in text and '<script>' not in text
print('One bundled entry and four legacy redirects verified in web and Pages build')
