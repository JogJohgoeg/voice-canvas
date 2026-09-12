// Original layered ink landscape: paper, washes, feathered ridges and water.
uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float past(float x){return texture(sTD2DInputs[0],vec2(clamp(x,0.,1.),.5)).x;}
float mountain(float x,float seed,float t,float power){
 float broad=sin(x*5.3+seed+t*.045)*.50+sin(x*10.1+seed*3.-t*.025)*.22;
 float crags=noise(vec2(x*18.+seed,seed))*.17+noise(vec2(x*43.,seed+4.))*.07;
 return broad*(.12+power*.15)+crags;
}
void main(){
 vec2 uv=vUV.st;
 float t=uScene.x, live=pow(clamp(uScene.w*.7+uAudio.x*.3,0.,1.),.45);
 float fiber=noise(uv*vec2(960.,540.))*.6+noise(uv*vec2(240.,110.))*.4;
 vec3 paper=vec3(.91,.895,.85)+(fiber-.5)*.045;
 vec3 ink=vec3(.048,.064,.063);
 vec3 col=paper;
 // Near-empty moon disk and spacious upper paper hold the composition together.
 float moon=1.-smoothstep(.061,.063,length((uv-vec2(.77,.76))*vec2(uScene.z,1.)));
 col=mix(col,vec3(.96,.942,.885),moon*.7);
 for(int layer=0;layer<5;layer++){
  float f=float(layer), depth=f/4.;
  float memory=pow(max(past(.95-depth*.32),0.),.45);
  float drive=mix(live,memory,depth*.55);
  float x=uv.x+(depth-.5)*live*.038*sin(t*.10);
  float ridge=.53-depth*.105+mountain(x,2.1+f*4.3,t,drive)*(1.+depth*.3);
  float d=ridge-uv.y;
  // Stationary paper fibers provide wet edges, never random frame noise.
  float grain=noise(vec2(x*250.,uv.y*160.)+f*3.);
  float feather=(grain-.5)*(.005+drive*.007);
  float wash=smoothstep(-.010,.022,d+feather);
  float fade=exp(-max(d,0.)*(5.+depth*2.));
  float brush=noise(vec2(x*46.+sin(uv.y*19.+f)*1.8,uv.y*6.+f));
  float dry=.76+.24*smoothstep(.20,.55,brush);
  float density=(.17+depth*.38)*wash*(.38+.62*fade)*dry;
  col=mix(col,ink,density);
  float edge=exp(-abs(d+feather)*240.)*(.08+depth*.09);
  col=mix(col,ink,edge);
 }
 // Broad water wash and broken horizontal strokes, flowing on the same audio clock.
 float water=1.-smoothstep(.18,.28,uv.y);
 col=mix(col,paper,water*.83);
 float wave=uv.y*125.+sin(uv.x*10.-t*.13)*(.5+live*1.8);
 float line=1.-smoothstep(.045,.10,abs(fract(wave)-.5));
 float broken=smoothstep(.42,.68,noise(vec2(uv.x*25.+t*.08,floor(wave))));
 col=mix(col,ink,line*broken*water*.15);
 // Low mist crosses the foreground without washing out the whole image.
 float mist=exp(-pow((uv.y-(.30+.02*sin(uv.x*6.+t*.09)))/.043,2.));
 col=mix(col,paper,mist*.34);
 float vignette=smoothstep(.35,.82,length(uv-.5));
 col*=1.-vignette*.045;
 fragColor=TDOutputSwizzle(vec4(col,1.));
}
