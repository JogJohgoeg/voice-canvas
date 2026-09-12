import assert from 'node:assert/strict';
import {cinematicParameters,cinematicPianoNotes,cinematicArrangement} from '../web/cinematic.mjs';
for(let seed=0;seed<200;seed++){const p=cinematicParameters(seed);assert(p.tempo>=50&&p.tempo<=70);assert.deepEqual(p,cinematicParameters(seed));assert.equal(p.scale.length,7);assert(p.progression.every(v=>v>=0&&v<7));}
assert.notDeepEqual(cinematicParameters(317),cinematicParameters(318));console.log('Cinematic tempo bounds and seeded modal parameters passed');

const p=cinematicParameters(317),rich=Array.from({length:8},(_,i)=>cinematicPianoNotes(p,0,i,3)).flat(),sparse=Array.from({length:8},(_,i)=>cinematicPianoNotes(p,0,i,1)).flat();assert.deepEqual([...new Set(rich.map(n=>n.part))].sort(),["bass","middle","treble"]);assert(rich.length>sparse.length*3);assert(rich.every(n=>n.midi>=28&&n.midi<=90));console.log("Three piano registers, bounded polyphony plan and density choice passed");

const variations=Array.from({length:16},(_,phrase)=>cinematicArrangement(317,phrase));assert(new Set(variations.map(a=>JSON.stringify(a))).size>8);for(let i=0;i<16;i++){assert.deepEqual(variations[i],cinematicArrangement(317,i));assert(variations[i].parts>=2&&variations[i].parts<=3);assert.deepEqual(cinematicArrangement(317,i,3,false),cinematicArrangement(317,0,3,false));for(let t=0;t<16;t++)assert(cinematicPianoNotes(p,4,t,3,317,variations[i]).every(n=>n.midi>=21&&n.midi<=108));}console.log("Seeded phrase arrangements vary, remain bounded, and can be disabled");

const combinations=new Set();for(let seed=0;seed<100;seed++){const a=cinematicArrangement(seed,1,2);assert.equal(a.voices.length,a.parts);combinations.add(a.voices.join("+"));}assert(combinations.has("bass+treble")&&combinations.has("middle+treble")&&combinations.has("bass+middle"));console.log("Random combinations include bass/treble, arpeggio/treble and bass/arpeggio");
