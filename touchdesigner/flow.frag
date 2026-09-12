uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
vec4 past(float x){return texture(sTD2DInputs[0],vec2(clamp(x,0.,1.),.5));}
void main(){
 vec2 uv=vUV.st;
 float live=sqrt(clamp(uAudio.x,0.,1.)), t=uScene.x;
 // Sound moves a continuous camera and the built environment, never window flashes.
 float sway=sin(t*.25)*(.008+live*.035);
 vec2 p=uv-vec2(.5+sway,.43+live*.025);
 p.x*=uScene.z;
 vec3 sky=mix(vec3(.015,.032,.080),vec3(.22,.20,.24),exp(-max(p.y,0.)*5.));
 sky+=vec3(.29,.10,.025)*exp(-length((p-vec2(.44,.08))*vec2(1.,2.))*5.);
 vec3 col=p.y<-.04 ? vec3(.015,.025,.042) : sky;
 // Distant skyline, then nearer rows. Gap down the centre forms a boulevard.
 for(int row=0;row<5;row++){
  float layer=float(row), scale=.23+layer*.20;
  float cell=.075*scale;
  float shift=sin(t*.14+layer*.5)*live*.018;
  float id=floor((p.x+shift)/cell);
  float local=fract((p.x+shift)/cell);
  float seed=id+row*71.;
  float sound=past(fract(id*.071+layer*.19)).x;
  float height=(.08+hash(seed)*.31)*scale;
  height*=1.+live*.24+sqrt(max(sound,0.))*.30;
  float base=-.018-layer*.043;
  float avenue=.015+layer*.032;
  float outer=abs(p.x+shift);
  if(outer>avenue && local>.07 && local<.88 && p.y>base && p.y<base+height){
   float face=local<.64?1.:.52;
   vec3 material=mix(vec3(.14,.20,.29),vec3(.022,.046,.082),layer/4.);
   col=material*face;
   // Fixed warm architectural windows; no flickering or blinking masks.
   vec2 win=vec2(local*4.,(p.y-base)/(.014*scale));
   vec2 w=fract(win);
   float lit=step(.29,hash(seed*17.+floor(win.y)*5.+floor(win.x)));
   float pane=step(.20,w.x)*step(w.x,.65)*step(.22,w.y)*step(w.y,.67);
   col+=vec3(.88,.47,.15)*pane*lit*(.14+layer*.045)*face;
   col+=vec3(.22,.45,.62)*exp(-abs(p.y-(base+height))*550.)*.45;
  }
 }
 // Perspective boulevard with smooth audio-driven dolly and reflective paving.
 if(p.y<-.04){
  float depth=(-p.y-.04)/.50;
  float roadWidth=.025+depth*.64;
  if(abs(p.x)<roadWidth){
   col=mix(vec3(.065,.075,.11),vec3(.008,.016,.03),depth);
   float perspectiveX=p.x/(depth+.04);
   float centre=exp(-abs(perspectiveX)*100.);
   float side=exp(-abs(abs(p.x)-roadWidth*.88)*380.);
   col+=vec3(.45,.24,.085)*(centre*.28+side*.65);
   float transverse=pow(.5+.5*cos(12./(depth+.13)+t*1.4),28.);
   col+=vec3(.07,.16,.20)*transverse*.26;
   // Stretched city reflections, steady light moving with the camera.
   float refl=pow(.5+.5*sin(perspectiveX*61.),12.);
   col+=vec3(.22,.105,.038)*refl*exp(-depth*3.)*.4;
  }
 }
 float vignette=1.-smoothstep(.45,1.15,length(vec2(p.x*.6,p.y)));
 col*=vignette;
 fragColor=TDOutputSwizzle(vec4(1.-exp(-col*1.6),1.));
}
