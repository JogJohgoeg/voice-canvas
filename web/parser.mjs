export const subjects = {
 sun:['太阳','日头','sun'],moon:['月亮','月球','moon'],mountain:['山','mountain'],sea:['海','海洋','ocean','sea'],tree:['树','tree'],house:['房子','房屋','house','home'],person:['人','person','people'],cat:['猫','cat'],dog:['狗','dog'],car:['车','car'],fire:['火','fire'],rain:['雨','rain'],snow:['雪','snow'],star:['星星','星','star'],cloud:['云','cloud'],flower:['花','flower'],bird:['鸟','bird'],balloon:['气球','balloon'],fish:['鱼','fish'],heart:['爱心','heart']
};
const colours={ '#ff6b78':['红','red'], '#67b7ff':['蓝','blue'], '#75d6a2':['绿','green'], '#ffd26d':['金','黄','gold','yellow'], '#c394ff':['紫','purple'], '#ffffff':['白','white'], '#28324e':['黑','black'], '#ffb6d6':['粉','pink'], '#ff9a5c':['橙','orange'] };
export function has(text,words){return words.some(w=>/[a-z]/i.test(w)?new RegExp('\\b'+w+'(?:s)?\\b','i').test(text):text.includes(w));}
export function hash(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.codePointAt(0),16777619);return n>>>0;}
export const initial=()=>({objects:[],night:false,speed:1,weather:null});
export function parse(text){
 text=text.trim().slice(0,2000); if(!text)return [];
 if(has(text,['清空','清除','clear','reset']))return [{command:'clear'}];
 if(has(text,['撤销','undo']))return [{command:'undo'}];
 if(has(text,['保存','save']))return [{command:'save'}];
 // ponytail: clause-local keyword grammar; GPT-6 supplies richer interpretation asynchronously.
 const edits=[];
 for(const phrase of text.split(/[，。！？,;；.!?]|然后|\band\b/i).filter(x=>x.trim())){
 const edit={};
 if(has(phrase,['夜晚','晚上','night']))edit.night=true;
 if(has(phrase,['白天','日间','day','daytime']))edit.night=false;
 if(has(phrase,['快一点','快点','热闹','faster','fast','lively']))edit.speed=2;
 if(has(phrase,['慢一点','慢点','安静','slower','slow','quiet']))edit.speed=.35;
 const colour=Object.entries(colours).find(([,words])=>has(phrase,words))?.[0];
 const x=has(phrase,['左边','左','left'])?.22:has(phrase,['右边','右','right'])?.78:has(phrase,['中间','中央','center','middle'])?.5:undefined;
 const y=has(phrase,['上面','上方','top','above'])?.23:has(phrase,['下面','下方','bottom','below'])?.75:undefined;
 const motion=has(phrase,['转','spin','rotate'])?'spin':has(phrase,['飞','fly','flying'])?'fly':has(phrase,['下落','落下','fall','falling'])?'fall':undefined;
 const numbers={'一':1,'两':2,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,one:1,two:2,three:3,four:4,five:5};
 const countMatch=phrase.match(/\d+|[一两二三四五六七八九十]|\b(one|two|three|four|five)\b/i);
 const count=has(phrase,['很多','许多','many','lots'])?12:countMatch?Math.min(24,Math.max(1,numbers[countMatch[0].toLowerCase()]??Number(countMatch[0]))):1;
 const found=Object.keys(subjects).filter(k=>has(phrase,subjects[k]));
 const located=found.map(kind=>({kind,start:Math.min(...subjects[kind].map(word=>phrase.toLowerCase().indexOf(word)).filter(i=>i>=0))})).sort((a,b)=>a.start-b.start);
 function localColour(kind){if(found.length===1)return colour;const i=located.findIndex(o=>o.kind===kind),span=phrase.slice(i?located[i-1].start:0,located[i].start);return Object.entries(colours).find(([,words])=>has(span,words))?.[0];}
 if(has(phrase,['停雨','停雪','晴天','stop rain','stop snow'])){edit.weather=null;found.splice(0,found.length);}
 edit.add=[];
 for(const kind of found){const tint=localColour(kind);if(kind==='rain'||kind==='snow'){edit.weather=kind;continue;}for(let i=0;i<count;i++){const seed=hash(phrase+kind+i);edit.add.push({kind,...(tint?{tint}:{}),colour:tint??({sun:'#ffd26d',moon:'#e7eaff',tree:'#75d6a2',sea:'#438bc3',mountain:'#5c7593',fire:'#ff9a5c'}[kind]??`hsl(${seed%360} 70% 72%)`),x:Math.max(.06,Math.min(.94,(x??(.13+(seed%740)/1000))+(i-(count-1)/2)*.035)),y:y??(['sun','moon','cloud','star','bird','balloon'].includes(kind)?.22:['mountain','sea'].includes(kind)?.67:.72),motion:motion??'still',seed});}}
 if(!found.length&&!Object.keys(edit).some(k=>k!=='add')){
 if(colour||x!==undefined||y!==undefined||motion)edit.modify={...(colour?{colour,tint:colour}:{}),...(x!==undefined?{x}:{}),...(y!==undefined?{y}:{}),...(motion?{motion}:{})};
 else {const seed=hash(phrase);edit.add=[{kind:'abstract',colour:`hsl(${seed%360} 70% 70%)`,x:.1+seed%800/1000,y:.2+(seed>>>8)%550/1000,motion:'spin',seed}];}
 }
 edits.push(edit);
 }
 return edits;
}
export function apply(scene,edits){const next=structuredClone(scene);for(const e of edits){if(e.command==='clear')Object.assign(next,initial());for(const k of ['night','speed','weather'])if(k in e)next[k]=e[k];if(e.modify&&next.objects.length)Object.assign(next.objects.at(-1),e.modify);if(e.add)next.objects.push(...e.add);}next.objects=next.objects.slice(-160);return next;}
