import assert from 'node:assert/strict';
import {cinematicParameters} from '../web/cinematic.mjs';
for(let seed=0;seed<200;seed++){const p=cinematicParameters(seed);assert(p.tempo>=50&&p.tempo<=70);assert.deepEqual(p,cinematicParameters(seed));assert.equal(p.scale.length,7);assert(p.progression.every(v=>v>=0&&v<7));}
assert.notDeepEqual(cinematicParameters(317),cinematicParameters(318));console.log('Cinematic tempo bounds and seeded modal parameters passed');
