import assert from 'node:assert/strict';
import {validatePlugin,curatedPlugins} from '../web/plugins.mjs';
import {connectomeData as d} from '../web/connectome_data.mjs';
assert.equal(curatedPlugins.length,8);curatedPlugins.forEach(validatePlugin);
const p=curatedPlugins[0];for(const shader of [p.shader.replace('void main(){','void main(){while(true){}'),p.shader.replace('void main(){','void main(){main();'),p.shader.replace('void main(){','float huge[100000];void main(){')])assert.throws(()=>validatePlugin({...p,shader}));assert.throws(()=>validatePlugin({...p,init:'fetch("x")'}));assert.throws(()=>validatePlugin({...p,params:[{name:'bad',min:2,max:1,default:0}]}));
assert.equal(d.nodes.length,317);assert.equal(d.edges.length,20937);assert.equal(d.edges.reduce((sum,e)=>sum+e[2],0),87353);assert.equal(new Set(d.nodes.map(n=>n.id)).size,317);assert(d.edges.every(([a,b,w])=>d.nodes[a]&&d.nodes[b]&&w>0));assert.equal(d.edges.filter(e=>d.nodes[e[1]].instance.includes('GF')).length,318);assert.match(d.layout,/not anatomical/);console.log('8 curated manifests; unsafe source rejected; 317 unique real neurons / 20,937 edges / 87,353 synapses / 318 GF edges verified');
