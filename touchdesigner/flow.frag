// Original procedural green code rain. Glyphs are code-built, not movie assets.
uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
float stroke(vec2 p,vec2 a,vec2 b){
 vec2 v=b-a;float h=clamp(dot(p-a,v)/dot(v,v),0.,1.);
 float d=length(p-a-v*h);return 1.-smoothstep(.035,.075,d);
}
float glyph(vec2 p,float seed){
 float g=0.;
 // Sparse rectangular/digital glyphs, fixed for each falling character.
 if(hash(seed+1.)>.3)g=max(g,stroke(p,vec2(.22,.8),vec2(.78,.8)));
 if(hash(seed+2.)>.3)g=max(g,stroke(p,vec2(.22,.5),vec2(.78,.5)));
 if(hash(seed+3.)>.3)g=max(g,stroke(p,vec2(.22,.2),vec2(.78,.2)));
 if(hash(seed+4.)>.4)g=max(g,stroke(p,vec2(.22,.8),vec2(.22,.5)));
 if(hash(seed+5.)>.4)g=max(g,stroke(p,vec2(.78,.8),vec2(.78,.5)));
 if(hash(seed+6.)>.4)g=max(g,stroke(p,vec2(.22,.5),vec2(.22,.2)));
 if(hash(seed+7.)>.4)g=max(g,stroke(p,vec2(.78,.5),vec2(.78,.2)));
 if(hash(seed+8.)>.68)g=max(g,stroke(p,vec2(.22,.8),vec2(.78,.2)));
 return g;
}
void main(){
 vec2 uv=vUV.st;
 float energy=sqrt(clamp(uScene.w,0.,1.)), time=uScene.x;
 vec3 color=vec3(.001,.006,.002);
 for(int layer=0;layer<3;layer++){
  float z=float(layer), cols=48.+z*26., rows=cols/uScene.z*1.45;
  // Integrated audio clock controls speed, so a syllable never teleports a stream.
  float zoom=1.+energy*.055*(2.-z);
  vec2 p=(uv-.5)/zoom+.5;
  float column=floor(p.x*cols);
  float seed=column*13.7+z*117.;
  float drift=time*(.48+hash(seed)*.65)/(1.+z*.32);
  float yy=p.y*rows+drift*rows;
  float row=floor(yy);
  float cycle=rows*1.45;
  float offset=hash(seed+31.)*cycle;
  float fromHead=mod(row-offset,cycle);
  float length=10.+hash(seed+41.)*22.;
  float tail=exp(-fromHead/(length*.35))*(1.-smoothstep(length-2.,length,fromHead));
  float head=1.-smoothstep(.3,1.8,fromHead);
  float density=smoothstep(hash(seed+5.)-.10,hash(seed+5.)+.10,.55+energy*.40);
  vec2 cell=vec2(fract(p.x*cols),fract(yy));
  float ink=glyph(cell,column*139.+row*17.+z*197.);
  vec3 green=mix(vec3(.025,.65,.12),vec3(.62,1.,.72),head);
  float brightness=(.80-z*.24)*density;
  color+=green*ink*tail*brightness;
  // Restrained continuous bloom along each falling stream.
  float glow=exp(-abs(cell.x-.5)*8.)*tail*.055;
  color+=vec3(.02,.35,.06)*glow*brightness;
 }
 color*=.8+.2*(1.-length(uv-.5));
 fragColor=TDOutputSwizzle(vec4(1.-exp(-color*1.5),1.));
}
