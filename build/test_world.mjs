import assert from 'node:assert/strict';import {chooseWorld,worldCamera} from '../web/world.mjs';
const items=[{piece:'glass-mishima',movement:'opening',brief:'pale courtyard',quality:'draft'},{piece:'glass-mishima',movement:'opening',brief:'pale courtyard',quality:'full'},{piece:'ravel-ondine',movement:'opening',brief:'water',quality:'draft'}];
assert.equal(chooseWorld(items,'Glass Mishima opening World').quality,'full');assert.equal(chooseWorld(items,'Ravel Ondine').piece,'ravel-ondine');assert.equal(chooseWorld(items,'Beethoven Moonlight'),undefined);assert.equal(chooseWorld([],'World'),undefined);
const quiet=worldCamera(12,{dynamics:0,tension:0,pedal:0}),loud=worldCamera(12,{dynamics:1,tension:1,pedal:1});assert(loud.exposure>quiet.exposure);assert(loud.fog>quiet.fog);assert.notEqual(loud.yaw,quiet.yaw);assert.deepEqual(worldCamera(12,{dynamics:1}),worldCamera(12,{dynamics:1}));console.log('World matching/full preference/missing fallback and seeded camera mapping passed');

const a=worldCamera(0,{}),b=worldCamera(120,{});assert(b.yaw-a.yaw>Math.PI*2);assert(Math.hypot(b.x-a.x,b.z-a.z)>.2);console.log("Automatic tour covers a full turn and translates without input");
