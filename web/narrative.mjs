import {seeded} from './av_patch.mjs';
export const mishimaSections=['Opening','November 25: Morning','Grandmother and Kimitake','Temple of the Golden Pavilion',"Osamu’s Theme",'Runaway Horses','Closing'];
export function narrativeText(title='',poem=''){return poem.trim()?poem.split(/\n+/).map(s=>s.trim()).filter(Boolean).slice(0,24):/mishima|三岛/i.test(title)?mishimaSections:[title||'Piano', 'a quiet interval', 'the space between notes'];}
export function narrativeLayer(stage){
 const canvas=document.createElement('canvas');canvas.hidden=true;canvas.style.zIndex=3;stage.append(canvas);const c=canvas.getContext('2d');let key='',figures=[],motion=0,step=0,wasOnset=false,wasCadence=false,section=0,lastAdvance=-Infinity,previousTime=0,markerText='',pendingMarker='',phraseArmed=false;
 function geometry(seed){const random=seeded(seed);return Array.from({length:24},(_,i)=>({x:.16+random()*.68,z:random(),height:.8+random()*.4,phase:random()*6.28,tone:Math.floor(50+random()*45),id:i})).sort((a,b)=>a.z-b.z);}
 function box(x,y,w,h,angle,tone){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=`rgb(${tone},${tone+3},${tone+5})`;c.fillRect(-w/2,0,w,h);c.fillStyle='rgba(255,255,255,.13)';c.beginPath();c.moveTo(w/2,0);c.lineTo(w/2+w*.3,-w*.2);c.lineTo(w/2+w*.3,h-w*.2);c.lineTo(w/2,h);c.fill();c.restore();}
 return {canvas,reset(){key='';motion=0;step=0;section=0;previousTime=0;markerText='';pendingMarker='';wasOnset=false;wasCadence=false;phraseArmed=false;},marker(text){if(text){markerText=text.slice(0,90);pendingMarker=markerText;}},draw(time,dt,seed,f={},title='',poem=''){
 const id=seed+'|'+title+'|'+poem;if(key!==id||time<previousTime){key=id;figures=geometry(seed);motion=0;step=0;section=0;lastAdvance=-Infinity;wasOnset=false;wasCadence=false;markerText=pendingMarker;phraseArmed=false;}previousTime=time;if(pendingMarker){const index=mishimaSections.findIndex(s=>s.toLowerCase().includes(pendingMarker.toLowerCase()));if(index>=0)section=index;pendingMarker='';}
 const bounds=stage.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.round(bounds.width*dpr),h=Math.round(bounds.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const dynamic=Math.max(0,Math.min(1,f.dynamics??0)),active=(f.polyphony??0)>0||dynamic>.025,tension=Math.max(0,Math.min(1,f.tension??0)),pedal=Math.max(0,Math.min(1,f.pedalWash??f.pedal??0));
 if(active)motion+=dt*(.04+tension*.2);const onset=(f.pulse??0)>.35;if(onset&&!wasOnset)step++;wasOnset=onset;
 const cadence=(f.cadence??0)>.4;if((f.phraseArc??.5)>.6)phraseArmed=true;if(((cadence&&!wasCadence)||(phraseArmed&&(f.phraseArc??.5)<.48))&&time-lastAdvance>8){section++;lastAdvance=time;phraseArmed=false;}wasCadence=cadence;
 const fragments=narrativeText(title,poem),count=4+Math.round(dynamic*12);c.fillStyle=`rgba(244,245,243,${pedal>.1?.16+(1-pedal)*.55:1})`;c.fillRect(0,0,w,h);
 const anchors=[];
 for(const person of figures.slice(0,count)){
 const scale=h*.055*person.height*(.75+person.z*.35)*(1+dynamic*.3),walking=active&&person.id===step%count,shift=walking?Math.sin(motion*6+person.phase)*.004*w:0,x=person.x*w+shift,y=h*(.62+person.z*.12),turn=walking?Math.sin(motion*4)*.2:0;
 c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='rgba(45,50,56,.075)';c.beginPath();c.ellipse(.1,.07,.65,.14,0,0,6.283);c.fill();
 // Twelve procedural cuboids: head, neck, chest, waist, two upper/lower arms, two upper/lower legs.
 const t=person.tone;box(0,-2.5,.34,.4,turn,t+7);box(0,-2.12,.12,.17,0,t);box(0,-1.98,.5,.67,turn,t);box(0,-1.32,.42,.25,0,t-4);
 for(const side of [-1,1]){const stride=walking?Math.sin(motion*7+person.phase)*.16*side:0;box(side*.33,-1.94,.15,.57,-side*.07+stride,t);box(side*.37,-1.4,.13,.49,stride,t+4);box(side*.13,-1.1,.2,.54,-stride,t-4);box(side*.14,-.57,.17,.57,stride,t-1);}c.restore();anchors.push([x,y-scale*2.55]);
 }
 c.textAlign='center';c.textBaseline='middle';c.font=`${Math.max(12*dpr,h*.021)}px Georgia,serif`;const register=Math.max(0,Math.min(1,f.register??.5));
 for(let i=0;i<Math.min(3,fragments.length);i++){const a=anchors[(i*3)%anchors.length],text=(i===0&&markerText?markerText:fragments[(section+i)%fragments.length]).slice(0,90),x=w*(.25+i*.25)+Math.sin(motion+i)*w*.012,y=h*(.28+i*.045-register*.06);c.strokeStyle='rgba(80,86,94,.25)';c.lineWidth=Math.max(.5,dpr*.5);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(x+Math.sin(motion*2+i)*tension*5,y+h*.018);c.stroke();c.fillStyle='rgba(50,55,65,.7)';c.fillText(text,x,y,w*.32);}
 return {marks:count*12,figures:count,section:fragments[section%fragments.length],motion};
 }};
}
export function performerCamera(stage){let stream=null;const video=document.createElement('video');video.muted=true;video.autoplay=true;video.playsInline=true;video.hidden=true;video.style.cssText='position:fixed;inset:0 0 auto 0;width:100%;height:38vh;object-fit:contain;filter:saturate(.55);background:#141414;z-index:4';document.body.append(video);
 function stop(){stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;video.hidden=true;stage.style.removeProperty('height');stage.style.removeProperty('margin-top');}
 return {async start(){if(stream)return;try{stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:false});video.srcObject=stream;await video.play();video.hidden=false;stage.style.height='62vh';stage.style.marginTop='38vh';}catch(e){stop();throw e;}},stop,get active(){return !!stream}};
}
