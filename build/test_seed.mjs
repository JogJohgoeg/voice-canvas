import assert from 'node:assert/strict';
import {seeded,parameters} from '../web/av_patch.mjs';
const first=parameters(317),sequence=Array.from({length:64},seeded(317));
assert.deepEqual(parameters(317),first);
assert.deepEqual(Array.from({length:64},seeded(317)),sequence);
assert.notDeepEqual(parameters(318),first);
for(const seed of [0,1,317,2147483648,4294967295]){
 const p=parameters(seed);assert([2,4,6].includes(p.symmetry));assert(p.period>=8&&p.period<=20);assert(p.density>=.5&&p.density<=1.5);assert(p.delay<1&&p.grain<.2);
}
console.log('Seed reproducibility, distinct patches and bounded synthesis parameters passed');
