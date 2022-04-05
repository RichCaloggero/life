# Sonified Conway's Game of Life

## Description

We have attempted to sonify the well known "Game of Life" using webaudio spacial positioning. Each cell is sonically placed such that the listener is in the middle of the grid and the left, right, top, and bottom edges of the grid are located sonically in the X-Z plane as defined by the webaudio spacial panner object.

There is a rutamentary  display as well using checkboxes. THe display is updated as the simulation runs, and you can change a cells state by toggling a checkbox.

## Running

You need to run the simulation from a web server since it uses JS modules. You can run it directly from github:

- [Run the Game of Life](https://RichCaloggero.github.io/RichCaloggero/life.git/blob/master/life.html)

## Setup

To begin, click the initialize button.

By default, your given a 10X10 grid and a generation interval of 0.1 seconds. If this is the first time your trying the simulation, click the "test seed" button to enter a simple 4-cell pattern that produces an interesting somewhat circular pattern. Next click run and listen with headphones.

The seed parameter, if set to a number between 0 and 1, will randomly seed the grid with the given fraction of live cells.

You can examine the grid by tabbing to the grid (last tabstop) and using arrow keys as described below.

### Grid Navigation

Key | Description
--- | ---
space bar | toggle a cell's state
alt+arrows | moves in the indicated direction, stopping at boundaries
unmodified arrows | moves in the indicated direction, moving across rows, and wrapping at first / last cell
control+enter | plays a sound which reflects the currently focused cell in the grid

## Conway's Game of Life From Wikipedia

https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life


### Rules

The universe of the Game of Life is an infinite, two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, alive or dead, (or populated and unpopulated, respectively). Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur: 

1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
2. Any live cell with two or three live neighbours lives on to the next generation.
3. Any live cell with more than three live neighbours dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

These rules, which compare the behavior of the automaton to real life, can be condensed into the following: 

1. Any live cell with two or three live neighbors survives.
2. Any dead cell with three live neighbors becomes a live cell.
3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.

The initial pattern constitutes the seed of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed; births and deaths occur simultaneously, and the discrete moment at which this happens is sometimes called a tick. Each generation is a pure function of the preceding one. The rules continue to be applied repeatedly to create further generations. 

### Algorithms

Early patterns with unknown futures, such as the R-pentomino, led computer programmers across the world to write programs to track the evolution of Life patterns.

Most of the early algorithms were similar: they represented Life patterns as two-dimensional arrays in computer memory. Typically two arrays are used: one to hold the current generation, and one to calculate its successor. Often 0 and 1 represent dead and live cells respectively. A nested for loop considers each element of the current array, in turn, counting the live neighbours of each cell to decide whether the corresponding element of the successor array should be 0 or 1. The successor array is displayed. For the next iteration, the arrays swap roles so that the successor array in the last iteration becomes the current array in the next iteration. 

A variety of minor enhancements to this basic scheme are possible, and there are many ways to save unnecessary computation.

A cell that did not change at the last time step, and none of whose neighbours changed, is guaranteed not to change at the current time step as well. So, a program that keeps track of which areas are active can save time by not updating inactive zones.

To avoid decisions and branches in the counting loop, the rules can be rearranged from an egocentric approach of the inner field regarding its neighbours to a scientific observer's viewpoint:

- if the sum of all nine fields in a given neighbourhood is three, the inner field state for the next generation will be life;
- if the all-field sum is four, the inner field retains its current state;
- and every other sum sets the inner field to death. 

Alternatively, the programmer may abandon the notion of representing the Life field with a 2-dimensional array, and use a different data structure, such as a vector of coordinate pairs representing live cells. This approach allows the pattern to move about the field unhindered, as long as the population does not exceed the size of the live-coordinate array. The drawback is that counting live neighbours becomes a hash-table lookup or search operation, slowing down simulation speed. With more sophisticated data structures this problem can also be largely solved. 

For exploring large patterns at great time depths, sophisticated algorithms such as Hashlife may be useful. There is also a method, applicable to other cellular automata too, for implementation of the Game of Life using arbitrary asynchronous updates whilst still exactly emulating the behaviour of the synchronous game.

