import {works} from './works.mjs';
export function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function parameters(seed){const r=seeded(seed);return {work:Math.floor(r()*works.length),variant:r()*6.28,density:.65+r()*.7,effect:Math.floor(r()*5),strength:.3+r()*.5,base:55*2**Math.floor(r()*4),ratio:[.5,1.5,2,3][Math.floor(r()*4)],wave:['sine','triangle','sawtooth'][Math.floor(r()*3)],filter:['lowpass','bandpass'][Math.floor(r()*2)],cutoff:500+r()*1600,q:1+r()*4,lfo:[.03+r()*.1,.07+r()*.2,.11+r()*.3],delay:.12+r()*.45,reverb:.5+r(),grain:.035+r()*.12,probability:.2+r()*.45,interval:.22+r()*.5,drone:.025+r()*.04,period:8+r()*12,symmetry:[2,4,6][Math.floor(r()*3)]};}

// The particle shader's disperse phase is time * .45 * .7 + variant.
export function nextReform(p,time){const crossing=Math.PI-Math.asin(.65),rate=.315,cycle=2*Math.PI;return (crossing+Math.ceil((time*rate+p.variant-crossing)/cycle)*cycle-p.variant)/rate;}
