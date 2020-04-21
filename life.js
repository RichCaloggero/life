import {Grid} from "./grid.js";

export class Life {
constructor (size, generationInterval = 0.3, initiallyLiving = 0.5) {
this.size = size;
this.initiallyLiving = initiallyLiving;
this.cellCount = Math.pow(this.size, 2);
this.current = new Grid(size, size);
this.next = new Grid(size, size);
this.stopCallback = null;
this.generationInterval = generationInterval;
this.generation = 0;
this.audio = initializeAudio(size, generationInterval);
this.testMode = false;
this.alive = {current: -1, next: -1};
statusMessage(`created 2 grids of size ${this.size} containing ${this.cellCount} cells.`);
} // constructor

start () {
const self = this;
self.shouldStop = false;
self.generation = 0;
seedGrid(self.current, this.initiallyLiving * this.cellCount);
self.startAudio();
self.alive = {current: -1, next: -1};

_tick(self);
} // start

stop () {
this.shouldStop = true;
} // stop

flip () {
const t = this.current;
this.current = this.next;
this.next = t;
} // flip

startAudio () {
this.audio.output.gain.value = 0.2;
//this.audio.output.gain.value = Math.max(7/this.cellCount, 0.3);
} // startAudio

stopAudio () {
this.audio.output.gain.value = 0;
} // stopAudio


present () {
this.sonify();
} // present

sonify () {
const grid = this.current;
const audio = this.audio;
const size = this.size;
const cellCount = this.cellCount;
const total = sum(grid.buffer);
this.audio.output.gain.value = total !== 0?
.04/total : 0;

for (let i = 0; i<cellCount; i++) {
const alive = grid.buffer[i];
audio.position[i].gain.gain.value = alive;
const p = audio.position[i].panner;
/*if (alive !== 0) statusMessage(`
${Math.floor(i/size)}, ${i%size}
= ${p.positionZ.value.toFixed(2)}, ${p.positionX.value.toFixed(2)}`
);
*/
//debugger;
} // for
} // sonify

/// test mode
enableTestMode (enable) {
this.testMode = !!enable;
if (enable) {
this.startAudio();
this.generation = 0;
this.alive = {current: -1, next: -1};
this.shouldStop = false;
} else {
this.stop();
this.stopAudio();
} // if
} // testMode

clear () {if (this.testMode) this.current.buffer.fill(0);}

step () {
if(this.testMode) {
const self = this;
self.startAudio();
self.shouldStop = false;
_tick(this);
setTimeout(() => self.stopAudio(), 500);
} // if
} // step

setCell (r, c) {
if (this.testMode) {
this.alive = {current: -1, next: -1};
this.shouldStop = false;
this.current.setValue(r, c, 1);
//statusMessage(`${[r,c]}`);
} // if
} // setCell

} // class Life

function _tick (self) {
if (self.alive.current === 0) return;
self.generation += 1;
if (self.generation % 50 === 0) statusMessage(`generation ${self.generation}`);
self.present();
self.alive = calculateNextGeneration(self.current, self.next, self.generation);


if (self.shouldStop || self.alive.current === 0) {
self.stopAudio();

if (self.stopCallback && self.stopCallback instanceof Function) self.stopCallback(self.alive);
else if (self.shouldStop) statusMessage(`Stopped at generation ${self.generation}`);
else statusMessage(`All dead at generation ${self.generation}: alive = ${self.alive.current}, ${self.alive.next}.`);

return;
} // if

self.flip();
if (!self.testMode) setTimeout(() => _tick(self), self.generationInterval * 1000);
else statusMessage(`Generation ${self.generation}`);
} // _tick

function calculateNextGeneration (current, next) {
/* - if the sum of all nine fields in a given neighbourhood is three, the inner field state for the next generation will be life;
- if the all-field sum is four, the inner field retains its current state;
- and every other sum sets the inner field to death. 
*/

const size = current.rowCount;
let currentSum = 0;
let nextSum = 0;

for (let r = 0; r < size; r++) {
for (let c = 0; c <  size; c++) {
const currentCell = current.getValue(r, c);
const sum = currentCell + sumNeighbors(current, r, c);

if (sum === 3) next.setValue(r, c, 1);
else if (sum === 4) next.setValue(r, c, currentCell);
else next.setValue(r, c, 0);

currentSum += currentCell;
nextSum += next.getValue(r, c);
} // column
} // row

return {current: currentSum, next: nextSum};
} // calculateNextGeneration

