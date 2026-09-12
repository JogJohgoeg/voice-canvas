import {cinematicParameters,cinematicArrangement,cinematicPianoNotes} from './cinematic.mjs';
import {seeded} from './av_patch.mjs';
// Use the existing piano arranger to develop a new phrase on each shared-clock boundary.
export function backgroundVariation(seed,phrase=0){
 const params=cinematicParameters(seed),random=seeded(seed^Math.imul(phrase+1,7919)),notes=[];
 for(let bar=0;bar<4;bar++){
  const arrangement=cinematicArrangement(seed,phrase*4+bar,3,true),degree=params.progression[(bar+Math.floor(phrase/4))%params.progression.length];
  for(let tick=0;tick<8;tick++)for(const note of cinematicPianoNotes(params,degree,tick,3,(seed+phrase)>>>0,arrangement)){
   const beat=bar*4+tick*.5,duration=note.part==='bass'?1.5:random()<.4?.75:.5;
   notes.push([beat,note.midi,Math.min(duration,16-beat),Math.round(40+note.strength*40+random()*8)]);
  }
 }
 return {tempo:60,beats:16,style:'world',family:4,palette:['#2c3e50','#ecf0f1'],intensity:.4,seed:317,description:'钢琴自动变奏 '+(phrase+1),musicSeed:seed,variation:phrase,notes};
}
