import {particleField,formPlan,particleColour} from './particles.mjs';
const TAU=Math.PI*2;
const palette={blue:'#234eb2',deep:'#152c6c',yellow:'#f7cb48',ochre:'#bc8b37',green:'#193e37',orange:'#e98735',pale:'#e5d7a1'};
export function renderer(canvas,getScene,getOptions=()=>({}),audio={update:()=>({level:0,warmth:0,pulse:0,pitch:0})}){
 const c=canvas.getContext('2d');let particles;function initParticles(){try{particles=particleField(canvas.parentElement)}catch(e){document.getElementById('particles')?.remove();particles=null;console.warn('Particle renderer unavailable',e.message)}}initParticles();let particleStats={},afterPaint=null,lastAudio={},previousVoicePulse=0,lastVoiceVariation=0;let previous=0,night=0,frames=0,clock=0;const poses=new Map(),frameTimes=[];let texture=null,textureKey='';document.addEventListener('visibilitychange',()=>{frameTimes.length=0;previous=0;});
 function stroke(x,y,length,angle,width,colour,bend=.2){const co=Math.cos(angle),si=Math.sin(angle),dx=co*length/2,dy=si*length/2;c.strokeStyle=colour;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x-dx,y-dy);c.quadraticCurveTo(x-si*length*bend,y+co*length*bend,x+dx,y+dy);c.stroke();}
 function polygonPath(points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
 function outline(kind,r){
 c.beginPath();
 if(kind==='star')polygonPath(Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,rr=r*(i%2?.45:1);return [Math.cos(a)*rr,Math.sin(a)*rr]}));
 else if(kind==='moon'){c.arc(0,0,r,-Math.PI/2,Math.PI/2);c.quadraticCurveTo(-r*.4,0,0,-r);}
 else if(['sun','flower','heart','abstract'].includes(kind))c.ellipse(0,0,r,r,0,0,TAU);
 else if(kind==='mountain')polygonPath([[-r*2.5,r],[0,-r*2.5],[r*2.5,r]]);
 else if(kind==='tree')polygonPath([[-r*.25,r*1.7],[-r*.4,r*.5],[-r,-r*.2],[-r*.5,-r*1.2],[0,-r*2.5],[r*.5,-r*1.2],[r,-r*.2],[r*.4,r*.5],[r*.25,r*1.7]]);
 else if(kind==='house')polygonPath([[-r,r],[-r,-r*.5],[0,-r*1.5],[r,-r*.5],[r,r]]);
 else if(kind==='cloud'){c.ellipse(-r*.7,0,r*.9,r*.6,0,0,TAU);c.ellipse(r*.3,-r*.2,r,r*.8,0,0,TAU);}
 else if(kind==='car')polygonPath([[-r*1.5,r*.5],[-r*1.5,0],[-r*.7,-r*.2],[-r*.4,-r*.8],[r*.6,-r*.8],[r,r*.1],[r*1.5,r*.2],[r*1.5,r*.5]]);
 else if(kind==='bird')polygonPath([[-r*1.6,-r*.7],[-r*.5,0],[0,-r*.2],[r*.5,0],[r*1.6,-r*.7],[r*.7,r*.4],[0,r*.15],[-r*.7,r*.4]]);
 else if(kind==='cat'||kind==='dog'){c.ellipse(0,r*.3,r*.6,r*.8,0,0,TAU);c.ellipse(0,-r*.5,r*.6,r*.55,0,0,TAU);if(kind==='cat'){polygonPath([[-r*.55,-r*.6],[-r*.55,-r*1.3],[0,-r*.8],[r*.55,-r*1.3],[r*.55,-r*.6]]);}}
 else if(kind==='person'){c.arc(0,-r,r*.35,0,TAU);c.rect(-r*.25,-r*.5,r*.5,r*1.3);}
 else if(kind==='fire')polygonPath([[-r*.7,r],[r*.7,r],[r*.9,0],[r*.15,-r*1.7],[-r*.2,-r*.3],[-r*.6,-r*.8]]);
 else if(kind==='fish'){c.ellipse(0,0,r,r*.5,0,0,TAU);polygonPath([[r*.5,0],[r*1.5,-r*.6],[r*1.5,r*.6]]);}
 else c.ellipse(0,0,r*.75,r,0,0,TAU);
 }
 function colour(base,options,a,i){if(options.style==='ink')return i%3?'#203139':'#bdc6bd';return i%5===0?(a.warmth>.42?palette.yellow:palette.blue):base;}
 function fallback(scene,a,options,time){
  // ponytail: lower-density CPU field keeps Moyers alive when WebGL is unavailable.
  const w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=w;canvas.height=h;c.fillStyle='#000';c.fillRect(0,0,w,h);c.globalCompositeOperation='lighter';
  const plan=formPlan(scene);if(!scene.objects.length&&!scene.weather)plan[0].family=options.evolution?.profile?.family??1;
  for(const [groupIndex,group] of plan.entries()){
   const rgb=particleColour(group,a.warmth),base=options.evolution?.profile?.colours[groupIndex%2];c.fillStyle=group.tint??base??`rgb(${rgb.map(v=>Math.round(v*255)).join(',')})`;
   const count=Math.floor(900/plan.length),size=Math.min(w,h)*.32*(1+.1*Math.sin(time*.9)+a.level*.3);
   for(let i=0;i<count;i++){const theta=i*2.39996,v=(i*.414214)%1,r=size*(.28+.45*v+.1*Math.sin(theta*4+time)),y=group.family===1?(v-.5)*size*3:Math.cos(theta)*r*(group.family===4?1:1.4),x=Math.abs(Math.sin(theta)*r)+Math.sin(y*.03+time)*size*.04;const dot=1+(i%3)*.4+a.pulse;c.globalAlpha=.2+(i%7)/12;for(const sign of [-1,1]){if(options.style==='fusion')stroke(w*.5+sign*x,h*.5+y,5+i%8,Math.atan2(y,sign*x)+Math.PI/2,1+a.level*2,i%7?'#777d80':options.evolution.seed%2?'#d3a12c':'#2f60c6');else c.fillRect(w*.5+sign*x,h*.5+y,dot,dot);}}
  }
  c.globalAlpha=1;c.globalCompositeOperation='source-over';particleStats={backend:'canvas2d-fallback',particles:1800,family:plan[0].family,families:plan.map(g=>g.family)};
 }
 function frame(t){const dt=Math.min(.05,(t-previous)/1000||.016);if(previous)frameTimes.push(t-previous);if(frameTimes.length>180)frameTimes.shift();previous=t;frames++;const scene=getScene(),options=getOptions(),microphone=audio.update(t,dt),synth=options.sound?.enabled?options.sound.sample(t,dt):null,a=microphone.active?microphone:synth??microphone;lastAudio={...a,source:microphone.active?'microphone':synth?'synthesis':'idle'};if(options.evolution?.enabled&&microphone.active&&microphone.pulse>.65&&previousVoicePulse<=.65&&t-lastVoiceVariation>650){options.evolution.randomize(t,microphone);lastVoiceVariation=t;}previousVoicePulse=microphone.pulse;if(options.evolution?.enabled&&t>=options.evolution.next){options.evolution.randomize(t);}options.sound?.update(t/1000,a,particleStats.family??1,options.evolution?.variant??0,options.volume??.12,options.evolution?.profile?.sound??options.evolution?.effect??0);clock+=dt*scene.speed*(.5+a.level*3);if(particles?.needsRebuild){particles.canvas.remove();initParticles();}const useParticles=['moyers','fusion'].includes(options.style)&&particles?.available;canvas.style.visibility=useParticles?'hidden':'visible';if(particles)particles.canvas.style.display=useParticles?'block':'none';if(useParticles){particleStats=particles.draw(clock,dt,scene,a,options.hasModel,options.evolution??{},options.style)??{};if(afterPaint){const done=afterPaint;afterPaint=null;done();}requestAnimationFrame(frame);return;}if(['moyers','fusion'].includes(options.style)){fallback(scene,a,options,clock);if(afterPaint){const done=afterPaint;afterPaint=null;done();}requestAnimationFrame(frame);return;}particleStats={backend:'canvas2d',particles:0,family:null,families:[]};const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);night+=(Number(scene.night)-night)*Math.min(1,dt*4);c.globalAlpha=options.hasModel?.2:1;c.fillStyle=options.style==='ink'?'#d6d2bd':night>.5?'#101e49':'#244683';c.fillRect(0,0,w,h);c.globalAlpha=1;
 // Fixed stroke budget; audio changes their flow, not the amount of work per frame.
 const skyAlpha=options.hasModel?.27:.82;c.globalAlpha=skyAlpha;
 for(let i=0;i<1050;i++){const x=(i*137.507)%w,y=(i*83.73)%(h*.81),cx=w*(.25+.05*Math.sin(clock*.1)),cy=h*.32;const angle=Math.atan2(y-cy,x-cx)+Math.PI/2+.25*Math.sin(clock*.3+i);const near=Math.hypot((x-cx)/w,(y-cy)/h);stroke(x+Math.sin(clock*.3+i)*3,y+Math.cos(clock*.3+i)*2,13+i%20,angle,(2.7+i%3)*(1+a.level),options.style==='ink'?(i%3?'#69797e':'#e3decb'):i%7===0?palette.ochre:i%5===0?(a.warmth>.4?palette.yellow:'#6c97ce'):i%3?palette.blue:palette.deep,.15+near*.15);}
 for(let spiral=0;spiral<3;spiral++){const cx=w*(.22+spiral*.3),cy=h*(.25+(spiral%2)*.13);for(let i=0;i<58;i++){const angle=i*.24+clock*.15,rad=(6+i*1.15)*(Math.min(w,h)/600);stroke(cx+Math.cos(angle)*rad,cy+Math.sin(angle)*rad*.57,8+i*.11,angle+Math.PI/2,2+a.level*4,options.style==='ink'?'#748785':i%5===0?palette.yellow:'#7d9bcc',.4);}}
 c.globalAlpha=options.hasModel?.3:1;c.fillStyle=options.style==='ink'?'#9baba0':palette.green;c.fillRect(0,h*.81,w,h*.19);for(let i=0;i<120;i++)stroke(i*139%w,h*.82+(i*51)%(h*.18),16+i%19,-.1+Math.sin(i+clock*.4)*.25,3+a.level*3,options.style==='ink'?'#6c8176':i%3?palette.ochre:palette.green,.2);c.globalAlpha=1;
 const active=new Set();const ordered=[...scene.objects].sort((a,b)=>Number(!['sea','mountain'].includes(a.kind))-Number(!['sea','mountain'].includes(b.kind)));
 for(const [index,o] of ordered.entries()){
 const key=o.seed+':'+o.kind+':'+index;active.add(key);const p=poses.get(key)??{x:o.x,y:o.y,alpha:0};p.x+=(o.x-p.x)*dt*6;p.y+=(o.y-p.y)*dt*6;p.alpha=Math.min(1,p.alpha+dt*4);poses.set(key,p);let x=p.x*w,y=p.y*h;const size=Math.min(w,h)*.07;
 if(o.motion==='fly'){x+=Math.sin(clock+o.seed)*w*.045;y+=Math.cos(clock*1.3+o.seed)*h*.035;}if(o.motion==='fall')y=((p.y+clock*.1)%1)*h;
 c.save();c.globalAlpha=p.alpha;c.translate(x,y);if(o.motion==='spin')c.rotate(clock*.6);
 const base=options.style==='ink'?'#354b4a':o.colour;
 if(o.kind==='sea'){for(let i=0;i<95;i++)stroke((i*157%w)-x,(i*29)%(h*.26),20+i%23,Math.sin(clock*.4+i)*.12,4+a.level*4,colour(i%3?palette.blue:palette.pale,options,a,i),.3);c.restore();continue;}
 if(['sun','moon','star','fire'].includes(o.kind)){const haloBudget=Math.max(8,Math.min(64,Math.floor(900/scene.objects.length))),ringSize=Math.min(32,haloBudget);for(let i=0;i<haloBudget;i++){const angle=i*TAU/ringSize+clock*.05,rad=size*(1.2+Math.floor(i/ringSize)*.42+a.pulse*.25+(a.pitch?Math.log2(a.pitch/110)*.04:0));stroke(Math.cos(angle)*rad,Math.sin(angle)*rad,size*.24,angle+Math.PI/2,2+a.level*3,colour(i%2?palette.ochre:palette.yellow,options,a,i),.35);}}
 outline(o.kind,size);c.fillStyle=base;c.fill();c.strokeStyle=options.style==='ink'?'#152c31':palette.deep;c.lineWidth=3;c.stroke();c.save();outline(o.kind,size);c.clip();
 const budget=Math.max(8,Math.min(160,Math.floor(2200/scene.objects.length)));for(let i=0;i<budget;i++){const xx=((i*37+o.seed%13)%100/100-.5)*size*(o.kind==='mountain'?5:2.3),yy=((i*61)%100/100-.5)*size*(o.kind==='tree'?4.5:3);let angle=['tree','person','fire'].includes(o.kind)?-Math.PI/2+Math.sin(i+clock*.3)*.16:['house','car'].includes(o.kind)?(i%2?0:Math.PI/2):Math.atan2(yy,xx)+Math.PI/2;stroke(xx+Math.sin(clock*.4+i),yy,size*(.2+i%5*.03),angle,2+i%3+a.level*3,colour(i%4?base:palette.ochre,options,a,i),.3);if(i%3===0)stroke(xx,yy-2,size*.18,angle,1,'#e4cb85',.3);}c.restore();
 // Recognizable details are painted strokes too, never emoji or bitmap assets.
 if(o.kind==='house'){stroke(-size*.4,0,size*.3,0,5,palette.yellow);stroke(size*.4,0,size*.3,0,5,palette.yellow);stroke(0,size*.65,size*.65,Math.PI/2,size*.28,palette.deep);}
 if(o.kind==='cat'||o.kind==='dog'){for(const sign of [-1,1]){stroke(sign*size*.23,-size*.55,size*.15,0,3,palette.yellow);stroke(sign*size*.5,size,size*.5,Math.PI/2,5,base);}stroke(size*.7,size*.45,size*.8,-1,6,base,.6);}
 if(o.kind==='car')for(const sign of [-1,1])stroke(sign*size*.9,size*.5,size*.3,0,size*.3,palette.deep,.5);
 if(o.kind==='person'){for(const sign of [-1,1]){stroke(sign*size*.3,size,size*.7,Math.PI/2+sign*.35,6,base);stroke(sign*size*.45,0,size*.75,sign*.7,5,base);}}
 if(o.kind==='balloon')stroke(0,size*1.8,size*1.5,Math.PI/2,2,palette.pale,.2);
 c.restore();}
 for(const key of poses.keys())if(!active.has(key))poses.delete(key);
 if(scene.weather)for(let i=0;i<100;i++){const x=(i*137.51+clock*15)%w,y=(i*71.9+clock*(scene.weather==='rain'?400:65))%h;stroke(x,y,scene.weather==='rain'?13:4,1.8,scene.weather==='rain'?2:4,'#ccdbe2',.2);}
 if(a.pulse>.03){c.globalAlpha=a.pulse*.7;for(let i=0;i<36;i++){const angle=i*TAU/36+clock,rad=(1-a.pulse)*Math.min(w,h)*.55;stroke(w*.5+Math.cos(angle)*rad,h*.45+Math.sin(angle)*rad,12,angle,2+a.pulse*6,colour(palette.yellow,options,a,i),.3);}c.globalAlpha=1;}
 const tk=w+':'+h;if(textureKey!==tk){textureKey=tk;texture=document.createElement('canvas');texture.width=w;texture.height=h;const tc=texture.getContext('2d');for(let i=0;i<2400;i++){tc.fillStyle=i%2?'#fff2cc12':'#0917281a';tc.fillRect(i*139.71%w,i*53.37%h,1+i%3,1);}}
 c.drawImage(texture,0,0,w,h);if(afterPaint){const done=afterPaint;afterPaint=null;done();}requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);return {get audio(){return lastAudio},afterPaint(callback){afterPaint=callback},capture(){const front=['moyers','fusion'].includes(getOptions().style)&&particles?.available?particles.canvas:canvas,videos=[...document.querySelectorAll('video.blender')].filter(v=>v.readyState>=2&&Number(getComputedStyle(v).opacity)>0);if(!videos.length||!['moyers','fusion'].includes(getOptions().style))return front.toDataURL('image/png');const shot=document.createElement('canvas');shot.width=front.width;shot.height=front.height;const out=shot.getContext('2d');out.fillStyle='#000';out.fillRect(0,0,shot.width,shot.height);for(const video of videos){const scale=Math.min(shot.width/video.videoWidth,shot.height/video.videoHeight),w=video.videoWidth*scale,h=video.videoHeight*scale;out.globalAlpha=Number(getComputedStyle(video).opacity);out.drawImage(video,(shot.width-w)/2,(shot.height-h)/2,w,h);}out.globalAlpha=1;out.drawImage(front,0,0);return shot.toDataURL('image/png')},get frames(){return frames},get timing(){const sorted=[...frameTimes].sort((a,b)=>a-b);return {...particleStats,fps:document.visibilityState==='hidden'?null:Math.round(1000/(frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length||16.7)),frame_p95_ms:+(sorted[Math.floor(sorted.length*.95)]??0).toFixed(2)}}};
}
