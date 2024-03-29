import {Grid} from "./grid.js";

export class Life {
constructor (size = 10, initiallyLiving = 0.5, panningModel = "HRTF") {
this.size = size;
this.initiallyLiving = initiallyLiving;
this.panningModel = panningModel;

this.cellCount = Math.pow(this.size, 2);
this.current = new Grid(size, size);
this.next = new Grid(size, size);
this.stopCallback = this.sonifyCallback = this.displayCallback = null;
this.running = false;
this.generation = 0;
this.generationInterval = 0;

this.audio = initializeAudio(size, this.panningModel);
this.testMode = false;
this.alive = {current: -1, next: -1};
statusMessage(`created 2 grids of size ${this.size} containing ${this.cellCount} cells.`);
} // constructor

start (generationInterval = 0.1, generation = 0) {
const self = this;
self.shouldStop = false;
self.generation = generation;
self.generationInterval = generationInterval;

if (sum(self.current.buffer) === 0) {
self.clear();
if (self.initiallyLiving > 0) statusMessage(`- ${seedGrid(self.current, self.initiallyLiving * self.cellCount)}`);
self.alive = {current: -1, next: -1};
} // if

self.startAudio();
self.running = true;
self.alive = _tick(self);
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
if (this.displayCallback instanceof Function) this.displayCallback(this.current);
if (this.sonifyCallback instanceof Function) this.sonifyCallback(this);
else this.sonify();
} // present

sonify (aliveSound = "noise", deadSound) {
if (!aliveSound && !deadSound) return;
const grid = this.current;
const audio = this.audio;
const size = this.size;
const cellCount = this.cellCount;
if (aliveSound && deadSound) {
audio.output.gain.value = 0.1/cellCount;
} else {
const total = sum(grid.buffer);
this.audio.output.gain.value = total !== 0?
.04/total : 0;
} // if

for (let i = 0; i<cellCount; i++) {
const cellValue = grid.buffer[i];
const p = audio.position[i];
if (aliveSound )
p[aliveSound].gain.value = cellValue !== 0? 1 : 0;

if (deadSound )
p[deadSound].gain.value = cellValue !== 0? 1 : 0;

//debugger;
} // for
} // sonify


sonifyPosition (index, sound = "noise") {
if (this.running) return;
const self = this;
//debugger;
const p = self.audio.position[index][sound];
self.audio.output.gain.value = 0.5;
p.gain.value = 0.5;
setTimeout (() => {
self.audio.output.gain.value = 0;
p.gain.value = 0;
}, 500);
} // sonifyPosition


setFilter (frequency, q) {
audio.position.forEach(p => {
p.filter.frequency.value = frequency;
p.filter.Q.value = q;
}); // forEach
} // setFilter

clear () {this.current.buffer.fill(0);}

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


step () {
if(this.testMode) {
const self = this;
self.alive = {current: -1, next: -1};
self.shouldStop = false;
self.startAudio();
_tick(self);
setTimeout(() => self.stopAudio(), 500);
} // if
} // step

setCell (r, c) {
if (this.testMode) {
this.current.setValue(r, c, 1);
statusMessage(`${[r,c]}`);
} // if
} // setCell

setBuffer (...values) {
values.flat(2).forEach(value => this.current.buffer[value] = 1);
} // setBuffer

} // class Life

function _tick (self) {
if (self.shouldStop || self.alive.current === 0) {
self.stopAudio();
self.running = false;

if (self.stopCallback && self.stopCallback instanceof Function) self.stopCallback(self.alive, self.generation);
else if (self.shouldStop) statusMessage(`Stopped at generation ${self.generation}`);
else statusMessage(`All dead at generation ${self.generation}: alive = ${self.alive.current}, ${self.alive.next}.`);

return self.alive;
} // if

const shouldReport = self.generationInterval > 0.03? 50
: self.generationInterval > 0.02? 100
: self.generationInterval > 0.01? 200
: 0;
self.generation += 1;
if (shouldReport > 0 && self.generation % shouldReport === 0) statusMessage(`generation ${self.generation}`);
self.present();
self.alive = calculateNextGeneration(self.current, self.next, self.generation);


self.flip();
if (self.testMode) statusMessage(`Generation ${self.generation}`);
else setTimeout(() => {
/*console.log(`interval: ${self.generationInterval}`);
self.stopAudio();
return;
*/
_tick(self)
}, self.generationInterval * 1000);
return self.alive;
} // _tick

