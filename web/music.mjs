// Shared musical features for timestamped MIDI and spectral piano input.
export const noteNames=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const profiles={major:[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],minor:[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17]};
export function harmony(chroma,keyChroma=chroma){
 const total=chroma.reduce((a,b)=>a+b,0);if(total<1e-6){if(keyChroma.reduce((a,b)=>a+b,0)>1e-6){const prior=harmony(keyChroma);return {...prior,quality:'silence',confidence:0,tension:0,dissonance:0};}return {root:0,key:0,mode:'major',quality:'silence',confidence:0,tension:0,dissonance:0};}
 let best=-Infinity,key=0,mode='major';for(let root=0;root<12;root++)for(const [name,profile] of Object.entries(profiles)){const mean=profile.reduce((a,b)=>a+b)/12,score=keyChroma.reduce((sum,x,i)=>sum+x*(profile[(i-root+12)%12]-mean),0);if(score>best){best=score;key=root;mode=name;}}
 let chordScore=-Infinity,root=0,quality='unknown';for(let r=0;r<12;r++)for(const [q,intervals] of Object.entries({major:[0,4,7],minor:[0,3,7],dim:[0,3,6],aug:[0,4,8],dominant:[0,4,7,10]})){const inside=intervals.reduce((sum,k)=>sum+chroma[(r+k)%12],0),missing=intervals.filter(k=>chroma[(r+k)%12]<total*.045).length,score=inside/total-.1*missing-.02*intervals.length+(chroma[r]/total)*.04;if(score>chordScore){chordScore=score;root=r;quality=q;}}
 let dis=0,pairs=0;for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){const w=chroma[i]*chroma[j],d=j-i;pairs+=w;if([1,2,6,10,11].includes(d))dis+=w;}
 const dissonance=dis/(pairs||1),fifths=((root-key+12)*7)%12,distance=Math.min(fifths,12-fifths)/6;
 return {root,key,mode,quality,confidence:clamp(chordScore),dissonance,tension:clamp(distance*.4+dissonance*.45+(quality==='dominant'?.2:0))};
}
export function spectrumChroma(spectrum,sampleRate,fftSize=spectrum.length*2){
 const chroma=new Array(12).fill(0);let bass=0,treble=0,total=0,weighted=0;
 for(let i=2;i<spectrum.length-1;i++){const hz=i*sampleRate/fftSize;if(hz<27.5||hz>4200)continue;const power=10**(spectrum[i]/10);if(power<1e-9)continue;total+=power;weighted+=power*hz;if(hz<261.63)bass+=power;else treble+=power;if(spectrum[i]<spectrum[i-1]||spectrum[i]<spectrum[i+1])continue;const midi=69+12*Math.log2(hz/440),n=Math.round(midi);chroma[(n%12+12)%12]+=Math.sqrt(power)*Math.max(0,1-Math.abs(midi-n)*1.6);}
 const max=Math.max(...chroma,1e-9);return {chroma:chroma.map(v=>v/max),bass:bass/(total||1),treble:treble/(total||1),brightness:clamp((weighted/(total||1)-250)/3500)};
}
export function musicFeatures(){
 const notes=new Map(),pedals=new Map(),onsets=[],history=new Array(12).fill(0);let last=0,lastOnset=-100,env=0,slow=0,previousTension=0,previousRoot=-1,pulse=0,cadence=0,phrase=0,pedalWash=0,audioInput=null,lastInput=-Infinity;
 function midi(data,time){const command=data[0]&240,ch=data[0]&15,n=data[1],velocity=data[2]??0,id=ch*128+n;lastInput=time;
  if(command===144&&velocity){notes.set(id,{n,ch,velocity:velocity/127,down:true,time});onsets.push(time);pulse=1;lastOnset=time;}
  else if(command===128||(command===144&&!velocity)){const note=notes.get(id);if(note){note.down=false;if(!(pedals.get(ch)>0))notes.delete(id);}}
  else if(command===176&&n===64){pedals.set(ch,velocity>=64?velocity/127:0);if(velocity<64)for(const [id,note] of notes)if(note.ch===ch&&!note.down)notes.delete(id);}
  else if(command===176&&[120,123].includes(n))for(const [id,note] of notes)if(note.ch===ch)notes.delete(id);
 }
 function audio(input,time){audioInput={...input,time};if(input.onset&&time-lastOnset>.1){onsets.push(time);pulse=1;lastOnset=time;}}
 function update(time){const dt=clamp(time-last,.001,.1);last=time;while(onsets.length&&onsets[0]<time-2)onsets.shift();const chroma=new Array(12).fill(0);let dynamics=0,bass=0,treble=0,register=0,weight=0;
  for(const note of notes.values()){const v=note.velocity*(note.down?1:Math.exp(-(time-note.time)*.18));chroma[note.n%12]+=v;dynamics=Math.max(dynamics,v);register+=note.n*v;weight+=v;if(note.n<60)bass+=v;else treble+=v;}
  const useAudio=audioInput&&time-audioInput.time<.2;if(useAudio){for(let i=0;i<12;i++)chroma[i]+=audioInput.chroma[i];dynamics=Math.max(dynamics,clamp(audioInput.rms*6));bass+=audioInput.bass;treble+=audioInput.treble;}
  const sum=chroma.reduce((a,b)=>a+b,0);for(let i=0;i<12;i++)history[i]=history[i]*Math.exp(-dt/8)+(chroma[i]/(sum||1))*dt;
  const h=harmony(chroma,history);env+=(dynamics-env)*(1-Math.exp(-dt/.35));slow+=(env-slow)*(1-Math.exp(-dt/4));phrase+=(env-phrase)*(1-Math.exp(-dt/2));
  if(previousTension>.35&&h.tension<.25&&h.root===h.key&&h.root!==previousRoot&&pulse>.2)cadence=1;previousTension=h.tension;previousRoot=h.root;
  const pedal=Math.max(0,...pedals.values(),useAudio&&!notes.size?clamp(time-lastOnset-.2)*dynamics:0);pedalWash=Math.max(pedal,pedalWash*Math.exp(-dt/2));const polyphony=Math.max(notes.size,useAudio?audioInput.chroma.filter(v=>v>.35).length:0);
  const result={...h,chroma,dynamics,phraseEnvelope:env,phraseArc:clamp(.5+(env-slow)*2),phraseSeconds:2+clamp(1-Math.abs(env-slow)*3)*6,register:weight?clamp((register/weight-36)/60):treble/(bass+treble||1),bass:bass/(bass+treble||1),treble:treble/(bass+treble||1),polyphony,polyphonyEstimated:!!useAudio&&!notes.size,notesPerSecond:onsets.length/2,density:clamp(polyphony/12+onsets.length/20),pedal,pedalWash,brightness:useAudio?audioInput.brightness:clamp(dynamics*.6+treble/(bass+treble||1)*.4),pulse,cadence,source:useAudio?notes.size?'midi+audio':'audio':'midi',lastInput};
  pulse*=Math.exp(-dt*7);cadence*=Math.exp(-dt*2);return result;
 }
 function reset(){notes.clear();pedals.clear();onsets.length=0;history.fill(0);env=slow=phrase=pulse=cadence=pedalWash=0;previousTension=0;previousRoot=-1;audioInput=null;last=0;lastInput=-Infinity;}
 return {midi,audio,update,reset,get notes(){return notes}};
}
