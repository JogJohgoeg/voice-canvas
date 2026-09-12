// Original liquid-metal relief with procedural studio reflections.
uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
float past(float x){return texture(sTD2DInputs[0],vec2(clamp(x,0.,1.),.5)).x;}
float surface(vec2 p,float t,float force){
 float r=length(p);
 float dome=sqrt(max(.0001,1.-r*r));
 float envelope=(1.-smoothstep(0.,1.,r));
 float waves=sin(p.x*5.4+p.y*2.1-t*.68)
             +.55*sin(p.y*7.3-p.x*2.7+t*.51)
             +.28*sin((p.x+p.y)*12.2-t*.32);
 return dome*.50+waves*(.045+force*.115)*envelope;
}
vec3 studio(vec3 r){
 vec3 base=mix(vec3(.045,.054,.069),vec3(.30,.34,.38),smoothstep(-.8,.8,r.y));
 float strip=exp(-pow((r.y-.50)/.12,2.))*(.3+.7*exp(-pow((r.x+.25)/.9,2.)));
 float panel=exp(-pow((r.x+.72)/.19,2.)-pow((r.y-.08)/.7,2.));
 float low=exp(-pow((r.y+.55)/.075,2.));
 return base+vec3(1.35,1.39,1.42)*strip+vec3(.72,.82,.95)*panel+vec3(.34,.31,.28)*low;
}
void main(){
 vec2 uv=vUV.st;
 float t=uScene.x;
 float force=clamp(uScene.w*.75+uAudio.x*.25,0.,1.);
 float lift=sqrt(force);
 vec2 screen=(uv-.5)*vec2(uScene.z,1.);
 screen-=vec2(sin(t*.21)*.04,cos(t*.16)*.015);
 float angle=sin(t*.15)*.20+lift*.13;
 mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
 vec2 p=rotation*screen/vec2(.64+lift*.10,.36+lift*.035);
 float a=atan(p.y,p.x);
 float boundary=1.+(.025+lift*.055)*sin(a*3.+t*.24)+.022*sin(a*5.-t*.18);
 p/=boundary;
 float r=length(p);
 float shadow=exp(-pow(length((screen-vec2(.03,-.08))/vec2(.68,.35)),4.));
 vec3 color=vec3(.016,.020,.027)*(1.-shadow*.65);
 float mask=1.-smoothstep(.991,1.002,r);
 if(r<1.003){
  float z=surface(p,t,lift);
  float stepSize=.002;
  vec2 grad=vec2(surface(p+vec2(stepSize,0),t,lift)-surface(p-vec2(stepSize,0),t,lift),surface(p+vec2(0,stepSize),t,lift)-surface(p-vec2(0,stepSize),t,lift))/(2.*stepSize);
  vec3 normal=normalize(vec3(-grad.x*.65,-grad.y*.95,1.));
  vec3 view=normalize(vec3(-screen,2.8-z));
  vec3 reflection=reflect(-view,normal);
  vec3 metal=studio(reflection);
  float facing=max(dot(normal,view),0.);
  metal*=.74+.26*pow(1.-facing,3.);
  // Fine broad curvature accents give the surface readable volume, no sparkle noise.
  metal+=vec3(.20,.23,.28)*pow(1.-facing,4.);
  metal=metal/(1.+metal*.35);
  color=mix(color,metal,mask);
 }
 color*=1.-smoothstep(.62,1.15,length(screen))*.35;
 fragColor=TDOutputSwizzle(vec4(color,1.));
}
