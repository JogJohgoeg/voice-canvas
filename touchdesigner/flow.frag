uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
vec4 past(float x){return texture(sTD2DInputs[0],vec2(clamp(x*1.08,0.,1.),.5));}
void main(){
 vec2 uv=vUV.st;
 float x=uv.x, t=uScene.x;
 vec4 h=past(x), before=past(x-.012), after=past(x+.012);
 float e=pow(max(h.x,0.),.65), slope=(after.x-before.x)*2.;
 // A continuous four-second sound landscape: new sound enters from the right.
 float carrier=sin(x*9.-t*.5)*.45+sin(x*17.+t*.3)*.2;
 float contour=(h.x-.20)*.26+carrier*(.018+e*.16)+h.y*.10;
 vec3 col=vec3(.006,.012,.025);
 for(int i=0;i<8;i++){
  float f=float(i), layer=f/7.;
  vec4 delayed=past(x-layer*.018);
  float voice=pow(max(delayed.x,0.),.65);
  float bend=sin(x*10.+layer*2.-t*.45)*(.012+voice*.055);
  float center=.5+contour+(layer-.5)*(.085+voice*.26)+bend;
  float distance=uv.y-center;
  float width=.0025+voice*.003+layer*.001;
  float line=exp(-distance*distance/(width*width));
  // Translucent continuous fabric, no beads, stippling or flash modulation.
  float silk=exp(-abs(distance)*55.)*.17;
  float highlight=.55+.45*sin(x*5.+layer*3.+slope);
  vec3 tint=mix(vec3(.045,.48,.65),vec3(.96,.53,.17),layer);
  tint=mix(tint,vec3(.40,.60,.72),h.z*.23);
  col+=tint*(line*.58+silk)*(.65+highlight*.45)*uScene.y;
 }
 // Soft reflection follows the same recorded contour rather than a free-running effect.
 float reflection=abs(uv.y-(.27-contour*.32));
 col+=vec3(.04,.15,.21)*exp(-reflection*22.)*(.3+e*.3);
 float edge=smoothstep(0.,.08,x)*smoothstep(0.,.08,1.-x);
 col*=edge;
 fragColor=TDOutputSwizzle(vec4(1.-exp(-col),1.));
}
