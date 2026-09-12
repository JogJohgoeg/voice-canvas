import assert from 'node:assert/strict';
import {performerStep,midiPerformer} from '../web/performer.mjs';
import {cinematicParameters} from '../web/cinematic.mjs';
for(let seed=0;seed<100;seed++){
 const p=cinematicParameters(seed),steps=Array.from({length:512},(_,i)=>performerStep(seed,i,p));
 assert.equal(new Set(steps.map(s=>s.section)).size,6);
 assert.deepEqual(steps,Array.from({length:512},(_,i)=>performerStep(seed,i,p)));
 assert.deepEqual(steps[16].motif,steps[192].motif);assert.notDeepEqual(steps[16].motif,steps[272].motif);
 assert(steps[248].cadence);assert.equal(steps[249].notes.length,0);
 assert(steps.flatMap(s=>s.notes).every(n=>n.midi>=21&&n.midi<=108&&n.strength>0&&n.strength<=1));
}
const sent=[],port={name:'Mock piano',id:'p',state:'connected',send:(data,time)=>sent.push({data,time}),clear:()=>sent.push({clear:true})};
Object.defineProperty(globalThis,'navigator',{value:{requestMIDIAccess:async()=>({outputs:new Map([['p',port]])})},configurable:true});
const midi=midiPerformer();await midi.discover();midi.send({kind:'piano',midi:60,strength:.8,time:1},{state:'running',currentTime:0},0);assert.equal(sent.length,0);
midi.select('p');midi.send({kind:'piano',midi:60,strength:.8,time:1,duration:.5},{state:'running',currentTime:0},0);assert.deepEqual(sent[0].data,[144,60,88]);assert.deepEqual(sent[1].data,[128,60,0]);assert.equal(sent[1].time-sent[0].time,500);midi.stop();assert(sent.some(s=>s.clear));assert(sent.some(s=>s.data?.join()==='176,64,0'));assert(sent.some(s=>s.data?.join()==='176,123,0'));console.log('100 seeded recitals: six sections, theme return, new cycles, coda rest; MIDI opt-in, timestamps and panic passed');
