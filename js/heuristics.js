/* Author: Alexander Bake
 * Last Updated: 05/21/2014
 * Title: Heuristics for path-finding
 */
function Heuristics () {
	this.manhattan = function (start_coord, end_coord, scale) {
		if (scale === undefined)
			scale = 10;
		var delta_x = Math.abs(end_coord.x - start_coord.x);
		var delta_y = Math.abs(end_coord.y - start_coord.y);
		return scale * (delta_x + delta_y);
	}

	this.euclidean = function (start_coord, end_coord, scale) {
		if (scale === undefined)
			scale = 10;
		var delta_x = Math.abs(end_coord.x - start_coord.x);
		var delta_y = Math.abs(end_coord.y - start_coord.y);
		return scale * Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
	}

	this.random = function (start_coord, end_coord, scale) {
		if (scale === undefined)
			scale = 10;
		return scale * Math.random();
	}
}