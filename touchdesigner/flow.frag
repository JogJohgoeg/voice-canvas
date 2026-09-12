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
 return dome*.50+waves*(.055+force*.30)*envelope;
}
vec3 studio(vec3 r){
 vec3 base=mix(vec3(.045,.054,.069),vec3(.30,.34,.38),smoothstep(-.8,.8,r.y));
 float strip=exp(-pow((r.y-.50)/.12,2.))*(.3+.7*exp(-pow((r.x+.25)/.9,2.)));
 float panel=exp(-pow((r.x+.72)/.19,2.)-pow((r.y-.08)/.7,2.));
 float low=exp(-pow((r.y+.55)/.075,2.));
 return base+vec3(1.35,1.39,1.42)*strip+vec3(.72,.82,.95)*panel+vec3(.34,.31,.28)*low;
}
vec4 sculpture(vec2 screen,vec2 size,float t,float force,float angle){
 float lift=pow(clamp(force,0.,1.),.38);
 mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
 vec2 p=rotation*screen/(size*(1.+lift*.16));
 float a=atan(p.y,p.x);
 p/=1.+(.025+lift*.14)*sin(a*3.+t*.24)+(.015+lift*.055)*sin(a*5.-t*.28);
 float r=length(p);
 if(r>1.004)return vec4(0.);
 float z=surface(p,t,lift), e=.002;
 vec2 grad=vec2(surface(p+vec2(e,0),t,lift)-surface(p-vec2(e,0),t,lift),surface(p+vec2(0,e),t,lift)-surface(p-vec2(0,e),t,lift))/(2.*e);
 vec3 normal=normalize(vec3(-grad.x*.65,-grad.y*.95,1.));
 vec3 view=normalize(vec3(-screen,2.8-z));
 float facing=max(dot(normal,view),0.);
 vec3 metal=studio(reflect(-view,normal))*(.74+.26*pow(1.-facing,3.));
 metal+=vec3(.20,.23,.28)*pow(1.-facing,4.);
 return vec4(metal/(1.+metal*.35),1.-smoothstep(.990,1.003,r));
}
void main(){
 vec2 screen=(vUV.st-.5)*vec2(uScene.z,1.);
 float t=uScene.x, force=clamp(uScene.w*.75+uAudio.x*.25,0.,1.);
 float memory=past(.80), older=past(.60);
 float energy=pow(force,.38);
 vec3 color=vec3(.005,.009,.017);
 // Distant architectural contours establish a scale larger than the sculpture.
 for(int i=0;i<5;i++){
  float f=float(i);
  vec2 q=(screen-vec2(0.,.045))/vec2(.61+f*.09,.25+f*.043);
  float radius=length(q);
  float bend=sin(atan(q.y,q.x)*3.+t*.12+f*.4)*(.012+older*.06);
  float d=abs(radius-1.-bend);
  color+=vec3(.045,.085,.14)*exp(-d*160.)*(1.-f*.11);
 }
 float fog=exp(-pow((screen.y+.30)/.065,2.))*exp(-screen.x*screen.x*1.5);
 color+=vec3(.018,.033,.055)*fog;
 // Dimmer rear sculptures respond to earlier portions of the same phrase.
 vec4 left=sculpture(screen-vec2(-.36,.085),vec2(.36,.19),t+7.,memory,.36+memory*.25);
 color=mix(color,left.rgb*vec3(.40,.49,.62),left.a);
 vec4 right=sculpture(screen-vec2(.37,.13),vec2(.33,.17),t+15.,older,-.43-older*.25);
 color=mix(color,right.rgb*vec3(.40,.48,.58),right.a);
 vec2 drift=vec2(sin(t*.21)*(.02+energy*.035),.035+cos(t*.16)*.022);
 float angle=sin(t*.35)*(.15+energy*.40)+energy*.20;
 // Reflected main form is compressed into the stage floor.
 if(screen.y<-.29){
  vec2 reflected=vec2(screen.x,(-.29-screen.y)*2.8-.24);
  reflected.x+=sin(screen.y*48.+t*.4)*.008;
  vec4 reflection=sculpture(reflected-drift,vec2(.46,.255),t,force,angle);
  float fade=exp(-(-.29-screen.y)*13.);
  color+=reflection.rgb*reflection.a*fade*.23;
 }
 vec4 mainForm=sculpture(screen-drift,vec2(.46,.255),t,force,angle);
 color=mix(color,mainForm.rgb,mainForm.a);
 // A foreground edge frames the stage without covering the central silhouette.
 float edge=abs(screen.y+.365-.025*sin(screen.x*4.+t*.14));
 color+=vec3(.10,.13,.17)*exp(-edge*500.)*exp(-screen.x*screen.x*.7);
 color*=1.-smoothstep(.70,1.15,length(screen))*.5;
 fragColor=TDOutputSwizzle(vec4(color,1.));
}
