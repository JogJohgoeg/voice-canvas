export function features(samples,spectrum,sampleRate,previous={}){
 let sum=0,weighted=0,total=0;const bands=new Array(8).fill(0);for(const v of samples)sum+=v*v;
 const rms=Math.sqrt(sum/samples.length);
 for(let i=1;i<spectrum.length;i++){const power=10**(spectrum[i]/10);total+=power;weighted+=power*i*sampleRate/(spectrum.length*2);bands[Math.min(7,Math.floor(i/spectrum.length*8))]+=power;}
 const centroid=total>1e-8?weighted/total:0;
 const flux=previous.bands?bands.reduce((sum,v,i)=>sum+Math.max(0,v-previous.bands[i]),0)/(total||1):0;
 // ponytail: autocorrelation gives rough monophonic pitch, not polyphonic transcription.
 let pitch=0,best=0;
 if(rms>.008){const low=Math.floor(sampleRate/900),high=Math.min(Math.floor(sampleRate/70),samples.length>>1);for(let lag=low;lag<=high;lag+=2){let corr=0,energy=0,other=0;for(let i=0;i<samples.length-high;i+=3){corr+=samples[i]*samples[i+lag];energy+=samples[i]**2;other+=samples[i+lag]**2;}corr/=Math.sqrt(energy*other)||1;if(corr>best+.008){best=corr;pitch=sampleRate/lag;}}if(best<.7)pitch=0;}
 return {rms,centroid,pitch,bands,flux,onset:(rms>.025&&rms>(previous.rms??0)*1.65)||(rms>.012&&flux>.45),level:Math.min(1,rms*7),warmth:Math.min(1,Math.max(0,(centroid-250)/4500))};
}
export function microphoneAudio(onStatus,output=()=>({enabled:false,rms:0})){
 let context,stream,analyser,samples,spectrum,last=0,lastOnset=0,previous={},generation=0,targetLevel=0,targetWarmth=0;
 const state={rms:0,centroid:0,pitch:0,level:0,warmth:0,pulse:0,active:false,pending:false,ducked:false};
 async function start(){
  if(state.active||state.pending)return;const requestGeneration=++generation;state.pending=true;
  try{
   const acquired=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}});
   if(requestGeneration!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
   stream=acquired;const created=new AudioContext();context=created;await created.resume();
   if(requestGeneration!==generation){if(created.state!=='closed')await created.close();return;}
   analyser=created.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.55;created.createMediaStreamSource(stream).connect(analyser);samples=new Float32Array(analyser.fftSize);spectrum=new Float32Array(analyser.frequencyBinCount);previous={};state.active=true;
   stream.getTracks().forEach(t=>t.onended=()=>{stop();onStatus('麦克风已断开 / Microphone disconnected');});
  }catch(e){if(requestGeneration===generation){stop();onStatus('音频 / Audio: '+e.name);}}
  finally{if(requestGeneration===generation)state.pending=false;}
 }
 function stop(){generation++;state.pending=false;state.active=false;stream?.getTracks().forEach(t=>t.stop());stream=null;context?.close();context=null;analyser=null;targetLevel=0;targetWarmth=0;}
 function update(t,dt){
  state.pulse*=Math.exp(-dt*4);
  if(analyser&&t-last>32){last=t;analyser.getFloatTimeDomainData(samples);analyser.getFloatFrequencyData(spectrum);const next=features(samples,spectrum,context.sampleRate,previous),speaker=output(),audibleVoice=!speaker.enabled||next.rms>Math.max(.012,speaker.rms*1.3);state.ducked=speaker.enabled;if(next.onset&&audibleVoice&&t-lastOnset>150){state.pulse=1;lastOnset=t;}previous=next;for(const key of ['rms','centroid'])state[key]=next[key];state.pitch=audibleVoice?next.pitch:0;targetLevel=audibleVoice?next.level*(speaker.enabled?.55:1):0;targetWarmth=audibleVoice?next.warmth:0;}
  else if(!analyser){state.rms=0;state.centroid=0;state.pitch=0;}
  state.level+=(targetLevel-state.level)*(1-Math.exp(-dt*10));state.warmth+=(targetWarmth-state.warmth)*(1-Math.exp(-dt*6));return state;
 }
 return {start,stop,update,state};
}
