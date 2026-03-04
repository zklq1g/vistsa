import * as random from 'maath/random/dist/maath-random.esm.js';

const sphere = random.inSphere(new Float32Array(5000 * 3), { radius: 1.5 });
let nanCount = 0;
for (let i = 0; i < sphere.length; i++) {
    if (isNaN(sphere[i])) nanCount++;
}

console.log('Total coordinates:', sphere.length);
console.log('NaN count:', nanCount);
