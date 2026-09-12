import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'server'))
"""Offline regression checks; never reads credentials or calls a model."""
import json
import os
from unittest.mock import patch
from backend import SceneBackend, html_only

safe = html_only('prose```html\n<html><body onload="alert(1)"><svg viewBox="0 0 100 100"><path d="M0 0L10 10"/></svg><script>alert(1)</script><iframe src="https://evil.test"></iframe><meta http-equiv="refresh" content="0;url=https://evil.test"><img src="https://evil.test"></body></html>```tail')
assert '<script' not in safe and 'onload' not in safe and '<iframe' not in safe and '<meta' not in safe and '<img' not in safe
assert 'viewBox=' in safe and safe.endswith('</html>') and 'prose' not in safe
assert '<feTurbulence' in html_only('<svg><filter><feTurbulence baseFrequency=".1"/></filter></svg>')
for text in ('no markup','<html>incomplete'):
    try:
        html_only(text)
        raise AssertionError('Should reject non-HTML')
    except ValueError:
        pass
backend = SceneBackend()
with patch.dict(os.environ,{},clear=True):
    assert backend.name == 'codex:gpt-6-astra'
    with patch.object(backend,'app_server',return_value=iter(['<svg><path d="M0 0L1 1"/></svg>'])):
        events = list(backend.generate('月亮',{}))
        assert events[-1]['html'].startswith('<svg>') and events[-1]['latency']['model_ms'] >= 0
    with patch.object(backend,'app_server',side_effect=RuntimeError('protocol failure')), patch.object(backend,'exec_cli',return_value=iter(['<svg></svg>'])):
        assert list(backend.generate('moon',{}))[-1]['backend']=='codex-exec:gpt-6-astra'
backend.close()
print('HTML sanitization, streaming and fallback passed (offline)')
