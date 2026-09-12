// Original generated portrait, animated locally with a bounded cloth/breath warp.
uniform vec4 uAudio;
uniform vec4 uScene;
out vec4 fragColor;
void main(){
 vec2 uv=vUV.st;
 float breath=clamp(uScene.w,0.,1.);
 float immediate=clamp(uAudio.x,0.,1.);
 float phase=uScene.x;
 // Fix the face and the outer background; deform a broad clothed torso region.
 float torso=exp(-pow((uv.x-.5)/.205,4.))*smoothstep(.04,.18,uv.y)*(1.-smoothstep(.49,.58,uv.y));
 vec2 sampleUV=uv;
 sampleUV.x=.5+(uv.x-.5)/(1.+breath*.045*torso);
 sampleUV.y-=breath*.010*torso;
 float fabric=sin(uv.y*24.+uv.x*9.-phase*.38)*sin(uv.x*18.+phase*.23);
 sampleUV.x+=fabric*(.0005+immediate*.002)*torso;
 sampleUV.y+=sin(uv.x*27.-phase*.31)*immediate*.0012*torso;
 vec3 portrait=texture(sTD2DInputs[1],clamp(sampleUV,vec2(.001),vec2(.999))).rgb;
 fragColor=TDOutputSwizzle(vec4(portrait,1.));
}
