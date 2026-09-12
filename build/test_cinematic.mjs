import assert from 'node:assert/strict';
import {cinematicParameters,cinematicPianoNotes} from '../web/cinematic.mjs';
for(let seed=0;seed<200;seed++){const p=cinematicParameters(seed);assert(p.tempo>=50&&p.tempo<=70);assert.deepEqual(p,cinematicParameters(seed));assert.equal(p.scale.length,7);assert(p.progression.every(v=>v>=0&&v<7));}
assert.notDeepEqual(cinematicParameters(317),cinematicParameters(318));console.log('Cinematic tempo bounds and seeded modal parameters passed');

const p=cinematicParameters(317),rich=Array.from({length:8},(_,i)=>cinematicPianoNotes(p,0,i,3)).flat(),sparse=Array.from({length:8},(_,i)=>cinematicPianoNotes(p,0,i,1)).flat();assert.deepEqual([...new Set(rich.map(n=>n.part))].sort(),["bass","middle","treble"]);assert(rich.length>sparse.length*3);assert(rich.every(n=>n.midi>=28&&n.midi<=90));console.log("Three piano registers, bounded polyphony plan and density choice passed");
