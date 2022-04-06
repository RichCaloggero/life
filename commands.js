import {KeyboardKey} from "./keyboard.js";
import {wrap} from "./grid.js";
import {$} from "./dom.js";

export function keyboardHandler(e, display) {
const key = new KeyboardKey(e).toString();
const buffer = display?.buffer;
const size = display?.size || 1;
const cellCount = size*size;
const index = display?.checkboxMap.get(display.getFocus()) || 0;
const rowIndex = Math.floor(index/size);
const columnIndex = Math.floor(index%size);


const commands = {
"F1": {
preventDefault: true,
description: "Show keyboard help",
command: help
},
"?": {
preventDefault: true,
description: "Show keyboard help",
command: help
},

"control Enter": {
preventDefault: true,
description: "Sonify current position in grid",
command: function sonifyPosition () {
life.sonifyPosition(index);
} // sonifyPosition
},

"control g": {
preventDefault: true,
description: "Shift focus to grid",
command: function navigateToGrid () {display.focus(display.getFocus());}
},
"control Home": {
description: "Navigate to first cell in grid",
command: function firstCell () {display.focus(buffer[0]);}
},
"control End": {
description: "Navigate to last cell in grid",
command: function lastCell () {display.focus(buffer[cellCount-1]);}
},
"Home": {
description: "Navigate to start of current row",
command: function rowStart () {display.focus(buffer[rowIndex * size]);}
},
"End": {
description: "Navigate to end of current row",
command: function rowEnd () {display.focus(buffer[rowIndex * size + size-1]);}
},

"alt ArrowUp": {
description: "Navigate to previous row, stopping at first row",
command: function previousRow () {
if (index >= size) display.focus(buffer[index-size]);
} // previousRow
},
"ArrowUp": {
description: "Move to previous row with wrap",
command: function previousRowWrap () {
display.focus(buffer[wrap(index-size, cellCount-1)]);
} // previousRowWrap 
},

"alt ArrowDown": {
description: "Move to next row",
command: function nextRow () {
if (index+size < cellCount) display.focus(buffer[index+size]);
} // nextRow
},
"ArrowDown": {
description: "Move to next row with wrap",
command: function nextRowWrap () {
display.focus(buffer[wrap(index+size, cellCount-1)]);
} // nextRowWrap
},

"alt ArrowLeft": {
description: "Move to previous column",
command: function previousColumn () {
if (index%size > 0) display.focus(previousCell(index));
} // previousColumn
},
"control ArrowLeft": {
description: "Move to previous live cell",
command: function previousLiveCell () {
display.focus(previousLiveCell(index));
} // previousLiveCell
},
"ArrowLeft": {
description: "Move to previous column with wrap",
command: function previousColumnWrap () {
display.focus(buffer[wrap(index-1, cellCount-1)]);
} // previousColumnWrap
},

"alt ArrowRight": {
description: "Move to next column",
command: function nextColumn () {
if (index%size < size-1) display.focus(nextCell(index));
} // nextColumn
},
"Control ArrowRight": {
description: "Move to next live cell",
command: function nextLiveCell () {
display.focus(nextLiveCell(index));
} // nextLiveCell
},
"ArrowRight": {
description: "Move to next column with wrap",
command: function nextColumnWrap () {
display.focus(buffer[wrap(index+1, cellCount-1)]);
} // nextColumnWrap
},
}; // commands

if (key && commands[key]?.command instanceof Function) {
if (commands[key].preventDefault) e.preventDefault();
commands[key].command();
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
const text = `
<table><tr>
<th>Key</th>
<th>Description</th>
</tr>
${getCommandDescriptions(commands).map(entry =>
`<tr>
<th>${entry[0]}</th>
<td>${entry[1]}</td>
</tr>`)
.join("")}
</table>
`;

const modal = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
<div class="header">
<h3>Grid Navigation</h3>
<button class="close">Close</button>
</div>
<div class="body"></div>
</div>
`; // dialog

const returnFocus = document.activeElement === document.body? display.getFocus() : document.activeElement;
const container = document.createElement("div");
container.innerHTML = modal;
$(".body", container).innerHTML = text;
document.body.appendChild(container);
container.addEventListener("click", () => {
container.remove()
returnFocus.focus();
//display.focus(display.getFocus());
});
container.addEventListener("keydown", e => {
if (e.key === "Escape") e.target.click();
});

$(".close", container).focus();

function getCommandDescriptions (commands) {
return Object.keys(commands).map(key => [key, commands[key].description]);
} // getCommandDescriptions

} // help

} // keyboardHandler
