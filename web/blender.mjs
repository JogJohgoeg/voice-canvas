// Videos are always muted: the explicit sound toggle owns all audible output.
export function blenderLayer(getScene,status){
 const videos=[...document.querySelectorAll('video.blender')];let offlineUntil=0;let active=0,busy=false,current='',currentSignature='',visible=false;
 function clear(){videos.forEach(v=>{v.classList.remove('visible');v.pause()});visible=false;current='';currentSignature='';}
 async function poll(){
  const scene=getScene();if(!scene){clear();return;}
  if(busy||document.hidden||Date.now()<offlineUntil)return;busy=true;
  try{
   const signature=JSON.stringify([scene.style,scene.monet,scene.workStyle]),response=await fetch('./api/blender',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scene}),signal:AbortSignal.timeout(2500)}),data=await response.json();
   if(signature!==JSON.stringify([getScene()?.style,getScene()?.monet,getScene()?.workStyle]))return;
   status.textContent=data.status==='ready'?`已缓存 / Cached · ${data.render_ms} ms${data.approximate?' · 同类预热 / Warm fallback':''}`:({queued:'后台生成中 / Rendering',busy:'后台繁忙 / Busy',cooldown:'稍后重试 / Retrying later',unavailable:'后台不可用 / Unavailable'}[data.status]??'等待后台 / Waiting')+' · 实时画面继续';
   if(data.status!=='ready'){clear();return;}if(data.url===current)return;
   if(!/^\/blender_cache\/[0-9a-f]{24}\/loop\.webm$/.test(data.url))return;
   const next=1-active,video=videos[next];video.muted=true;video.src=data.url;
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Video load timeout')),5000);video.onloadeddata=()=>{clearTimeout(timer);resolve()};video.onerror=()=>{clearTimeout(timer);reject(Error('Video unavailable'))}});
   if(signature!==JSON.stringify([getScene()?.style,getScene()?.monet,getScene()?.workStyle]))return;
   await video.play();video.classList.add('visible');videos[active].classList.remove('visible');const old=videos[active];setTimeout(()=>{if(old!==videos[active])old.pause()},1300);active=next;current=data.url;currentSignature=signature;visible=true;
  }catch{clear();offlineUntil=Date.now()+60000;status.textContent='后端离线 / Backend offline · 实时画面继续';}
  finally{busy=false;}
 }
 setTimeout(poll,100);setInterval(poll,5000);
 return {get visible(){if(visible&&currentSignature!==JSON.stringify([getScene()?.style,getScene()?.monet,getScene()?.workStyle]))clear();return visible}};
}
