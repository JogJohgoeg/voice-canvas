#!/usr/bin/env python3
"""Rate-limited, cached repertoire fetcher. Non-commercial data stays in local/."""
import argparse,csv,hashlib,html,io,json,re,time,zipfile
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urljoin,quote
ROOT=Path(__file__).resolve().parent
LIMIT=8_000_000_000
last=0

def download(url,path,maximum=120_000_000):
    global last
    if path.exists():return path.read_bytes()
    if sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file())+maximum>LIMIT:raise ValueError('8 GB disk cap')
    time.sleep(max(0,1.1-(time.monotonic()-last)));last=time.monotonic()
    request=Request(url,headers={'User-Agent':'VoiceCanvas-Repertoire/1.0 (cached educational catalogue)'})
    path.parent.mkdir(parents=True,exist_ok=True);temporary=path.with_suffix(path.suffix+'.partial')
    try:
        with urlopen(request,timeout=45) as response,temporary.open('wb') as out:
            if int(response.headers.get('Content-Length','0'))>maximum:raise ValueError('Download exceeds budget')
            size=0
            while True:
                chunk=response.read(65536)
                if not chunk:break
                size+=len(chunk)
                if size>maximum:raise ValueError('Download exceeds budget')
                out.write(chunk)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)
    return path.read_bytes()

def cached(url):return download(url,ROOT/'local/cache'/(hashlib.sha256(url.encode()).hexdigest()+'.html'),5_000_000).decode('utf-8','replace')
def save(name,items):
    (ROOT/('catalogue-'+name+'.json')).write_text(json.dumps(items,ensure_ascii=False,indent=2))
    print(name,len(items),flush=True)
def era(composer):
    return 'Baroque' if re.search('Bach|Scarlatti|Handel',composer,re.I) else 'Classical' if re.search('Mozart|Haydn|Clementi|Beethoven',composer,re.I) else 'Impressionist' if re.search('Debussy|Ravel',composer,re.I) else 'Romantic'
def item(identity,composer,title,source,license,**extra):
    opus=re.search(r'(?:Op\.?\s*\d+(?:\s*No\.?\s*\d+)?|BWV\s*\d+|K\.?\s*\d+|S\.?\s*\d+)',title,re.I)
    return dict(id=identity,composer=composer,title=title,opus=opus.group(0) if opus else '',movement='',key=None,tempo=None,duration=None,era=era(composer),mood='unanalysed',source_url=source,license=license,local_path=None,fingerprint=None,**extra)
def maestro():
    url='https://storage.googleapis.com/magentadata/datasets/maestro/v3.0.0/maestro-v3.0.0-midi.zip'
    raw=download(url,ROOT/'local/maestro-v3.0.0-midi.zip')
    if hashlib.sha256(raw).hexdigest()!='70470ee253295c8d2c71e6d9d4a815189e35c89624b76d22fce5a019d5dde12c':raise ValueError('MAESTRO checksum mismatch')
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if sum(info.file_size for info in archive.infolist())>150_000_000:raise ValueError('Archive expansion exceeds budget')
        for info in archive.infolist():
            target=(ROOT/'local'/info.filename).resolve()
            if not target.is_relative_to((ROOT/'local').resolve()):raise ValueError('Invalid ZIP path')
            if info.is_dir():continue
            if target.suffix not in ['.midi','.mid','.json','.csv','.txt']:continue
            target.parent.mkdir(parents=True,exist_ok=True)
            if not target.exists():target.write_bytes(archive.read(info))
    rows=list(csv.DictReader((ROOT/'local/maestro-v3.0.0/maestro-v3.0.0.csv').open()))
    items=[]
    for i,row in enumerate(rows):
        p=item('maestro-'+str(i),row['canonical_composer'],row['canonical_title'],'https://magenta.tensorflow.org/datasets/maestro','CC-BY-NC-SA-4.0',redistribute=False)
        p.update(duration=float(row['duration']),local_path='local/maestro-v3.0.0/'+row['midi_filename'],license_evidence='https://magenta.tensorflow.org/datasets/maestro#license',attribution='Google LLC; International Piano-e-Competition; Hawthorne et al., ICLR 2019')
        items.append(p)
    save('maestro',items)
