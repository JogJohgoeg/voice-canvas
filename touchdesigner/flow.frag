// Original fictional portrait stays fixed; audio moves the surrounding stage light.
uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
void main(){
 vec2 uv=vUV.st;
 vec3 base=texture(sTD2DInputs[1],uv).rgb;
 float level=clamp(uScene.w,0.,1.);
 float phase=uScene.x;
 float side=smoothstep(.10,.19,abs(uv.x-.5));
 float beam=.5+.5*sin(uv.x*11.+sin(uv.y*3.+phase*.3)*2.-phase*.7);
 float haze=exp(-pow((uv.y-.5)/.5,2.));
 vec3 tint=mix(vec3(.025,.08,.19),vec3(.10,.035,.16),clamp(uAudio.z,0.,1.));
 vec3 light=tint*side*haze*beam*(.15+level*1.8)*clamp(uScene.y,.1,3.);
 fragColor=TDOutputSwizzle(vec4(base+light,1.));
}