function neighbors (r, c) {
return [].concat([
[r+1,c], [r-1,c],
[r,c+1], [r,c-1],
[r-1,c-1], [r-1,c+1],
[r+1,c-1], [r+1,c+1]
]); // concat
} // neighbors

export function statusMessage (text, append) {
const status = document.querySelector("#status");
if (status) {
status.innerHTML = append? `${status.innerHTML}<br>${text}`
: text;
//setTimeout(() => status.innerHTML = "", 5000);
} else if (alert) {
alert(text);
} else {
console.log(text);
} // if
} // statusMessage

function seedGrid (grid, count = 10) {
if (grid.rowCount < 2 || grid.rowCount !== grid.columnCount) {
statusMessage("grid must be square with size greater than 1.");
throw new Error(`invalid grid size: ${grid.rowCount}, ${grid.columnCount}`);
} // if
statusMessage(`seeding grid with ${count} values...`);

const maxIndex = grid.rowCount-1;
let values = 0;
while (values < count) {
const r = random(0, maxIndex);
const c = random(0, maxIndex);

if (grid.getValue(r, c) === 0) {
choose(2, neighbors(r, c))
.forEach(neighbor => grid.setValue(...neighbor, 1));
values += 1;
} // if
} // while

statusMessage(`seeded grid with ${values} values.`);
} // seedGrid

function choose (n, a) {
if (n > a.length) return [];
else if (n === a.length) return a;

const indicies = [];
do {
const index = random(0, a.length-1);
if (!indicies.includes(index)) indicies.push(index);
} while (indicies.length < n);

return indicies.map(i => a[i]);
} // choose

function sumNeighbors (grid, r, c) {
return sum(neighbors(r, c)
.map(coordinates => grid.getValue(...coordinates)));
} // sumNeighbors

function sum (a) {return a.reduce((sum, x) => sum += x, 0);}

function random (a, b) {
return Math.floor(Math.random() * (b-a) + a);
} // random

function initializeAudio (size, generationInterval) {
const cellCount = size * size;

const audio = {
context: new AudioContext(),
position: [],
};

audio.source = {live: createSource(1), dead: createSource(0)};
audio.output = audio.context.createGain();
audio.compressor = audio.context.createDynamicsCompressor();
audio.compressor.threshold.value = -15;
audio.compressor.knee.value = 0;
audio.compressor.ratio.value = 20;
audio.compressor.attack.value = audio.compressor.release.value = (0.9*generationInterval)/2;

audio.context.listener.setPosition(0, 0, 0);
audio.context.listener.setOrientation(0,0,0, 0,0,0);

audio.output.gain.value = 0;
//audio.compressor.connect(audio.output)
audio.output.connect(audio.context.destination);
console.debug("audio initialized\n");

for (let r = 0; r < size; r++) {
for (let c = 0; c < size; c++) {
audio.position[r*size+c] = createPositioner(r, c, size);
} // for c
} // for r
//console.debug("audio positioners created\n", audio);
return audio;


function createPositioner (r, c, size) {
const p = audio.context.createPanner();
const g = audio.context.createGain();
p.coneInnerAngle = 360;
//p.coneOuterAngle = 0;
//p.coneOuterGain = 1;
p.orientationX.value = p.orientationY.value = p.orientationZ.value  = 0;
p.panningModel = "equalpower";
p.refDistance = 0.5;
p.rollofFactor = 0.5;
g.gain.value = 0;

p.positionX.value = -scale(c, 0,size, -1,1);
p.positionZ.value = scale(r, 0,size, -1,1);

audio.source.live.connect(p).connect(g).connect(audio.output);
//audio.source.live.connect(g).connect(p).connect(audio.compressor);
return {gain: g, panner: p};
} // createPositioner

function createSource (state) {
const liveFrequency = 440;
const deadFrequency = 110;
const oscillator = audio.context.createOscillator();
oscillator.frequency.value = state? liveFrequency : deadFrequency;
oscillator.onended = () => statusMessage(`source ${oscillator.frequency.value} died.`);
oscillator.start();
return oscillator;
} // createSource
} // initializeAudio


function scale (_in, _inMin, _inMax, _outMin, _outMax) {
const scaleFactor = Math.abs(_outMax-_outMin) / Math.abs(_inMax-_inMin);
return scaleFactor * _in + _outMin;
} // scale
