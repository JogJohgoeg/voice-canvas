import json,sys,tempfile
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'server'))
from repertoire_service import repertoire_midi
with tempfile.TemporaryDirectory() as directory:
 root=Path(directory);rep=root/'repertoire';rep.mkdir();entry={'id':'test','license':'Public Domain','midi_url':'https://www.mutopiaproject.org/ftp/test.mid','source_url':'https://www.mutopiaproject.org/'};(rep/'index.json').write_text(json.dumps({'items':[entry]}))
 class Response:
  def __enter__(self):return self
  def __exit__(self,*args):pass
  def read(self,size):return b'MThdtest'
 with patch('repertoire_service.urlopen',return_value=Response()) as fetch:
  assert repertoire_midi(root,'test')==b'MThdtest';assert repertoire_midi(root,'test')==b'MThdtest';assert fetch.call_count==1
 try:repertoire_midi(root,'missing')
 except ValueError:pass
 else:raise AssertionError('Unknown ID accepted')
 entry['id']='uncleared';entry['license']='Unspecified';(rep/'index.json').write_text(json.dumps({'items':[entry]}))
 try:repertoire_midi(root,'uncleared')
 except ValueError:pass
 else:raise AssertionError('Uncleared licence accepted')
print('ID allowlist, cleared licence requirement and cached on-demand download passed')
