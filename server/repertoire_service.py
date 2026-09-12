"""On-demand MIDI cache for catalogue entries with an explicit free-content licence."""
import json,threading,time
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
_SLOT=threading.Lock()
_last=0

def repertoire_midi(root,identity):
    global _last
    if not _SLOT.acquire(blocking=False):raise RuntimeError('Download busy; retry shortly')
    try:
        repertoire=(Path(root)/'repertoire').resolve()
        index=repertoire/'local/index.json' if (repertoire/'local/index.json').exists() else repertoire/'index.json'
        entry=next((p for p in json.loads(index.read_text())['items'] if p['id']==identity),None)
        if not entry:raise ValueError('Unknown library ID')
        if entry.get('local_path'):
            path=(repertoire/entry['local_path']).resolve()
            if path.is_relative_to(repertoire) and path.is_file():return path.read_bytes()
        target=repertoire/'local/downloads'/(identity+'.mid')
        if target.exists():return target.read_bytes()
        url=entry.get('midi_url','');parsed=urlsplit(url)
        supported=(parsed.scheme=='https' and parsed.hostname=='www.mutopiaproject.org') or (parsed.scheme=='http' and parsed.hostname=='piano-midi.de' and parsed.path.startswith('/midis/'))
        if not supported or not parsed.path.endswith(('.mid','.midi')):raise ValueError('No supported MIDI download; open the score source')
        if entry['license'] not in ['Public Domain','CC-BY-SA-3.0-DE'] and not entry['license'].startswith('Creative Commons Attribution'):raise ValueError('Licence is not cleared for this download')
        if sum(p.stat().st_size for p in repertoire.rglob('*') if p.is_file())+8_000_000>8_000_000_000:raise ValueError('Repertoire disk cap reached')
        time.sleep(max(0,1.1-(time.monotonic()-_last)));_last=time.monotonic()
        with urlopen(Request(url,headers={'User-Agent':'VoiceCanvas-Repertoire/1.0'}),timeout=30) as response:
            data=response.read(8_000_001)
        if len(data)>8_000_000 or not data.startswith(b'MThd'):raise ValueError('Invalid or oversized MIDI')
        target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
        target.with_suffix('.json').write_text(json.dumps({'source_url':url,'license':entry['license'],'license_evidence':entry['source_url']}))
        return data
    finally:_SLOT.release()
