import assert from 'node:assert/strict';
import {backgroundVariation} from '../web/background.mjs';
import {validate} from '../cloud/worker.mjs';
for(const seed of [0,317,9182,4294967295]){
 const phrases=Array.from({length:12},(_,i)=>backgroundVariation(seed,i));
 for(const p of phrases)validate(p);
 assert.equal(new Set(phrases.map(p=>JSON.stringify(p.notes))).size,12);
 assert.deepEqual(backgroundVariation(seed,3),backgroundVariation(seed,3));
 assert(new Set(phrases.map(p=>p.notes.length)).size>1);
}
assert.notDeepEqual(backgroundVariation(317).notes,backgroundVariation(9182).notes);
console.log('Random background phrases vary by round/seed, reproduce by seed and satisfy score bounds');