def plain(s):return html.unescape(re.sub('<[^>]+>','',s)).strip()
def mutopia():
    items=[]
    for start in range(0,1200,10):
        page=cached('https://www.mutopiaproject.org/cgibin/make-table.cgi?Instrument=Piano&startat='+str(start))
        blocks=re.findall(r'<table class="table-bordered result-table">(.*?)</table>',page,re.S)
        if not blocks:break
        for block in blocks:
            fields=re.findall(r'<td[^>]*>(.*?)</td>',block,re.S);urls=re.findall(r'href="([^"]+)"',block)
            identity=re.search(r'piece-info.cgi\?id=(\d+)',block)
            if not identity:continue
            license=plain(fields[9]);midi=next((u for u in urls if u.endswith(('.mid','.midi'))),None);score=next((u for u in urls if u.endswith('-a4.pdf')),None)
            p=item('mutopia-'+identity[1],plain(fields[1]).removeprefix('by '),plain(fields[0]),'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id='+identity[1],license,redistribute=license=='Public Domain')
            p.update(opus=plain(fields[2]) or p['opus'],era=plain(fields[6]),instrument=plain(fields[4]).removeprefix('for '),midi_url=midi,score_url=score,license_evidence=p['source_url'],attribution='Mutopia Project; edition and contributor credits on source page')
            items.append(p)
        if start%100==0:print('Mutopia catalogue',len(items),flush=True)
        if 'Next 10' not in page:break
    # A compact, licence-cleared solo-piano selection; full catalogue remains searchable.
    candidates=[p for p in items if p['redistribute'] and p['midi_url'] and p['instrument'].lower()=='piano']
    preferred=[p for p in candidates if re.search('Bach|Beethoven|Chopin|Debussy|Liszt|Mozart|Schubert|Schumann|Satie|Scarlatti',p['composer'])]
    selected=[];counts={}
    for p in preferred+candidates:
        composer=p['composer']
        if p in selected or counts.get(composer,0)>=3:continue
        path=ROOT/'curated'/(p['id']+'.mid')
        if sum(q.stat().st_size for q in (ROOT/'curated').glob('*'))>29_000_000:break
        try:download(p['midi_url'],path,1_000_000)
        except Exception as error:print(p['id'],str(error),flush=True);continue
        p['local_path']='curated/'+path.name;selected.append(p);counts[composer]=counts.get(composer,0)+1
        if len(selected)>=30:break
    save('mutopia',items)
def openscore():
    # The repository supplies JSON conversion metadata as well as CC0 MuseScore sources.
    base='https://raw.githubusercontent.com/OpenScore/Lieder/main/'
    source=json.loads(cached(base+'data/corpus_conversion.json'))
    items=[]
    for i,row in enumerate(source):
        path=row.get('in','').removeprefix('../') if isinstance(row,dict) else ''
        if not path:continue
        segments=Path(path).parts;title=' / '.join(s for s in segments[2:-1] if s!='_');composer=segments[1] if len(segments)>2 else 'OpenScore Lieder'
        p=item('openscore-'+str(i),composer.replace('_',' '),title.replace('_',' '),'https://github.com/OpenScore/Lieder/blob/main/'+quote(path),'CC0-1.0',redistribute=True)
        p.update(score_url=base+quote(path.replace('.mscx','.mxl')),instrument='Voice and piano',license_evidence='https://github.com/OpenScore/Lieder/blob/main/LICENSE.txt',attribution='OpenScore Lieder; Gotham and Jonas')
        if i<3:
            try:
                target=ROOT/'curated'/(p['id']+'.mxl');download(base+quote(path.replace('.mscx','.mxl')),target,3_000_000);p['score_local_path']='curated/'+target.name
            except Exception as e:print('OpenScore sample',str(e))
        items.append(p)
    save('openscore',items)

