export const pluginContract=`#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_audio[8];
uniform float u_seed;
uniform vec3 u_palette[4];
uniform float u_params[8];
out vec4 fragColor;
`;
export function validatePlugin(input){
 if(!input||typeof input!=='object'||typeof input.name!=='string'||!input.name.trim()||input.name.length>80||typeof input.shader!=='string'||input.shader.length>12000)throw Error('Invalid plugin manifest');
 if(input.init)throw Error('JS init is unsupported; use fragment shader geometry');
 const source=input.shader.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 if(/\b(while|do|for|discard|sampler\w*|image\w*|atomic\w*)\b/.test(source)||/#(?!version\s+300\s+es)/.test(source))throw Error('Plugin shaders must be loop-free, texture-free GLSL ES 3.00');
 const functions=[...source.matchAll(/\b(?:void|float|int|bool|vec[234]|mat[234])\s+(\w+)\s*\([^;{}]*\)\s*\{/g)];
 if([...source.matchAll(/\bmain\s*\(/g)].length!==1||[...source.matchAll(/\[\s*(\d+)\s*\]/g)].some(m=>Number(m[1])>64))throw Error('Unsupported recursion or array size');
 if(functions.length!==1||functions[0][1]!=='main')throw Error('Only main() is allowed; no helper functions or recursion');
 if(!Array.isArray(input.params)||input.params.length>8)throw Error('At most 8 parameters');
 for(const declaration of [/uniform\s+float\s+u_time\s*;/,/uniform\s+vec2\s+u_resolution\s*;/,/uniform\s+float\s+u_audio\s*\[8\]\s*;/,/uniform\s+float\s+u_seed\s*;/,/uniform\s+vec3\s+u_palette\s*\[4\]\s*;/,/uniform\s+float\s+u_params\s*\[8\]\s*;/])if(!declaration.test(source))throw Error('Missing uniform contract declaration');
 const params=input.params.map(p=>{if(typeof p.name!=='string'||p.name.length>60||![p.min,p.max,p.default].every(Number.isFinite)||p.min>=p.max||p.default<p.min||p.default>p.max)throw Error('Invalid parameter range');return {name:p.name,min:p.min,max:p.max,default:p.default};});
 const bindings=(input.bindings??[]).map(b=>{if(!Number.isInteger(b.param)||b.param<0||b.param>=params.length||!Number.isInteger(b.feature)||b.feature<0||b.feature>7||!Number.isFinite(b.amount)||Math.abs(b.amount)>10)throw Error('Invalid audio binding');return {param:b.param,feature:b.feature,amount:b.amount};});
 if(bindings.length>16)throw Error('Too many bindings');return {version:1,name:input.name,shader:input.shader,params,bindings,seed:Number(input.seed)>>>0,prompt:String(input.prompt??'').slice(0,2000)};
}
const studies=[
 ['Cellular bloom','abs(sin(length(p)*18.0-u_time*.4+sin(a*6.0)*2.0))'],
 ['Ink vortex','abs(sin(a*7.0+length(p)*22.0-u_time*.4))'],
 ['Neural filaments','abs(sin(p.x*19.0+sin(p.y*13.0+u_time*.2)*2.0)*cos(p.y*17.0-p.x*3.0))'],
 ['Water caustics','abs(sin(p.x*14.0+sin(p.y*11.0+u_time*.3))*sin(p.y*16.0+sin(p.x*9.0-u_time*.2)))'],
 ['Solar corona','abs(length(p)-.48-sin(a*12.0+u_time*.3)*.05)'],
 ['Folded silk','abs(sin(p.y*22.0+sin(p.x*8.0+u_time*.2)*4.0))'],
 ['Star chamber','length(fract(p*12.0+vec2(sin(u_seed),u_time*.025))-.5)'],
 ['Impressionist rain','abs(sin(p.x*31.0+sin(p.y*6.0))*sin(p.y*37.0-u_time*.25))']
];
export const curatedPlugins=studies.map(([name,expression],i)=>validatePlugin({name,seed:317,prompt:'Original procedural study: '+name,params:[{name:'Glow',min:.1,max:2,default:.8},{name:'Scale',min:.3,max:2,default:1}],bindings:[{param:0,feature:0,amount:.8}],shader:pluginContract+`void main(){vec2 p=(gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y)*2.0/u_params[1];p.x=abs(p.x);float a=atan(p.y,p.x);float d=${expression};float glow=exp(-d*${i===4?'45.0':'24.0'})*exp(-dot(p,p)*1.3)*u_params[0];vec3 col=mix(u_palette[0],u_palette[1],clamp(u_audio[1]+u_audio[2]*.4,0.0,1.0));fragColor=vec4(col*glow,clamp(glow*.65,0.0,.85));}`}));
function pluginWorker(){
 let canvas,gl,program,scale=1,baseWidth=640,baseHeight=360;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function draw(d){const start=performance.now();const w=Math.max(32,Math.floor(baseWidth*scale)),h=Math.max(32,Math.floor(baseHeight*scale));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);const loc=n=>gl.getUniformLocation(program,n);gl.uniform1f(loc('u_time'),d.time??0);gl.uniform2f(loc('u_resolution'),canvas.width,canvas.height);gl.uniform1fv(loc('u_audio[0]'),d.audio??new Float32Array(8));gl.uniform1f(loc('u_seed'),d.seed??317);gl.uniform3fv(loc('u_palette[0]'),d.palette??[.1,.6,1,1,.7,.1,.5,.5,.5,1,1,1]);gl.uniform1fv(loc('u_params[0]'),d.params??[.8,1,0,0,0,0,0,0]);gl.drawArrays(gl.TRIANGLES,0,3);gl.finish();if(gl.getError()!==gl.NO_ERROR)throw Error('GPU draw failed');return performance.now()-start;}
 self.onmessage=e=>{try{const d=e.data;if(d.type==='load'){
  baseWidth=Math.min(960,d.width);baseHeight=Math.max(64,Math.round(baseWidth*d.height/d.width));canvas=new OffscreenCanvas(baseWidth,baseHeight);gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('Worker WebGL2 unavailable');program=gl.createProgram();const v=shader(gl.VERTEX_SHADER,'#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0,1);}'),f=shader(gl.FRAGMENT_SHADER,d.shader);gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));let times;
  do{times=[draw({...d,time:0}),draw({...d,time:1}),draw({...d,time:2})];if(Math.max(...times)<6)break;scale*=.5;}while(scale>=.125);
  if(Math.max(...times)>=6)throw Error('Plugin exceeds 6 ms render budget');self.postMessage({type:'ready',times,scale});
 }else{const ms=draw(d);if(ms>=6){scale*=.5;if(scale<.125)throw Error('Plugin stopped: render budget exceeded');}const bitmap=canvas.transferToImageBitmap();self.postMessage({type:'frame',bitmap,ms,scale},[bitmap]);}}catch(error){self.postMessage({type:'error',message:error.message});}};
}
export function pluginLayer(stage,status){
 const canvas=document.createElement('canvas');canvas.style.zIndex=3;canvas.style.pointerEvents='none';canvas.hidden=true;stage.append(canvas);const c=canvas.getContext('2d');let worker=null,current=null,inFlight=false,generation=0,ms=0,values=[],busyAt=0;
 function clear(){generation++;worker?.terminate();worker=null;current=null;canvas.hidden=true;inFlight=false;}
 async function load(input){const plugin=validatePlugin(input),revision=++generation;const url=URL.createObjectURL(new Blob(['('+pluginWorker.toString()+')()'],{type:'text/javascript'}));const next=new Worker(url);URL.revokeObjectURL(url);status('GPU 编译与三帧测试 / Compiling + smoke test');
  try{const report=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Plugin compile timed out')),8000);next.onerror=e=>{clearTimeout(timer);reject(Error(e.message))};next.onmessage=e=>{clearTimeout(timer);e.data.type==='ready'?resolve(e.data):reject(Error(e.data.message))};next.postMessage({type:'load',shader:plugin.shader,width:Math.max(64,stage.clientWidth),height:Math.max(64,stage.clientHeight),params:plugin.params.map(p=>p.default)});});if(revision!==generation){next.terminate();return false;}worker?.terminate();worker=next;current=plugin;values=plugin.params.map(p=>p.default);canvas.hidden=false;inFlight=false;worker.onerror=e=>{status(e.message);clear();};worker.onmessage=e=>{inFlight=false;const d=e.data;if(d.type==='error'){status(d.message);clear();return;}ms=d.ms;canvas.width=d.bitmap.width;canvas.height=d.bitmap.height;c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(d.bitmap,0,0);d.bitmap.close();};status(plugin.name+' · smoke '+Math.max(...report.times).toFixed(2)+' ms · scale '+report.scale);return true;}catch(e){next.terminate();status(e.message);return false;}
 }
 return {canvas,load,clear,get current(){return current},get snapshot(){return current?{...current,params:current.params.map((p,i)=>({...p,default:values[i]}))}:null},get ms(){return ms},set(index,value){if(current?.params[index])values[index]=Math.max(current.params[index].min,Math.min(current.params[index].max,value));},draw(time,a,evolution,seed){if(inFlight&&performance.now()-busyAt>1000){status('Plugin worker timeout');clear();}if(!worker||inFlight||!current)return;const f=evolution.piano??{},audio=[a.level,a.warmth,a.pulse,(a.pitch??0)/2000,f.tension??0,a.level,(f.register??0)+.5,f.pedal??0],params=new Float32Array(8);values.forEach((v,i)=>params[i]=v);for(const b of current.bindings)params[b.param]=Math.max(current.params[b.param].min,Math.min(current.params[b.param].max,params[b.param]+audio[b.feature]*b.amount));const palette=[...(f.colour??[.1,.6,1]),...(f.secondary??[1,.7,.1]),.5,.5,.5,1,1,1];inFlight=true;busyAt=performance.now();worker.postMessage({type:'frame',time,audio,params,palette,seed});}};
}
