import importlib.util,io,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('world_worker',Path(__file__).resolve().parents[1]/'server/world_worker.py');w=importlib.util.module_from_spec(spec);spec.loader.exec_module(w)
class Worlds(unittest.TestCase):
 def test_budget_before_purchase(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);w.write(root/'budget.json',[{'quality':'draft'}]*12)
   with patch.object(w,'api') as api:
    with self.assertRaisesRegex(RuntimeError,'limit'):w.prepare(root,'glass','opening','brief')
    api.assert_not_called()
 def test_ready_cache_never_spends(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);w.write(root/'glass/opening/draft/manifest.json',{'status':'ready'})
   with patch.object(w,'api') as api:w.prepare(root,'glass','opening','brief');api.assert_not_called()
 def test_resume_download_without_submission(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);w.write(root/'glass/opening/draft/manifest.json',{'status':'generating','operation_id':'op','piece':'glass','movement':'opening','quality':'draft','brief':'brief','credits_before':500,'started':w.time.time()})
   world={'id':'w','assets':{'splats':{'spz_urls':{'500k':'https://example.invalid/world.spz'}}}}
   def api(path,data=None):
    self.assertIsNone(data)
    return {'done':True,'response':world} if path.startswith('/operations') else {'world':world} if path.startswith('/worlds') else {'remaining_credits':270}
   with patch.object(w,'api',side_effect=api),patch.object(w.urllib.request,'urlopen',side_effect=lambda *a,**k:io.BytesIO(b'spz-test')):m=w.prepare(root,'glass','opening','brief')
   self.assertEqual(m['credits_used'],230);self.assertEqual(len(json.loads((root/'index.json').read_text())['items']),1)
if __name__=='__main__':unittest.main()