function calculateNextGeneration (current, next) {
const size = current.rowCount;
let currentSum = 0;
let nextSum = 0;

for (let r = 0; r < size; r++) {
for (let c = 0; c <  size; c++) {
const currentCell = current.getValue(r, c);
const sum = sumNeighbors(current, r, c);

if (currentCell === 1) {
next.setValue(r, c, (sum < 2 || sum > 3)? 0 : 1);
} else {
next.setValue(r, c, sum === 3? 1 : 0);
} // if

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
const values = [];

if (grid.rowCount < 2 || grid.rowCount !== grid.columnCount) {
statusMessage("grid must be square with size greater than 1.");
throw new Error(`invalid grid size: ${grid.rowCount}, ${grid.columnCount}`);
} // if
statusMessage(`seeding grid with ${count} values...`);

const maxIndex = grid.buffer.length-1;
while (count > 0) {
const value = random(0, maxIndex);
if (grid.buffer[value] === 0) {
grid.buffer[value] = 1;
count -= 1;
values.push(value);
} // if
} // for

return values;
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
return Math.floor(Math.random()*Math.random() * (b-a) + a);
} // random

function initializeAudio (size, panningModel) {
const cellCount = size * size;

const audio = {
context: new AudioContext(),
position: [],
};

audio.source = {highTone: createTone(220), lowTone: createTone(110), noise: createNoiseSource()};
audio.output = audio.context.createGain();

audio.context.listener.setPosition(size/2, 0, size/2);
audio.context.listener.setOrientation(0,0,0, 0,0,0);

audio.output.gain.value = 0;
//audio.compressor.connect(audio.output)
audio.output.connect(audio.context.destination);
console.debug("audio initialized\n");

for (let r = 0; r < size; r++) {
for (let c = 0; c < size; c++) {
audio.position[r*size + c] = createPositioner(r, c, size, panningModel);
} // for c
} // for r
//console.debug("audio positioners created\n", audio);
return audio;


function createPositioner (r, c, size, panningModel = "HRTF") {
const p = audio.context.createPanner();
p.coneInnerAngle = 360;
p.maxDistance = size/2 + 1;
p.refDistance = size/4;
p.distanceModel = "inverse";
p.rollofFactor = 0.5;
p.orientationX.value = p.orientationY.value = p.orientationZ.value  = 0;
p.panningModel = panningModel;
//p.coneOuterAngle = 0;
//p.coneOuterGain = 1;
//p.refDistance = 0.5;
//p.rollofFactor = 0.5;

p.positionX.value = c;
p.positionZ.value = r;

//p.positionX.value = -scale(c, 0,size, -1,1);
//p.positionZ.value = scale(r, 0,size, -1,1);

const highTone = audio.context.createGain();
const lowTone = audio.context.createGain();
const noise = audio.context.createGain();
highTone.gain.value = lowTone.gain.value = noise.gain.value = 0;

audio.source.highTone.connect(highTone).connect(p);
audio.source.lowTone.connect(lowTone).connect(p);
audio.source.noise.connect(noise).connect(p);
p.connect(audio.output);
return {highTone, lowTone, noise, panner: p};
} // createPositioner

function createTone (frequency) {
const oscillator = audio.context.createOscillator();
oscillator.frequency.value = frequency;
oscillator.onended = () => statusMessage(`source ${oscillator.frequency.value} died.`);
oscillator.start();
return oscillator;
} // createSource


function createNoiseSource (lengthFactor = 1/185) {
const buffer = audio.context.createBuffer(1, lengthFactor*audio.context.sampleRate, audio.context.sampleRate);
const data = buffer.getChannelData(0);
for (let i=0; i<data.length; i++) {
data[i] = scale(Math.random(), 0,1, -1,1);
} // for
data[data.length-1] = data[0];

const source = audio.context.createBufferSource();
source.buffer = buffer;
source.loop = true;

const filter = audio.context.createBiquadFilter();
filter.type = "bandpass";
filter.frequency.value = 1000;
filter.Q.value = 1;
source.connect(filter);
source.start();
return filter;
} // createNoiseSource
} // initializeAudio


function scale (_in, _inMin, _inMax, _outMin, _outMax) {
const scaleFactor = Math.abs(_outMax-_outMin) / Math.abs(_inMax-_inMin);
return scaleFactor * _in + _outMin;
} // scale

