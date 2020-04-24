export class Grid {
constructor (rowCount, columnCount) {
this.rowCount = rowCount;
this.columnCount = columnCount;
this.buffer = new Uint8Array(rowCount * columnCount);
this.next = new Uint8Array(rowCount * columnCount);
//debugger;
} // constructor

getValue (r, c) {
return this.buffer[this._index(r,c)];
} // getValue

setValue (r, c, value) {
this.buffer[this._index(r, c)] = value;
} // setValue


_index (r, c) {
r = wrap(r, this.rowCount-1);
c = wrap(c, this.columnCount-1);
//console.debug(r,c);
return this.columnCount * r + c;
} // _index
} // class Grid

function wrap (value, max) {
if (value > max) return value-max-1;
else if (value < 0) return max + value + 1;
else return value;
} // wrap
