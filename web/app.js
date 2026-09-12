import {initial,parse,apply} from './parser.mjs';
import {renderer} from './renderer.mjs';
import {formPlan} from './particles.mjs';
import {microphoneAudio} from './audio.mjs';
import {liveSound} from './sound.mjs';
import {blenderLayer} from './blender.mjs';
import {works,shuffledWorks} from './works.mjs';
const $=id=>document.getElementById(id);let state=initial(),preview=null,history=[],rolling=[],timer,revision=0;
let style="fusion",hasModel=false,soundOwnsMic=false;
const micAudio=microphoneAudio(message=>{$('status').textContent=message},()=>({enabled:sound.enabled,rms:sound.rms}));
const sound=liveSound(message=>{$('status').textContent=message});
function blenderScene(){if(!['moyers','fusion','monet'].includes(style))return null;const group=formPlan(preview??state)[0];return {style,monet:$('monetBlend').checked&&style==='fusion',workStyle:{family:state.objects.length||state.weather?group.family:evolution.profile.family,palette:style==='fusion'?[evolution.seed%2?'#e5b433':'#2859cd','#657075']:group.tint?[group.tint,group.tint]:evolution.profile.colours},variation:{seed:evolution.seed},audioMood:{level:micAudio.state.level,warmth:micAudio.state.warmth}};}
const blender=blenderLayer(blenderScene,$('blenderStatus'));
const workSelect=$('work');workSelect.options[0].textContent=`全部 ${works.length} 项随机 / All styles`; for(const [i,work] of works.entries()){const option=document.createElement('option');option.value=i;option.textContent=work.name;workSelect.append(option);}
const evolution={enabled:true,selectedWork:-1,workIndex:-1,remaining:[],profile:works[0],seed:317,variant:1,effect:0,strength:.6,density:1,next:0,
 randomize(t=performance.now(),audio=null){
  const values=crypto.getRandomValues(new Uint32Array(4));
  if(this.selectedWork<0){if(!this.remaining.length)this.remaining=shuffledWorks(this.workIndex);this.workIndex=this.remaining.pop();}else this.workIndex=this.selectedWork;
  this.profile=works[this.workIndex];this.seed=values[0];this.variant=values[0]/4294967296*Math.PI*2;this.effect=this.profile.effect;
  this.strength=audio?Math.min(1,.35+audio.level*.65):.35+values[2]/4294967296*.65;
  this.density=this.profile.density*(audio?.75+audio.level*.7:.7+values[3]/4294967296*.6);
  this.trigger=audio?'voice':'timer';this.next=t+6000+values[1]%6000;
 }
};evolution.randomize();workSelect.onchange=()=>{evolution.selectedWork=Number(workSelect.value);evolution.randomize();};
const metrics={parser_ms:0,tier1_paint_ms:0,model_paint_ms:null};const view=renderer($('canvas'),()=>preview??state,()=>({style,monet:$('monetBlend').checked,hasModel:hasModel||blender.visible,evolution,sound,volume:Number($('volume').value)}),micAudio);
setInterval(()=>{$('workSource').hidden=!['moyers','fusion'].includes(style);$('workSource').href=evolution.profile.source??'https://timmoyers.com/audiovisual--live-performance.html';$('currentWork').textContent=['moyers','fusion'].includes(style)?(style==='fusion'?'Fusion / 融合 · ':'')+evolution.profile.name+' · '+(evolution.trigger==='voice'?'声音触发 / Voice':'自动变奏 / Auto'):style==='vangogh'?'Van Gogh':style==='monet'?'Monet / 印象派':'Ink';$('audioMic').textContent=micAudio.state.active||micAudio.state.pending?'停止输入 / Stop input':'仅声音 / Audio';Object.assign(metrics,view.timing);$('metrics').textContent=JSON.stringify(metrics,null,2);$('audio').textContent=JSON.stringify({source:view.audio.source,RMS:+(view.audio.rms??0).toFixed(3),centroid_Hz:Math.round(view.audio.centroid??0),pitch_Hz:Math.round(view.audio.pitch??0),onset_pulse:+(view.audio.pulse??0).toFixed(2)},null,2)},150);
function panel(){$('scene').textContent=JSON.stringify(preview??state,null,2);$('metrics').textContent=JSON.stringify(metrics,null,2);}
function save(){const a=document.createElement('a');a.download='voice-canvas.png';a.href=view.capture();a.click();}
function hideModel(){hasModel=false;document.querySelectorAll('.generated').forEach(f=>f.classList.remove('visible'));}
function undo(){preview=null;hideModel();if(history.length)state=history.pop();revision++;panel();}
function submit(text){text=text.trim().slice(0,2000);if(!text)return;const started=performance.now(),startedVisible=document.visibilityState==='visible',edits=parse(text);preview=null;
 if(edits[0]?.command==='clear')hideModel();
 if(edits[0]?.command==='save'){save();return;}if(edits[0]?.command==='undo'){undo();return;}
 history.push(structuredClone(state));history=history.slice(-40);state=apply(state,edits);revision++;metrics.parser_ms=+(performance.now()-started).toFixed(2);rolling.push(text);rolling=rolling.slice(-12);$('transcript').textContent=rolling.join('。');panel();view.afterPaint(()=>{metrics.tier1_paint_ms=startedVisible&&document.visibilityState==='visible'?+(performance.now()-started).toFixed(2):null;metrics.paint_visibility=document.visibilityState;panel();});clearTimeout(timer);timer=setTimeout(()=>requestModel(revision),400);
}
$('evolve').onchange=()=>{evolution.enabled=$('evolve').checked;};$('variation').onclick=()=>{evolution.randomize();};
$('sound').onclick=async()=>{$('sound').disabled=true;try{const enabled=await sound.toggle();if(enabled&&!micAudio.state.active&&!micAudio.state.pending){soundOwnsMic=true;micAudio.start();}else if(!enabled&&soundOwnsMic){if(!wanted)micAudio.stop();soundOwnsMic=false;}$('sound').textContent=enabled?'声音已开 / Sound ON':'开启声音 / Sound OFF';$('sound').setAttribute('aria-pressed',String(enabled));}catch(e){$('status').textContent='Sound: '+e.message;}finally{$('sound').disabled=false;}};
$('audioMic').onclick=()=>{if(micAudio.state.active||micAudio.state.pending){micAudio.stop();$('audioMic').textContent='仅声音 / Audio';}else{micAudio.start();$('audioMic').textContent='停止声音 / Stop audio';}};
$('form').onsubmit=e=>{e.preventDefault();submit($('text').value);$('text').value='';};$('undo').onclick=undo;$('clear').onclick=()=>submit('清空');$('save').onclick=save;
let backendOnline=false;let controller,activeFrame=0,modelRunning=false,pendingVersion=null,modelStarted=0;
const csp="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; img-src 'none'; font-src 'none'; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
function showHTML(html,version){if(version!==revision)return;const frames=document.querySelectorAll('.generated'),next=1-activeFrame,frame=frames[next];frame.onload=()=>{if(version!==revision)return;frame.classList.add('visible');frames[activeFrame].classList.remove('visible');activeFrame=next;hasModel=true;metrics.model_paint_ms=document.visibilityState==='visible'?+(performance.now()-modelStarted).toFixed(2):null;panel();};frame.srcdoc='<!doctype html><meta http-equiv="Content-Security-Policy" content="'+csp+'"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{max-width:100%;max-height:100%}</style>'+html;}
async function requestModel(version){
 if(!backendOnline){$('model').textContent='后端离线 / Backend offline · 实时画面继续';return;}
 if(modelRunning){pendingVersion=version;return;}modelRunning=true;modelStarted=performance.now();controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);let chars=0;
 try{const r=await fetch('./api/scene',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcript:rolling.join('。').slice(-4000),scene:{...state,style,monet:$('monetBlend').checked&&style==='fusion',audioMood:{level:micAudio.state.level,warmth:micAudio.state.warmth},work:style==='moyers'?evolution.profile.name:undefined,workStyle:style==='moyers'?{brief:evolution.profile.brief,geometry:evolution.profile.geometry,family:evolution.profile.family,palette:evolution.profile.colours,effect:evolution.effect,tempo:evolution.profile.tempo}:undefined,variation:{seed:evolution.seed,effect:evolution.effect}}}),signal:controller.signal});if(!r.ok)throw Error(`HTTP ${r.status}`);const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';
 while(true){const {value,done}=await reader.read();buffer+=decoder.decode(value??new Uint8Array(),{stream:!done});let newline;while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);if(!line.trim())continue;const data=JSON.parse(line);if(version!==revision)continue;if(data.delta){chars+=data.delta.length;$('model').textContent=`GPT-6 绘制中 / Painting · ${chars} chars`;if(data.first_output_ms!==null)metrics.first_output_ms=data.first_output_ms;}if(data.status)$('model').textContent=data.status;if(data.html){showHTML(data.html,version);$('model').textContent=data.backend+(data.truncated?' · 保留渐进画面 / Kept partial':data.partial?' · 渐进绘制 / Progressive':' · 画面已更新 / Updated');Object.assign(metrics,data.latency);}panel();}if(done)break;}
 }catch(e){if(version===revision)$('model').textContent='模型不可用，画布继续 / Model unavailable; canvas stays live';}finally{clearTimeout(timeout);modelRunning=false;if(pendingVersion!==null){const next=pendingVersion;pendingVersion=null;if(next===revision)requestModel(next);}}
}
$('style').onchange=()=>{style=$('style').value;workSelect.disabled=!['moyers','fusion'].includes(style);revision++;hasModel=false;document.querySelectorAll('.generated').forEach(f=>f.classList.remove('visible'));requestModel(revision);};
fetch('./api/status').then(r=>{if(!r.ok)throw Error('offline');return r.json()}).then(d=>{backendOnline=true;$('model').textContent=d.status}).catch(()=>{$('model').textContent='后端离线 / Backend offline · 实时画面继续'});
const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;let recognition=null,wanted=false,restartTimer,backoff=300,interimTimer,lastPreview='';
function stop(){micAudio.stop();wanted=false;clearTimeout(restartTimer);clearTimeout(interimTimer);recognition?.abort();preview=null;panel();$('mic').textContent='开始说话 · Listen';}
function listen(){if(!Speech){wanted=false;$('mic').textContent='开始说话 · Listen';$('status').textContent='此浏览器不支持语音，请输入文字 / Speech unavailable; type below';return;}clearTimeout(restartTimer);const r=new Speech();recognition=r;r.lang=$('language').value;r.continuous=true;r.interimResults=true;
 r.onstart=()=>{backoff=300;$('status').textContent='聆听中 / Listening';};
 r.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const text=e.results[i][0].transcript;if(e.results[i].isFinal){clearTimeout(interimTimer);lastPreview='';submit(text);}else interim+=text;}
 if(interim&&interim!==lastPreview){lastPreview=interim;clearTimeout(interimTimer);interimTimer=setTimeout(()=>{preview=apply(state,parse(interim).filter(e=>!e.command));$('transcript').textContent=rolling.join('。')+' … '+interim;panel();},90);}};
 r.onerror=e=>{$('status').textContent=`语音 / Speech: ${e.error}`;if(['not-allowed','service-not-allowed','audio-capture'].includes(e.error))stop();else if(e.error==='language-not-supported'&&r.lang!=='en-US')$('language').value='en-US';else if(e.error==='network')backoff=5000;};
 r.onend=()=>{clearTimeout(interimTimer);preview=null;lastPreview='';panel();if(wanted){$('status').textContent='重新连接麦克风 / Reconnecting microphone';restartTimer=setTimeout(listen,backoff);backoff=Math.min(5000,backoff*2);}};
 try{r.start();}catch(e){$('status').textContent=e.message;stop();}}
$('mic').onclick=()=>{if(wanted){stop();$('status').textContent='已暂停 / Paused';}else {micAudio.start();wanted=true;$('mic').textContent='停止 · Stop';listen();}};
$('language').onchange=()=>{if(wanted)recognition?.abort();};window.addEventListener('pagehide',()=>{stop();sound.stop()});panel();
function performanceMode(){const enabled=document.body.classList.toggle('performance');if(enabled)document.documentElement.requestFullscreen?.().catch(()=>{});else if(document.fullscreenElement)document.exitFullscreen?.();}
$('perform').onclick=performanceMode;document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='p'&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))performanceMode();});
window.voice={evolution,get visualAudio(){return view.audio},get soundEnabled(){return sound.enabled},audio:micAudio.state,get timing(){return view.timing},submit,get state(){return state},get frames(){return view.frames}};

$('soundMode').onchange=()=>sound.setMode($('soundMode').value);

$('monetBlend').onchange=()=>{revision++;hideModel();requestModel(revision);};
