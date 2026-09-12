import {seeded} from './av_patch.mjs';
// One 32-bar miniature: introduction, theme, development, contrast, return, coda.
// The next miniature changes the theme, while a seed reproduces the whole recital.
export function performerStep(seed,step,params,parts=3,variation=0){
 const bar=Math.floor(step/8),localBar=bar%32,cycle=Math.floor(bar/32),tick=step%8;
 const random=seeded(seed^Math.imul(cycle+1,7919)),motif=[0,2,1,4,2,1,3,0].map((n,i)=>i===0||i===7?n:n+Math.floor(random()*3)-1);
 const section=localBar<2?0:localBar<10?1:localBar<18?2:localBar<24?3:localBar<30?4:5;
 const names=['序奏 / Introduction','主题 / Theme','发展 / Development','对比 / Contrast','回归 / Return','尾声 / Coda'];
 const harmony=[[0,4],[0,3,5,4,0,3,4,0],[5,2,4,0,3,5,4,4],[3,6,3,5,4,4],[0,3,5,4,4,0],[4,0]][section];
 const starts=[0,2,10,18,24,30],phraseBar=localBar-starts[section],degree=harmony[phraseBar%harmony.length];
 const scale=i=>params.scale[((i%7)+7)%7]+12*Math.floor(i/7),chord=degree===4?[7,11,14]:[scale(degree),scale(degree+2),scale(degree+4)];
 const arc=Math.sin(Math.PI*(phraseBar%4+tick/8)/4),energy=[.38,.64,.85,.48,.76,.42][section]*(.8+.2*arc);
 const notes=[],add=(midi,strength,part,delay=0,duration=.6)=>notes.push({midi:Math.max(21,Math.min(108,midi)),strength:strength*energy,part,pan:part==='bass'?-.3:part==='treble'?.3:0,delay,duration,decay:2.8});
 const rest=section===5&&localBar===31&&tick>0;
 if(!rest){
  if(parts>1&&tick%4===0)add(params.root+chord[0],.8,'bass',0,1.5);
  if(parts>2&&section!==0&&tick%2===(section===2?0:1))add(params.root+12+chord[(tick+phraseBar+variation)%3],.45,'middle',.012,.7);
  if(section===0?tick===0:tick%2===0||section===2&&tick===5){
   let d=motif[Math.floor(tick/2)+(phraseBar%2)*4];
   if(section===2)d=(phraseBar%2?-d:d)+2;
   if(section===3)d=4-d;if(section===2&&variation%2)d+=2;
   if(tick===0||section===5)d=null;
   const pitch=d===null?chord[section===5?0:phraseBar%3]:scale(degree+d);
   add(params.root+(section===3?12:24)+pitch,.95,'treble',.018+random()*.012,section===5?2.5:.8);
  }
 }
 return {section:names[section],cycle,bar:localBar+1,degree,energy,notes,pedal:!rest&&tick<7,cadence:localBar===31&&tick===0,motif,variation};
}
export function midiPerformer(status=()=>{}){
 let access=null,output=null;const active=new Set();
 function stop(){if(!output)return;try{output.clear();output.send([0xb0,64,0]);for(const note of active)output.send([0x80,note,0]);output.send([0xb0,123,0]);}catch{}active.clear();}
 return {async discover(){if(!navigator.requestMIDIAccess)throw Error('Web MIDI unavailable / 此浏览器不支持 MIDI');access??=await navigator.requestMIDIAccess({sysex:false});access.onstatechange=()=>{if(output?.state==='disconnected'){stop();output=null;status('MIDI disconnected / 已断开');}};return [...access.outputs.values()].filter(p=>p.state==='connected').map(p=>({id:p.id,name:p.name}));},
 raw(data){if(!output)return;const kind=data[0]&240;if(![128,144,176].includes(kind))return;try{output.send([kind,data[1],data[2]??0]);if(kind===144&&data[2])active.add(data[1]);}catch(e){stop();output=null;status(e.message);}},select(id){stop();output=access?.outputs.get(id)??null;status(output?'MIDI: '+output.name:'MIDI OFF');},
 send(event,context,epoch){if(!output||context.state!=='running')return;const at=performance.now()+Math.max(0,(epoch+event.time-context.currentTime)*1000);try{if(event.kind==='pedal'){output.send([0xb0,64,event.down?90:0],at);return;}if(event.kind!=='piano')return;const velocity=Math.max(1,Math.min(110,Math.round(event.strength*110)));output.send([0x90,event.midi,velocity],at);output.send([0x80,event.midi,0],at+(event.duration??.7)*1000);active.add(event.midi);}catch(e){stop();output=null;status(e.message);}},stop,get connected(){return !!output}};
}
