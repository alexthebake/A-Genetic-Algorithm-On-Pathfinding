/* Author: Alexander Bake
 * Last Updated: 05/21/2014
 * Title: "Graph" Abstraction using HTML tables
 *
 * Requirements: jQuery, and graph library
 */

// Graph Class
function Graph (n, m) {
	// Dimensions
	this.n = n;
	this.m = m;
	// The world
	this.grid = null;
	this.table = null;
	// Probability that there are of walls
	this.wall_amt = 0;

	// Initialization functions
	this.init = function (amt) {
		debugMsg("Initializing graph...");
		this.wall_amt = amt;
		this.grid = new Array (this.n);
		for (var i = 0; i < this.n; i++) {
			this.grid[i] = new Array (this.m);
			for (var j = 0; j < this.m; j++) {
				this.grid[i][j] = new GraphNode (i, j, this.makeWall(this.wall_amt));
			}
		}
	}

	this.reinit = function (n, m, amt) {
		debugMsg("Reinitializing graph...");
		this.n = n;
		this.m = m;
		this.grid = null;
		this.table.innerHTML = "";
		this.init(amt);
	}

	// Table functions
	this.assignTable = function (id) {
		debugMsg("Table with id: "+id+" assigned to the graph...");
		this.table = document.getElementById(id);
	}

	this.constructTable = function () {
		debugMsg("Constructing table...");
		for (var i = 0; i < this.n; i++) {
			var row_i = this.table.insertRow(i);
			for (var j = 0; j < this.m; j++) {
				row_i.insertCell(j);
				this.colorWall({x:i, y:j});
			}
		}
	}

	// Tool-kit functions
	this.getNode = function (coord) {
		return this.grid[coord.x][coord.y];
	}

	this.getNodeTable = function (node) {
		return this.table.rows[node.x].cells[node.y];
	}

	this.colorNode = function (coord, color) {
		if (!this.nodeIsWall(coord))
			$(this.getNodeTable(coord)).css("background-color", color);
	}

	this.colorWall = function (coord) {
		var color = this.getNode(coord).is_wall ? "#000000" : "#FFFFFF";
		$(this.getNodeTable(coord)).css("background-color", color);
	}

	this.colorAllWalls = function () {
		debugMsg("Coloring all walls!");
		for (var i = 0; i < this.n; i++) {
			for (var j = 0; j < this.m; j++) {
				this.colorWall({x:i, y:j});
			}
		}
	}

	this.colorAllNodes = function (color) {
		for (var i = 0; i < this.n; i++) {
			for (var j = 0; j < this.m; j++) {
				this.colorNode({x:i, y:j}, color);
			}
		}
	}

	this.nodeIsWall = function (coord) {
		return this.getNode(coord).is_wall;
	}

	this.nodeInGraph = function (coord) {
		if (coord.x < 0 || coord.y < 0 || 
			coord.x > this.n-1 || coord.y > this.m-1)
			return false;
		else
			return true;
	}

	this.makeWall = function (amt) {
		return Math.random() < amt;
	}
}

// GraphNode class
function GraphNode (x, y, is_wall) {
	this.x = x;
	this.y = y;
	this.coord = {x: this.x, y: this.y};
	this.is_wall = is_wall;

	this.updateIsWall = function (is_wall) {
		this.is_wall = is_wall;
	}
}