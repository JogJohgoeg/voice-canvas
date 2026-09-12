uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
vec4 past(float x){return texture(sTD2DInputs[0],vec2(clamp(x*1.08,0.,1.),.5));}
mat2 rotate(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
void main(){
 float live=sqrt(clamp(uAudio.x,0.,1.)), t=uScene.x;
 vec2 q=vUV.st-.5;
 q.x*=uScene.z;
 // Current sound moves the entire fabric immediately, not only its incoming edge.
 q=rotate((uAudio.z-.4)*live*.42+sin(t*.23)*live*.22)*q;
 float x=q.x/uScene.z+.5;
 vec4 h=past(x);
 float heard=sqrt(max(h.x,0.));
 float energy=live*.60+heard*.40;
 float swing=sin(x*6.2-t*.62)*(.025+energy*.26)
             +sin(x*12.5+t*.38)*energy*.10;
 swing+=(h.x-.25)*.20+(uAudio.y-.10)*.28;
 vec3 col=vec3(.006,.011,.024);
 for(int i=0;i<14;i++){
  float layer=float(i)/13.;
  float lag=past(x-layer*.032).x;
  float fold=sin(x*7.5-t*.6+layer*3.8)*(.025+energy*.13)
            +sin(x*15.+layer*5.+t*.24)*sqrt(max(lag,0.))*.055;
  float spread=.14+energy*.58;
  float center=swing+(layer-.5)*spread+fold;
  float d=q.y-center;
  float width=.004+energy*.009;
  float edge=exp(-d*d/(width*width));
  // Broad translucent folds with directional shading; no flashing/dotted masks.
  float body=exp(-abs(d)/(width*3.4));
  float light=.45+.55*smoothstep(-width*3.,width*3.,d);
  vec3 blue=vec3(.045,.30,.52), pearl=vec3(.40,.66,.68), copper=vec3(.85,.37,.12);
  vec3 tint=mix(blue,pearl,smoothstep(0.,.55,layer));
  tint=mix(tint,copper,smoothstep(.5,1.,layer));
  col+=tint*(body*.23*light+edge*.31)*uScene.y;
 }
 col*=1.-smoothstep(.70,1.15,length(vec2(q.x*.65,q.y)));
 fragColor=TDOutputSwizzle(vec4(1.-exp(-col),1.));
}
