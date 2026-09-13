import assert from 'node:assert/strict';
import worker,{validate} from '../cloud/worker.mjs';
const plan={description:'test',tempo:60,beats:16,style:'fusion',family:1,palette:['#112233','#aabbcc'],intensity:.5,seed:317,notes:[[0,60,1,70]]};
assert.equal(validate(plan).notes.length,1);assert.throws(()=>validate({...plan,notes:[[15,60,2,70]]}));
const env={MODEL:'glm-4.7-flash',PROVIDER_SECRET:'test-only',MODEL_LIMIT:{limit:async()=>({success:true})}};
const original=globalThis.fetch;let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://open.bigmodel.cn/api/paas/v4/chat/completions');assert.equal(options.headers.Authorization,'Bearer test-only');return Response.json({choices:[{message:{content:JSON.stringify(plan)}}]});};
try{let r=await worker.fetch(new Request('https://show.test/api/performance',{method:'POST',headers:{Origin:'https://jogjohgoeg.github.io'},body:JSON.stringify({prompt:'piano'})}),env);assert.equal(r.status,200);const data=await r.json();assert.equal(data.model,'glm-4.7-flash');assert.equal(data.plan.seed,317);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://jogjohgoeg.github.io');assert(!JSON.stringify(data).includes('test-only'));
r=await worker.fetch(new Request('https://show.test/api/performance',{method:'POST',headers:{Origin:'https://evil.test'},body:'{}'}),env);assert.equal(r.status,403);assert.equal(calls,1);
r=await worker.fetch(new Request('https://show.test/api/performance',{method:'POST',body:'{}'}),{...env,MODEL_LIMIT:{limit:async()=>({success:false})}});assert.equal(r.status,429);assert.equal(calls,1);console.log('Cloud plan, provider request, secret isolation, origin and rate-limit tests passed');}finally{globalThis.fetch=original;}
const assets={ASSETS:{fetch:async()=>new Response('{"items":[]}')}};
const world=await worker.fetch(new Request('https://show.test/worlds/index.json',{headers:{Origin:'https://jogjohgoeg.github.io'}}),assets);assert.equal(world.headers.get('Access-Control-Allow-Origin'),'https://jogjohgoeg.github.io');
const denied=await worker.fetch(new Request('https://show.test/worlds/index.json',{headers:{Origin:'https://evil.test'}}),assets);assert.equal(denied.headers.get('Access-Control-Allow-Origin'),null);
const {readFile}=await import('node:fs/promises');const config=JSON.parse(await readFile(new URL('../cloud/wrangler.jsonc',import.meta.url)));assert(config.assets.run_worker_first.includes('/worlds/*'));console.log('Cached world CORS and Worker routing passed');