def kern():
    repo='https://api.github.com/repos/craigsapp/beethoven-piano-sonatas/contents/kern'
    rows=json.loads(cached(repo));items=[]
    for row in rows:
        if not row['name'].endswith('.krn'):continue
        match=re.match(r'sonata(\d+)-(\d+)\.krn',row['name'])
        if not match:continue
        title='Piano Sonata '+str(int(match[1]))+', movement '+match[2]
        p=item('kern-beethoven-'+row['name'][:-4],'Ludwig van Beethoven',title,row['html_url'],'Unspecified; redistribution not cleared',redistribute=False)
        p.update(movement=match[2],score_url=row['html_url'],download_url=row['download_url'],attribution='Encoded by Craig Stuart Sapp; see per-file edition and encoding credits')
        # Read a small representative encoding locally; no unspecified-license data is published.
        if len(items)<3:
            target=ROOT/'local/kern'/row['name'];download(row['download_url'],target,1_000_000);p['score_local_path']='local/kern/'+row['name']
        items.append(p)
    save('kern',items)


def krueger():
    base='http://piano-midi.de/'
    rights=cached(base+'copy.htm')
    if 'creativecommons.org/licenses/by-sa/3.0/de/' not in rights or 'Bernd Krueger' not in rights:raise ValueError('Krueger licence not verified')
    pages=re.findall(r'href="([^"/]+\.htm)"',rights)
    pages=pages[pages.index('albeniz.htm'):pages.index('other.htm')]
    items=[]
    for page in pages:
        source=base+page;body=cached(source)
        heading=re.search(r'<h1[^>]*>(.*?)</h1>',body,re.S)
        composer=plain(heading[1]) if heading else page[:-4]
        section=''
        for match in re.finditer(r'<h2[^>]*>(.*?)</h2>|<tr class="midi"[^>]*>(.*?)</tr>',body,re.S):
            if match[1] is not None:section=plain(match[1]);continue
            row=match[2];link=re.search(r'href="([^"]+\.mid)"[^>]*>(.*?)</a>',row,re.S)
            if not link or '_format0' in link[1]:continue
            identity='krueger-'+Path(link[1]).stem
            if any(p['id']==identity for p in items):continue
            title=section+' / '+plain(link[2])
            p=item(identity,composer,title,source,'CC-BY-SA-3.0-DE',redistribute=True)
            p.update(midi_url=urljoin(base,link[1]),license_evidence=base+'copy.htm',attribution='Bernd Krueger; Classical Piano MIDI Page; CC BY-SA 3.0 Germany',instrument='Piano')
            target=ROOT/'local/downloads'/(identity+'.mid')
            try:
                data=download(p['midi_url'],target,8_000_000)
                if not data.startswith(b'MThd'):raise ValueError('Not MIDI')
                p['local_path']='local/downloads/'+target.name
            except Exception as e:p['fetch_error']=str(e);print(identity,str(e),flush=True)
            items.append(p)
        save('krueger',items)


def imslp():
    # Edition-level review, 2026-09-12. Keep official download flow; no PDF scraping.
    groups=[('Frédéric Chopin','Nocturnes, Op.9','Nocturnes,_Op.9_(Chopin,_Frederic)',[
        (86550,'Kistner, 1833; first edition'),(34916,'Peters, ca.1905; Scholtz'),
        (113996,'Breitkopf, 1880; Bargiel'),(80717,'Schlesinger, 1881; Kullak'),
        (470,'Augener, 1883; Klindworth and Scharwenka'),(800086,'Cotta, 1888; Speidel')]),
        ('Ludwig van Beethoven','Piano Sonata No.14, Op.27 No.2','Moonlight_sonata',[
        (592987,'André, ca.1810'),(331155,'Cranz, ca.1814; Moscheles'),(793913,'Schlesinger, ca.1830–31'),(90660,'Hallberger, ca.1860; Moscheles')]),
        ('Claude Debussy','Suite bergamasque, CD 82','Claire_de_Lune_(Debussy,_Claude)',[
        (83536,'Fromont, 1905; first edition'),(962690,'Schirmer, ca.1920')])]
    items=[]
    for composer,title,slug,editions in groups:
        source='https://imslp.org/wiki/'+quote(slug)
        for identity,edition in editions:
            p=item('imslp-'+str(identity),composer,title+' — '+edition,source,'Public Domain',redistribute=False)
            p.update(score_url='https://imslp.org/wiki/Special:ImagefromIndex/'+str(identity),edition=edition,instrument='Piano',license_evidence=source,license_checked='2026-09-12',attribution='IMSLP / Petrucci Music Library; edition credits above',attachment_status='No clearly public-domain MIDI/MusicXML verified for this edition; official score link only')
            items.append(p)
    save('imslp',items)


