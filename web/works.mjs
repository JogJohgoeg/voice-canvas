// Original procedural interpretations of every named work in the supplied audiovisual page.
// Sparse-description entries are interpretations, not reconstructions of the artist's footage/audio.
export const works = [
 {name:'Heliosphere',family:3,colours:['#168eff','#70ffe6'],effect:0,tempo:.9,density:1.1,sound:0},
 {name:'Strahlung',family:2,colours:['#c5c9d0','#f4eedc'],effect:4,tempo:.4,density:.75,sound:4},
 {name:'Golden Cuttlefish',family:4,colours:['#dc2039','#ffe5ae'],effect:1,tempo:.75,density:1.25,sound:1},
 {name:'Recycled Linoleum',family:2,colours:['#c6d0d6','#eeeeee'],effect:3,tempo:1.5,density:.85,sound:2},
 {name:'Polystyrene',family:3,colours:['#40dfff','#f5f8ff'],effect:2,tempo:1.8,density:1.2,sound:2},
 {name:'Curdle',family:4,colours:['#ef3ac7','#ffc43d'],effect:3,tempo:1.9,density:.85,sound:1},
 {name:'Strompspannung',family:1,colours:['#72dc90','#ffc44d'],effect:0,tempo:1.1,density:1.05,sound:2},
 {name:'Tourmaline',family:4,colours:['#b08cff','#68ddba'],effect:4,tempo:.6,density:1,sound:4},
 {name:'Mettabelum',family:2,colours:['#d6d0c8','#f6ca70'],effect:3,tempo:.6,density:.9,sound:3},
 {name:'Momentum BEAST',family:3,colours:['#ff5140','#377fff'],effect:2,tempo:1.5,density:1.3,sound:2},
 {name:'Ripples of Nono',family:1,colours:['#488dde','#ffc980'],effect:1,tempo:.55,density:1,sound:1},
 {name:'Aufbau',family:2,colours:['#49e79c','#6486ff'],effect:3,tempo:1,density:1.15,sound:3},
 {name:'Iridium',family:3,colours:['#5bddff','#e478f3'],effect:0,tempo:1.15,density:1.1,sound:0},
 {name:'Wolken',family:1,colours:['#a8b7c6','#f1f1ec'],effect:4,tempo:.35,density:.85,sound:4},
 {name:'Dark Eyed Junko · Multichannel',family:3,colours:['#eab66d','#6a93db'],effect:1,tempo:1.1,density:1.2,sound:1},
 {name:'Dark Eyed Junko',family:4,colours:['#f1bd54','#a7b4c4'],effect:1,tempo:1.2,density:.9,sound:1},
 {name:'Globule #5',family:4,colours:['#f2dcba','#d8455d'],effect:1,tempo:.7,density:1.2,sound:4},
 {name:'Schaben',family:2,colours:['#b1b8be','#c59853'],effect:2,tempo:1.7,density:.75,sound:2},
 {name:'Omega Index',family:2,colours:['#3fddcc','#87dc6b'],effect:3,tempo:1,density:1.1,sound:3},
 {name:'Fragments of Apricot',family:3,colours:['#ffad70','#e87fb0'],effect:2,tempo:1.4,density:.9,sound:1},
 {name:'Short Glitch Experiments',family:2,colours:['#5adcec','#ee5b53'],effect:3,tempo:2,density:1,sound:2},
 {name:'Phosphorus',family:3,colours:['#72fa92','#ddffe9'],effect:4,tempo:.9,density:1.1,sound:0},
];
// New web references: original procedural studies, not reproductions or sampled recordings.
works.push(
 {name:'数据条码 · Data Stripes',source:'https://www.ryojiikeda.com/project/testpattern/',brief:'Black and white point-built barcode columns; audio controls width and drift',geometry:1,family:2,colours:['#acb5bf','#ffffff'],effect:4,tempo:.7,density:.8,sound:2},
 {name:'谐振光场 · Harmonic Light',source:'https://memo.tv/projects/2019/shm/',brief:'Lissajous filaments and oscillators slowly moving in and out of phase',geometry:2,family:3,colours:['#67bfff','#fff3d9'],effect:4,tempo:.6,density:.9,sound:3},
 {name:'流动乐谱 · Flowing Score',source:'https://quayola.com/partitura-ligeti/',brief:'Parallel flowing score ribbons; pitch controls curvature and onsets separate strands',geometry:3,family:1,colours:['#f5af58','#a0f2da'],effect:1,tempo:.8,density:1.15,sound:1},
 {name:'机械微动 · Kinetic Array',source:'https://www.zimoun.net/cv/',brief:'Ordered arrays of tiny pendulums with asynchronous mechanical jitter',geometry:4,family:2,colours:['#bdab87','#e7e2d6'],effect:4,tempo:.5,density:.8,sound:2},
);
works.push(
 {name:'流体记忆 · Fluid Memory',source:'https://refikanadol.com/works/quantummemories/',brief:'Smoothly folding procedural noise volumes with dense coloured filaments; original study, no AI training or quantum simulation',geometry:5,family:1,colours:['#ef9272','#688eea'],effect:0,tempo:.45,density:1.2,sound:4},
 {name:'悬浮等高线 · Floating Contours',source:'https://joanielemercier.com/lamontagne/',brief:'Monochrome algorithmically deformed contour grids suspended in a black void; no ground plane',geometry:6,family:2,colours:['#91a1b6','#f1f4f7'],effect:4,tempo:.35,density:1.15,sound:3},
);
works.push({name:'相位干涉 · Phase Interference',source:'https://plantaproject.com/en/statement/art/unidisplay/',brief:'Mirrored monochrome point-built interference rings, phase drift and optical depth; original study inspired by modular perceptual effects',geometry:7,family:3,colours:['#b9c4d2','#f4f7fa'],effect:4,tempo:.45,density:1,sound:3});
export function shuffledWorks(previous=-1){
 const bag=works.map((_,i)=>i),random=crypto.getRandomValues(new Uint32Array(bag.length));
 for(let i=bag.length-1;i>0;i--){const j=random[i]%(i+1);[bag[i],bag[j]]=[bag[j],bag[i]];}
 if(bag.at(-1)===previous)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
 return bag;
}
