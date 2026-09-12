import json,math,random,hashlib
from pathlib import Path
import sys
r=Path(sys.argv[1])
nodes=json.loads((r/'cell_columns.json').read_text())+json.loads((r/'descending_cells.json').read_text());nodes.sort(key=lambda n:n['bodyId']);index={n['bodyId']:i for i,n in enumerate(nodes)}
edges=json.loads((r/'cell_edges.json').read_text());assert all(e['source'] in index and e['target'] in index for e in edges)
rng=random.Random(317);pos=[]
for n in nodes:
 side=-1 if n['instance'].endswith('_L') else 1
 pos.append([side*(.3+rng.random()*.4),(rng.random()-.5)*1.1,(rng.random()-.5)*.8])
# Seeded spring embedding, not anatomical coordinates. Side annotations constrain two lobes.
for iteration in range(60):
 forces=[[0.,0.,0.] for _ in nodes]
 for i in range(len(nodes)):
  for j in range(i):
   delta=[pos[i][k]-pos[j][k] for k in range(3)];d=sum(x*x for x in delta)+.025;f=.0005/d
   for k in range(3):forces[i][k]+=delta[k]*f;forces[j][k]-=delta[k]*f
 for e in edges:
  i,j=index[e['source']],index[e['target']];weight=.0006*math.log1p(e['weight'])
  for k in range(3):
   f=(pos[j][k]-pos[i][k])*weight;forces[i][k]+=f;forces[j][k]-=f
 for i,n in enumerate(nodes):
  side=-1 if n['instance'].endswith('_L') else 1
  forces[i][0]+=(side*.48-pos[i][0])*.05
  for k in range(3):pos[i][k]+=max(-.025,min(.025,forces[i][k]-pos[i][k]*.006))
maximum=max(max(abs(x) for x in p) for p in pos)
result={'dataset':'male-cns:v1.0','license':'CC-BY','source':'https://male-cns.janelia.org/download/','layout':'Seeded force-directed embedding; soma coordinates unavailable in local tables; not anatomical positions','layoutSeed':317,'nodes':[{'id':n['bodyId'],'type':n['type'],'instance':n['instance'],'position':[round(x/maximum,5) for x in p]} for n,p in zip(nodes,pos)],'edges':[[index[e['source']],index[e['target']],e['weight']] for e in edges],'sourceHashes':{name:hashlib.sha256((r/name).read_bytes()).hexdigest() for name in ['cell_edges.json','cell_columns.json','descending_cells.json']}}
output=Path(__file__).resolve().parent.parent/'web/connectome_data.mjs';output.write_text('export const connectomeData='+json.dumps(result,separators=(',',':'))+';\n');print(len(nodes),len(edges),sum(e['weight'] for e in edges),output.stat().st_size)