def all_midi():
    path=ROOT/'catalogue-mutopia.json'
    if not path.exists():mutopia()
    items=json.loads(path.read_text());count=0;failed=0
    for p in items:
        if not p.get('midi_url') or p.get('local_path'):continue
        if p['license']!='Public Domain' and not p['license'].startswith('Creative Commons Attribution'):continue
        target=ROOT/'local/downloads'/(p['id']+'.mid')
        try:
            data=download(p['midi_url'],target,8_000_000)
            if not data.startswith(b'MThd'):raise ValueError('Not a MIDI file')
            p['local_path']='local/downloads/'+target.name;count+=1
        except Exception as e:failed+=1;print(p['id'],str(e),flush=True)
        if (count+failed)%25==0:
            save('mutopia',items);print('MIDI cache additions',count,'failed',failed,flush=True)
    save('mutopia',items)

def sources():
    rows=[{'name':'MAESTRO v3','url':'https://magenta.tensorflow.org/datasets/maestro','license':'CC-BY-NC-SA-4.0','policy':'Local only; checksum-verified MIDI archive'}, {'name':'Mutopia','url':'https://www.mutopiaproject.org/legal.html','license':'Per item: Public Domain / CC-BY / CC-BY-SA','policy':'Only public-domain MIDI files included in curated subset'}, {'name':'OpenScore Lieder','url':'https://github.com/OpenScore/Lieder','license':'CC0-1.0','policy':'Voice and piano scores; score links when no MIDI available'}, {'name':'Classical Piano MIDI Page / Bernd Krueger','url':'https://www.piano-midi.de/','license':'CC-BY-SA-3.0-DE','policy':'Author licence verified at http://piano-midi.de/copy.htm; MIDI cached locally with attribution'}, {'name':'KernScores / Beethoven piano sonatas','url':'https://github.com/craigsapp/beethoven-piano-sonatas','license':'Per-file rights require verification','policy':'Source links; conversion requires music21 or humlib and licence review'}, {'name':'IMSLP','url':'https://imslp.org/wiki/Category:Scores_featuring_the_piano','license':'Per edition and jurisdiction','policy':'12 individually reviewed public-domain piano editions; official PDF flow links; no gated file downloads'}]
    (ROOT/'sources.json').write_text(json.dumps(rows,indent=2))
def merge():
    items=[]
    for p in sorted(ROOT.glob('catalogue-*.json')):items.extend(json.loads(p.read_text()))
    (ROOT/'local/index.json').write_text(json.dumps({'version':1,'items':items},ensure_ascii=False,separators=(',',':')))
    print('Total catalogue',len(items),'disk bytes',sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file()),flush=True)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--source',choices=['all','maestro','mutopia','openscore','kern','krueger','imslp','all-midi','merge'],default='all');args=parser.parse_args();ROOT.mkdir(exist_ok=True)
    (ROOT/'local').mkdir(exist_ok=True)
    sources()
    for name,action in [('maestro',maestro),('mutopia',mutopia),('openscore',openscore),('kern',kern),('krueger',krueger),('imslp',imslp)]:
        if args.source in ['all',name]:
            try:action()
            except Exception as e:print(name,type(e).__name__,str(e),flush=True)
    if args.source=='all-midi':all_midi()
    merge()
