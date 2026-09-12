import assert from 'node:assert/strict';
import {harmony,musicFeatures,spectrumChroma} from '../web/music.mjs';
import {readMidi} from '../web/midi.mjs';
const chroma=(notes)=>Array.from({length:12},(_,i)=>notes.includes(i)?1:0);
for(const [notes,quality] of [[[0,4,7],'major'],[[0,3,7],'minor'],[[0,3,6],'dim'],[[0,4,8],'aug'],[[0,4,7,10],'dominant']])assert.equal(harmony(chroma(notes)).quality,quality);
const f=musicFeatures();f.midi([144,60,100],0);f.midi([144,64,80],0);f.midi([144,67,90],0);assert.equal(f.update(.01).quality,'major');f.midi([176,64,127],.02);f.midi([128,60,0],.03);assert.equal(f.notes.size,3);f.midi([176,64,0],.04);assert.equal(f.notes.size,2);f.midi([144,64,0],.05);assert.equal(f.notes.size,1);f.midi([176,123,0],.06);assert.equal(f.notes.size,0);
const spec=new Float32Array(4096).fill(-120);spec[Math.round(440*8192/48000)]=-10;const a=spectrumChroma(spec,48000);assert.equal(a.chroma.indexOf(Math.max(...a.chroma)),9);
const bytes=[77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,13,0,144,60,100,131,96,60,0,0,255,47,0];bytes[21]=12;const midi=readMidi(new Uint8Array(bytes).buffer);assert.equal(midi.events.length,2);assert.equal(midi.events[1].time,.5);
assert.throws(()=>readMidi(new Uint8Array([1,2]).buffer));
const timeline=[[0,[144,60,80]],[.2,[144,64,100]],[.4,[144,67,70]],[1,[176,64,127]],[1.5,[128,60,0]],[2,[176,64,0]]];
function replay(){const m=musicFeatures(),out=[];let index=0;for(let t=0;t<3;t+=1/120){while(index<timeline.length&&timeline[index][0]<=t){m.midi(timeline[index][1],timeline[index][0]);index++;}out.push(m.update(t));}return out;}
assert.deepEqual(replay(),replay());console.log('Chord qualities, sustain, MIDI velocity-zero, chroma A, running status/timing and deterministic replay passed');
import {pianoMapping,mappingDefaults,localSection} from '../web/piano_mapping.mjs';
const musical={...replay()[200],tension:.8,dissonance:.7,dynamics:.9,register:.8,pedalWash:1,cadence:.8};
const active=pianoMapping(musical,mappingDefaults,317,localSection('Ondine'));
const disabled=pianoMapping(musical,{harmony:0,tension:0,dynamics:0,register:0,pedal:0,phrase:0},317,localSection('Ondine'));
assert.equal(disabled.evolution.piano.tension,0);assert.equal(disabled.evolution.piano.pedal,0);assert.equal(disabled.audio.level,0);assert(active.evolution.piano.colourMix>0);assert.notDeepEqual(active.evolution.piano.colour,pianoMapping(musical,mappingDefaults,317,localSection('flight and light')).evolution.piano.colour);
console.log('Independent mapping controls and section-derived palettes passed');
