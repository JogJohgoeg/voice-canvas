import assert from 'node:assert/strict';
import {parse,apply,initial,subjects} from '../web/parser.mjs';
assert.ok(Object.values(subjects).flat().length>=40);
let s=apply(initial(),parse('三个红色气球在左边飞'));
assert.equal(s.objects.length,3);assert.equal(s.objects[0].colour,'#ff6b78');assert.equal(s.objects[0].motion,'fly');assert.ok(s.objects.every(o=>o.x<.4));
s=apply(s,parse('night, rain, slower'));assert.equal(s.night,true);assert.equal(s.weather,'rain');assert.equal(s.speed,.35);
assert.equal(apply(s,parse('stop rain')).weather,null);
assert.equal(parse('撤销')[0].command,'undo');assert.equal(apply(s,parse('clear')).objects.length,0);
assert.equal(apply(initial(),parse('three blue cats and a gold moon')).objects.length,4);
assert.equal(parse('train')[0].weather,undefined);
assert.deepEqual(parse('奇妙的梦境'),parse('奇妙的梦境'));assert.equal(parse('  ').length,0);
assert.equal(apply(s,parse('变成紫色')).objects.at(-1).colour,'#c394ff');
assert.equal(apply(initial(),parse('999 stars')).objects.length,24);
console.log('Parser: 15 assertions passed; '+Object.values(subjects).flat().length+' subject aliases');

const {formPlan}=await import('../web/particles.mjs');const plan=formPlan(apply(initial(),parse('night ocean many stars red fire')));assert.ok(plan.some(g=>g.family===1));assert.ok(plan.some(g=>g.family===0));assert.equal(plan.length,3);assert.ok(formPlan(apply(initial(),parse('未知星云梦境'))).length);console.log('Multi-family particle semantics: passed');

const {particleColour}=await import('../web/particles.mjs');
const mixed=apply(initial(),parse('night ocean many stars red fire'));
assert.equal(mixed.objects.find(o=>o.kind==='sea').tint,undefined);
assert.equal(mixed.objects.find(o=>o.kind==='fire').tint,'#ff6b78');
const ocean=particleColour(formPlan(mixed).find(g=>g.family===1)),fire=particleColour(formPlan(mixed).find(g=>g.family===0));assert.ok(ocean[2]>ocean[0]*3);assert.ok(fire[0]>fire[2]);
const purple=apply(apply(initial(),parse('海')),parse('变成紫色'));assert.equal(formPlan(purple)[0].tint,'#c394ff');
assert.equal(formPlan(apply(initial(),parse('一个海')))[0].weight,1);assert.equal(formPlan(apply(initial(),parse('很多海')))[0].weight,12);
console.log('Local colour binding, explicit recolour and quantity weights: passed');

const {works,shuffledWorks}=await import('../web/works.mjs');assert.equal(works.length,29);const bag=shuffledWorks(3);assert.equal(new Set(bag).size,works.length);assert.notEqual(bag.at(-1),3);assert.ok(works.every(w=>w.colours.length===2&&w.family>=0&&w.family<=4));console.log('All work presets and no-repeat shuffle bag: passed');

const unknownGroup=formPlan(apply(initial(),parse('quuxnebula')))[0];assert.ok(unknownGroup.abstract);assert.notDeepEqual(particleColour(unknownGroup),particleColour({...unknownGroup,seed:unknownGroup.seed+137}));console.log('Unknown-word deterministic hue/group seed: passed');
