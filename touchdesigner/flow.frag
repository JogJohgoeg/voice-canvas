uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
void main(){
 vec2 p=(vUV.st-.5)*vec2(uScene.z,1.);
 float t=uScene.x, energy=pow(clamp(uAudio.x,0.,1.),.65);
 float hit=uAudio.w, bass=uAudio.y;
 p=rot(.10*sin(t*.19))*p;
 vec3 col=vec3(.002,.004,.012);
 // Sweeping nested ribbons: spacious in silence, strongly folded by live sound.
 for(int i=0;i<12;i++){
  float f=float(i), depth=f/11.;
  vec2 q=p-vec2(.035*sin(t*.31+f*.36),.022*cos(t*.27+f*.4));
  q.x*=1.05+.18*sin(t*.15+depth);
  float a=atan(q.y,q.x), r=length(q);
  float twist=a+t*.13+depth*1.7;
  float fold=sin(twist*3.+t*.31)*(.018+energy*.045)
            +sin(twist*5.-t*.22+f*.2)*(.010+energy*.022);
  float radius=.14+depth*.25+.025*sin(t*.45+depth*3.)+energy*.07+bass*.04;
  float d=r-radius-fold;
  float flow=a*(52.+f*4.)+sin(r*28.-t*.65+f)*2.8-t*.6;
  float marks=pow(.5+.5*sin(flow),7.);
  float width=.0018+energy*.0035+hit*.0015;
  float core=exp(-d*d/(width*width));
  float halo=exp(-abs(d)*65.)*.14;
  float side=.5+.5*sin(a*2.+depth*4.+t*.12);
  vec3 cyan=vec3(.025,.48,.95), violet=vec3(.30,.06,.80), gold=vec3(1.,.37,.035);
  vec3 tint=mix(cyan,violet,side*.55);
  float warmth=smoothstep(.42,.95,side+uAudio.z*.30+hit*.17);
  tint=mix(tint,gold,warmth);
  col+=tint*(core*(.17+marks*.83)+halo)*(.36+energy*1.8)*uScene.y;
 }
 // Small scattered lights follow a curved field, with onset-driven outward flights.
 for(int i=0;i<24;i++){
  float f=float(i), a=f*2.39996+t*.085;
  float r=.23+.20*fract(f*.618)+hit*.10;
  vec2 pos=vec2(cos(a)*1.35,sin(a))*r;
  float d=length(p-pos);
  col+=vec3(.12,.45,.8)*exp(-d*d/(.000008+hit*.000045))*(.25+hit*1.4);
 }
 float vignette=1.-smoothstep(.43,1.,length(p));
 col*=vignette;
 fragColor=TDOutputSwizzle(vec4(1.-exp(-col),1.));
}
