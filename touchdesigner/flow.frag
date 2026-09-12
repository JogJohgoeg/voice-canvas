uniform vec4 uAudio; // level, bass, brightness, transient
uniform vec4 uScene; // seconds, intensity, aspect, mid
out vec4 fragColor;
void main(){
 vec2 p=(vUV.st-.5)*vec2(uScene.z,1.);
 float t=uScene.x, level=uAudio.x, bass=uAudio.y;
 vec3 col=vec3(.004,.006,.012);
 float breath=.28+.035*sin(t*.43)+bass*.09;
 for(int i=0;i<7;i++){
  float f=float(i), a=atan(p.y,p.x), r=length(p);
  float warp=.025*sin(a*6.+t*.24+f)+.014*sin(a*11.-t*.31);
  float ring=breath+f*.028+warp+level*.014*sin(a*3.+t);
  float d=abs(r-ring);
  float stroke=pow(.5+.5*sin(a*(70.+f*9.)+sin(r*48.-t)*3.-t*(.2+level)),5.);
  float filament=exp(-d*d/(.000012+level*.00012));
  float glow=exp(-d*45.)*.06;
  vec3 blue=vec3(.08,.38,.9), gold=vec3(1.,.65,.12);
  vec3 ink=mix(blue,gold,clamp(uAudio.z*.8+uAudio.w*.3+sin(f)*.12,0.,1.));
  col+=ink*(filament*(.2+.8*stroke)+glow)*(.22+level*1.8)*uScene.y;
 }
 float ripple=abs(length(p)-fract(t*.16)*.9);
 col+=vec3(.45,.65,.8)*exp(-ripple*160.)*uAudio.w*.5;
 float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
 col*=.93+.07*grain;
 fragColor=TDOutputSwizzle(vec4(1.-exp(-col),1.));
}
