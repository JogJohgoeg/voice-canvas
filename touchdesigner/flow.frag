// Phase Field: original microphone-driven interference geometry.
// Inspired by spatial/frequency relationships; not a reproduction of Matrix.
uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
vec4 past(float x){return texture(sTD2DInputs[0],vec2(clamp(x,0.,1.),.5));}
float ruled(float v,float thickness){
 float d=abs(fract(v+.5)-.5);
 float aa=max(fwidth(v),.001);
 return 1.-smoothstep(thickness-aa,thickness+aa,d);
}
void main(){
 vec2 uv=vUV.st;
 vec2 p=(uv-.5)*vec2(uScene.z,1.);
 float live=sqrt(clamp(uAudio.x,0.,1.));
 float body=sqrt(clamp(uScene.w,0.,1.)), t=uScene.x;
 float recorded=sqrt(max(past(uv.x).x,0.));
 float force=body*.65+live*.35;
 // Two continuous planes: the current envelope opens space between them.
 float bend=sin(p.x*3.2+t*.17)*(.018+force*.17);
 bend+=sin(p.x*6.3-t*.11)*recorded*.060;
 float spread=.12+force*.22;
 float y=(p.y-bend)/(1.+force*.85);
 float extent=(1.-smoothstep(.46,.50,abs(p.y)))*(1.-smoothstep(.82,.87,abs(p.x)));
 float plane=1.-smoothstep(spread+.065,spread+.09,abs(y));
 float horizontal=ruled(y*44.,.055);
 float depth=1./(.7+abs(y)*2.);
 float vertical=ruled((p.x+sin(y*7.+t*.14)*force*.055)*28.*depth,.035);
 float field=max(horizontal*.88,vertical*.23)*plane;
 // A second shifted plane makes interference readable as spatial displacement.
 float angle=.035+body*.13;
 float other=(y+p.x*angle+recorded*.045)*44.;
 float interference=ruled(other,.045)*plane*.42;
 float border=1.-smoothstep(.001,.003,abs(abs(y)-spread-.065));
 float signalY=-.385+past(uv.x).x*.07;
 float history=1.-smoothstep(.001,.0025,abs(p.y-signalY));
 float white=max(max(field,interference),border*.70);
 white=max(white,history*.55)*extent;
 // No strobes, blinking points, generated sound, or copied imagery.
 fragColor=TDOutputSwizzle(vec4(vec3(.004+white*.84),1.));
}
