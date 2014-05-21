/* Author: Alexander Bake
 * Last Updated: 05/21/2014
 * Title: A* In JavaScript
 *
 * Requirements: jQuery, and graph library
 */

// Global variables
var debug = true;
function debugMsg(string) {
	if (debug)
		console.log(string);
}
var clicks = 1;
function updateClicks () {
	clicks = (clicks + 1) % 2;
}

// Context for AStar Algorithm
function AStar (graph, heuristic) {
	_this = this;
	// Context of our search
	this.graph = graph;
	this.h = heuristic;
	// Start and end nodes are stored as coordinates
	this.start_coord = null;
	this.current_coord = null;
	this.end_coord = null;
	// Open and closed are arrays of AStarNodes
	this.open = [];
	this.closed = [];

	// Parameters of our search
	this.nswe_cost = 10; // Default
	this.diag_cost = 14; // Default
	this.diag_allowed = true; // Default
	this.setParameters = function (nswe_cost, diag_cost, diag_allowed, heuristic) {
		debugMsg("Setting A* Parameters to...");
		this.nswe_cost = nswe_cost;
		this.diag_cost = diag_cost;
		this.diag_allowed = diag_allowed;
		this.h = heuristic;
	}

	this.init = function () {
		if (this.graph.table !== null) {
			this.assignClickability();
		}
	}

	this.f = function (from_coord) {
		return this.getNodeOpen(from_coord).cost + this.h(from_coord, this.end_coord);
	}

	// Search functions
	this.initSearch = function (start_coord, end_coord) {
		debugMsg("Initializing A* Search functions");
		this.resetContext();
		this.start_coord = start_coord;
		this.current_coord = start_coord;
		this.end_coord = end_coord;

		// Add starting node to closed list
		this.closed.push(new AStarNode(this.graph.getNode(start_coord), null, 0));
		this.search();
	}

	this.resetContext = function () {
		debugMsg("Resetting Context");
		this.open = [];
		this.closed = [];
		this.start_coord = null;
		this.current_coord = null;
		this.end_coord = null;
		this.graph.colorAllWalls();
	}

	this.search = function () {
		if (this.getNodeClosed(this.current_coord).eq(this.end_coord)) {
			var path = this.determinePath();
			debugMsg(path);
			this.colorPath(path);
			return;
		}
		this.proximalSearch(this.current_coord);
		this.search();
	}

	// Looks at the proximity of the given node
	this.proximalSearch = function (node) {
		debugMsg("Performing a proximal search...");
		var proximity = {
			 n : {coord: {x: node.x,   y: node.y+1}, parent_coord: node, cost: this.nswe_cost},
			 s : {coord: {x: node.x,   y: node.y-1}, parent_coord: node, cost: this.nswe_cost},
			 w : {coord: {x: node.x-1, y: node.y},   parent_coord: node, cost: this.nswe_cost},
			 e : {coord: {x: node.x+1, y: node.y},   parent_coord: node, cost: this.nswe_cost},
			nw : {coord: {x: node.x-1, y: node.y+1}, parent_coord: node, cost: this.diag_cost},
			ne : {coord: {x: node.x+1, y: node.y+1}, parent_coord: node, cost: this.diag_cost},
			sw : {coord: {x: node.x-1, y: node.y-1}, parent_coord: node, cost: this.diag_cost},
			sw : {coord: {x: node.x+1, y: node.y-1}, parent_coord: node, cost: this.diag_cost}
		};
		proximity = this.validateProximity(proximity);
		this.updateOpen(proximity);
		this.colorOpen();
		this.chooseBestOpen();
	}

	this.determinePath = function () {
		debugMsg("Found it! Making a path...");
		var node = this.getNodeClosed(this.end_coord);
		var path = [node];
		// while (!node.eq(this.getNodeClosed(this.start_coord))) {
		while (node.parent !== null) {
			node = this.getNodeClosed(node.parentCoord());
			path.push(node);
		}
		return path;
	}

	this.updateOpen = function (nodes) {
		debugMsg("Updating open A* nodes...");
		for (var i in nodes) {
			var node = nodes[i];
			var open_node = this.getNodeOpen(node.coord);
			var new_cost = this.getNodeClosed(node.parent_coord).cost + node.cost;
			if (open_node === null)
				this.open.push(new AStarNode(this.graph.getNode(node.coord), this.graph.getNode(node.parent_coord), new_cost));
			else if (new_cost > open_node.cost) {
				open_node.updateParent(this.graph.getNode(node.parent_coord));
				open_node.updateCost(new_cost);
			}
		}
	}

	this.chooseBestOpen = function () {
		debugMsg("Choosing best node from open list...");
		var min = this.f(this.open[0].coord());
		var min_idx = 0;
		for (var i in this.open) {
			if (this.f(this.open[i].coord()) < min) {
				min = this.f(this.open[i].coord());
				min_idx = i;
			}
		}
		this.current_coord = this.open[min_idx].coord();
		this.closed.push(this.open.splice(min_idx, 1)[0]);
	}

	// Tool-kit functions
	this.validateProximity = function (proximity) {
		var res = [];
		for (var key in proximity) {
			var node = proximity[key];
			if (this.graph.nodeInGraph(node.coord) &&
				!this.graph.nodeIsWall(node.coord) &&
				this.getNodeClosed(node.coord) === null &&
				!(this.isDiag(key) && !this.diag_allowed))
				res.push(node);
		}
		return res;
	}

	this.isDiag = function (key) {
		if (key == 'nw' || key == 'ne' ||
			key == 'sw' || key == 'se')
			return true;
		return false;
	}

	this.assignClickability = function () {
		$(this.graph.table).find("tr td").click(function () {
			var y = $(this).prevAll().length;
		    var x = $(this).parent('tr').prevAll().length;
		    var coord = {x: x, y: y};
		    
		    if (!_this.graph.nodeIsWall(coord)) {
		    	updateClicks();

			    // Assign start node
			    if (clicks === 0) {
			    	_this.start_coord = coord;
			    	_this.colorStartNode();
			    } else if (clicks === 1) {
			    	_this.end_coord = coord;
			    	_this.colorEndNode();
			    	_this.initSearch(_this.start_coord, _this.end_coord);
			    }
			}
		});
	}

	this.colorStartNode = function () {
		var start_color = "rgba(0, 0, 255, 0.3)";
		this.graph.colorNode(this.start_coord, start_color);
	}

	this.colorEndNode = function () {
		var end_color = "rgba(255, 0, 0, 0.3)";
		this.graph.colorNode(this.end_coord, end_color);
	}

	this.colorOpen = function () {
		for (var i in this.open) {
			var node = this.open[i];
			var color = "rgba(0, 0, 0, "+(this.f(node.coord())/1000)+")";
			this.graph.colorNode(node.coord(), color);
		}
	}

	this.colorPath = function (path) {
		var color = "rgba(0, 255, 0, 0.3)";
		for (var i in path) {
			var node = path[i];
			this.graph.colorNode(node.coord(), color);
		}
		this.colorStartNode();
		this.colorEndNode();
	}

	this.getNodeOpen = function (coord) {
		for (var i in this.open) {
			if (this.open[i].eq(coord))
				return this.open[i];
		}
		return null;
	}

	this.getNodeClosed = function (coord) {
		for (var i in this.closed) {
			if (this.closed[i].eq(coord))
				return this.closed[i];
		}
		return null;	
	}
}

function AStarNode (node, parent, cost) {
	this.node = node;
	this.parent = parent;
	this.cost = cost;

	this.coord = function () {
		return this.node.coord;
	}

	this.parentCoord = function () {
		return this.parent.coord;
	}

	this.updateParent = function (parent) {
		this.parent = parent;
	}

	this.updateCost = function (new_cost) {
		this.cost = new_cost;
	}

	this.eq = function (coord) {
		if (coord.x === this.coord().x &&
			coord.y === this.coord().y)
			return true;
		else
			return false;
	}
}