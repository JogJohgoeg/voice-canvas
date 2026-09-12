import {instructions} from './instructions.mjs';
export function validate(p){
 const num=(v,a,b)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<a||v>b)throw Error('Invalid score number');return v;};
 if(!p||typeof p.description!=='string'||!['fusion','moyers','vangogh','ink','monet'].includes(p.style)||!Number.isInteger(p.family)||p.family<0||p.family>4)throw Error('Invalid visual plan');
 const tempo=num(p.tempo,40,120),beats=num(p.beats,16,32);
 if(!Array.isArray(p.palette)||p.palette.length!==2||!p.palette.every(c=>/^#[a-f\d]{6}$/i.test(c)))throw Error('Invalid palette');
 if(!Array.isArray(p.notes)||p.notes.length<1||p.notes.length>128)throw Error('Invalid notes');
 for(const n of p.notes){if(!Array.isArray(n)||n.length!==4)throw Error('Invalid note');num(n[0],0,beats);num(n[1],21,108);num(n[2],.125,16);num(n[3],1,110);if(!Number.isInteger(n[1])||n[0]+n[2]>beats+.001)throw Error('Invalid note duration');}
 return {description:p.description.slice(0,300),tempo,beats,style:p.style,family:p.family,palette:p.palette,intensity:num(p.intensity,0,1),seed:Math.floor(num(p.seed,0,4294967295)),notes:p.notes.sort((a,b)=>a[0]-b[0])};
}
async function boundedJSON(body,maximum){const reader=body.getReader();let size=0,text='';const decoder=new TextDecoder();try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maximum)throw Error('Payload too large');text+=decoder.decode(value,{stream:true});}return JSON.parse(text+decoder.decode());}finally{reader.cancel().catch(()=>{});}}
export default {async fetch(request,env){
 const url=new URL(request.url),origin=request.headers.get('Origin');const allowed=!origin||origin===url.origin||['https://jojtown.github.io','https://jogjohgoeg.github.io'].includes(origin);
 const headers={'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};if(origin&&allowed)headers['Access-Control-Allow-Origin']=origin;
 const reply=(value,status=200)=>new Response(JSON.stringify(value)+'\n',{status,headers});
 if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(!allowed)return reply({error:'Origin denied'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
 if(url.pathname==='/api/status')return reply({backend:'GLM',model:env.MODEL,available:!!env.PROVIDER_SECRET});
 if(url.pathname!=='/api/performance'||request.method!=='POST')return reply({error:'Not found'},404);
 if(!env.PROVIDER_SECRET)return reply({error:'云端模型尚未配置'},503);
 if(!(await env.MODEL_LIMIT.limit({key:request.headers.get('CF-Connecting-IP')??'unknown'})).success)return reply({error:'请求较多，请稍后再试'},429);
 let input;try{input=await boundedJSON(request.body,20000);if(typeof input.prompt!=='string'||!input.prompt.trim()||input.prompt.length>2000)throw Error();if(input.previous)input.previous=validate(input.previous);}catch{return reply({error:'Invalid performance request'},400);}
 const started=Date.now();try{
 const response=await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.PROVIDER_SECRET},body:JSON.stringify({model:env.MODEL,messages:[{role:'system',content:instructions},{role:'user',content:JSON.stringify({request:input.prompt,previous:input.previous??null})}],thinking:{type:'disabled'},max_tokens:2500,stream:false}),signal:AbortSignal.timeout(60000)});
 const data=await boundedJSON(response.body,60000);
 if(!response.ok){const code=String(data.error?.code??'');return reply({error:code==='1113'?'GLM 账户余额不足，请充值后重试':'GLM 暂时无法生成，请稍后重试',code},502);}
 const content=data.choices?.[0]?.message?.content;if(typeof content!=='string')throw Error('No plan');const plan=validate(JSON.parse(content.slice(content.indexOf('{'),content.lastIndexOf('}')+1)));return reply({plan,model:env.MODEL,latency_ms:Date.now()-started});
 }catch{return reply({error:'模型超时或计划无效，上一段演出保持不变'},502);}
}};
