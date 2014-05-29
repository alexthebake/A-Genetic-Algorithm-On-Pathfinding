function Evolution (n_generations, n_species, graph, astar) {
	this.current_generation = 0;
	this.n_generations = n_generations;
	this.n_species = n_species;
	this.species = [];
	this.graph = graph;
	this.astar = astar;
	
	this.start_coord = null;
	this.end_coord = null;
	this.setStartEndCoords = function (start_coord, end_coord) {
		this.start_coord = start_coord;
		this.end_coord = end_coord;
	}

	this.spawnGeneration = function () {
		this.species = [];
		for (var i = 0; i < this.n_species; ++i) {
			this.species.push(new PathFindingSpecies(this.current_generation, 10, this.graph, this.astar, this.start_coord, this.end_coord));
		}
		this.current_generation++;
	}

	this.runGeneration = function () {
		var evaluations = [];
		var survivors = [];
		for (var i in this.species)
			evaluations.push([i, this.species[i].goToGoal()]);

		// Pick top 10%
		evaluations.sort(function (a, b) { return a[1] - b[1]; });
		for (var i = 0; i < Math.floor(evaluations.length * 0.1); ++i)
			survivors.push(evaluations[i][0]);

		return survivors;
	}
}

function PathFindingSpecies (generation, resistance, graph, astar, start_node, end_node) {
	this.generation = generation;
	this.resistance = resistance;
	this.graph = graph;
	this.astar = astar;
	this.start_coord = start_node;
	this.end_coord = end_node;
	this.path = [this.start_coord];
	this.dont_go_here = [];

	this.goToGoal = function () {
		return this.randomWalk(this.start_coord);
	}

	this.getProximity = function (node, direction) {
		var proximity = {
			 n : {coord: {x: node.x,   y: node.y+1}},
			 s : {coord: {x: node.x,   y: node.y-1}},
			 w : {coord: {x: node.x-1, y: node.y}},
			 e : {coord: {x: node.x+1, y: node.y}},
			nw : {coord: {x: node.x-1, y: node.y+1}},
			ne : {coord: {x: node.x+1, y: node.y+1}},
			sw : {coord: {x: node.x-1, y: node.y-1}},
			se : {coord: {x: node.x+1, y: node.y-1}}
		};
		return (direction === undefined) ? proximity : proximity[direction].coord;
	}

	this.chooseProximity = function (node, direction) {
		if (direction === undefined) {
			var i = 0;
			var direction_idx = Math.floor(Math.random() * Object.keys(this.getProximity(node)).length + 1);
			// Grab direction from proximity
			for (var key in this.getProximity(node)) {	
				i++;
				if (i === direction_idx)
					return key;
			}
		} else {
			return direction;
		}
	}

	this.randomWalk = function (coord) {
		var repeats_in_direction = Math.floor(Math.random() * this.resistance + 1);
		var direction = undefined;
		var current_coord = coord;
		for (var i = 0; i < repeats_in_direction; ++i) {
			direction = this.chooseProximity(current_coord, direction);
			current_coord = this.getProximity(current_coord, direction);

			this.path.push(current_coord);
			console.log(current_coord);

			if (!this.graph.nodeInGraph(current_coord))
				return this.evaluateFailure(direction);
			if (this.graph.nodeIsWall(current_coord))
				return this.evaluateFailure(direction);
		}
		return this.randomWalk(current_coord);
	}

	this.evaluateFailure = function (direction) {
		var last_good_node = this.path[this.path.length - 2];
		var cost = this.astar.initSearch(last_good_node, this.end_coord, false);
		this.colorPath();
		return cost;
	}

	this.evaluateWinning = function () {
		var current_node = this.path[this.path.length - 1];
		var cost = this.astar.initSearch(this.start_coord, last_good_node, false);
	}

	this.colorPath = function () {
		for (var i in this.path)
			this.graph.colorNode(this.path[i], "#069");	
		
		this.astar.colorStartNode();
		this.astar.colorEndNode();
	}
}