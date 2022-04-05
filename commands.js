import {KeyboardKey} from "./keyboard.js";
import {wrap} from "./grid.js";

export function keyboardHandler(e, display) {
const key = new KeyboardKey(e).toString();
const buffer = display.buffer;
const size = display.size;
const cellCount = size*size;
const index = display.checkboxMap.get(display.getFocus());
const rowIndex = Math.floor(index/size);
const columnIndex = Math.floor(index%size);


const commands = {
"F1": help,
"?": help,

"control g": function navigateToGrid () {display.focus(display.getFocus());},

"control Home": function firstCell () {display.focus(buffer[0]);},
"control End": function lastCell () {display.focus(buffer[cellCount-1]);},
"Home": function rowStart () {display.focus(buffer[rowIndex * size]);},
"End": function rowEnd () {display.focus(buffer[rowIndex * size + size-1]);},

"alt ArrowUp": function previousRow () {
if (index >= size) display.focus(buffer[index-size]);
},
"ArrowUp": function previousRowWrap () {
display.focus(buffer[wrap(index-size, cellCount-1)]);
},

"alt ArrowDown": function nextRow () {
if (index+size < cellCount) display.focus(buffer[index+size]);
},
"ArrowDown": function nextRowWrap () {
display.focus(buffer[wrap(index+size, cellCount-1)]);
},

"alt ArrowLeft": function previousColumn () {
if (index%size > 0) display.focus(previousCell(index));
},
"control ArrowLeft": function previousLiveCell () {
display.focus(previousLiveCell(index));
}, "ArrowLeft": function previousColumnWrap () {
display.focus(buffer[wrap(index-1, cellCount-1)]);
},
"alt ArrowRight": function nextColumn () {
if (index%size < size-1) display.focus(nextCell(index));
},
"Control ArrowRight": function nextLiveCell () {
display.focus(nextLiveCell(index));
},
"ArrowRight": function nextColumnWrap () {
display.focus(buffer[wrap(index+1, cellCount-1)]);
},

"control Enter": function sonifyPosition () {
life.sonifyPosition(index);
}, // sonifyPosition
}; // commands

if (key && commands[key] instanceof Function) {
e.preventDefault();
commands[key]();
} // if

function nextCell (start) {return start<buffer.length-1? buffer[start+1] : buffer[start];}
function nextLiveCell (start) {
const cell = buffer.find((x,i) => i>start && buffer[i].checked);
return cell? cell : buffer[start];
} // nextLiveCell

function previousCell (start) {return start>0? buffer[start-1] : buffer[start];}
function previousLiveCell (start) {
const cell = buffer.entries().filter(x => x[0] < start && x[1].checked).at(-1)[1];
return cell? cell : buffer[start];
} // previousLiveCell

function help () {
const text = `<table>
<tr><th>key</th> <th>Description</th></tr>
<tr><th>alt + arrow</th>
<td>move in indicated direction, stopping at boundaries</td>
</tr><tr>
<th>unmodified arrow</th>
<td>move in indicated direction, continuing across row boundaries, wrapping at first / last cell</td>
</tr><tr>
<th>control + right / left arrows</th>
<td>next / previous live cell, continuing across row boundaries, no wrap</td>
</tr><tr>
<th>control + enter</th>
<td>Play a sound corresponding to the grid position of currently focused cell</td>
</tr></table>
`; // text

const modal = `<div class="modal" role="dialog" aria-model="true" aria-labelledby="help-modal-title">
<div class="header">
<h3>Grid Navigation</h3>
<button class="close">Close</button>
</div>
<div class="body"></div>
</div>
`; // dialog

const container = document.createElement("div");
container.innerHTML = modal;
$(".body", container).innerHTML = text;
document.body.appendChild(container);
container.addEventListener("click", () => {
container.remove()
display.focus(display.getFocus());
});
container.addEventListener("keydown", e => {
if (e.key === "Escape") e.target.click();
});

$(".close", container).focus();
} // help

} // keyboardHandler
