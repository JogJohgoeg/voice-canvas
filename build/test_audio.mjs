import assert from 'node:assert/strict';
import {features} from '../web/audio.mjs';
const rate=48000,samples=Float32Array.from({length:2048},(_,i)=>.1*Math.sin(2*Math.PI*220*i/rate)),spectrum=new Float32Array(1024).fill(-120);spectrum[20]=-10;
const f=features(samples,spectrum,rate,{rms:.01});assert.ok(f.rms>.065&&f.rms<.075);assert.ok(Math.abs(f.pitch-220)<5);assert.ok(Math.abs(f.centroid-468.75)<20);assert.equal(f.onset,true);
const quiet=features(new Float32Array(2048),new Float32Array(1024).fill(-Infinity),rate);assert.equal(quiet.rms,0);assert.equal(quiet.pitch,0);assert.equal(quiet.onset,false);
console.log('Audio: 7 assertions passed',JSON.stringify(f));

const shifted=new Float32Array(1024).fill(-120);shifted[500]=-10;const bright=features(samples,shifted,rate,f);assert.ok(bright.flux>.9);assert.equal(bright.onset,true);const steady=features(samples,shifted,rate,bright);assert.ok(steady.flux<.001);assert.equal(steady.onset,false);console.log('Spectral onset and steady-tone rejection: passed');
