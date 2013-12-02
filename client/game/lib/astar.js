//
// astar.js
//
// A* tutorial class by html5gamedev.de 
//

function AStar() {
	// constructor 
	// save base values
	this.pointStart			=	{};					// starting point
	this.pointEnd			=	{};					// ending point (destination)
	this.mapData			=	{};					// map data used for calculation
	this.mapWidth			=	0;					// map width
	this.mapHeight			=	0;					// map height
	this.mapTiles			=	0;					// total amount of possible tiles
	
	this.walkableType		=	0;					// defines the the types up to which tiles are walkable. [ 0, 0, 1, 0] 1 would not be walkable
	
	this.calculcationFunc	=	this.baseDistance;	// function used to distance calculation
	this.neighborsFunc		=	function(mN,mS,mE,mW,n,s,e,w,result) { return result; };	// function used to find more than the base neighbors (f.e. diagonal movement)
	
	this.pathNodes			=	{};					// the final calculated path
	
	this.calculationStart	=	0;					// timestamp of calculation beginning
	this.calculationEnd		=	0;					// timestamp of calculation end
	this.calculationDuration=	0;					// amount of time needed to calculate
}

// set calculation method (if diagonal movement is allowed)
AStar.prototype.setCalc = function(type) {
	if(type === undefined) {	return false;	}
	
	switch(type.toLowerCase()) {
		// base calculations without diagonal movement
		case 'base':		this.calculationFunc	=	this.ManhattenDistance;
							this.neighborsFunc		=	function(mN,mS,mE,mW,n,s,e,w,result) { return result; };
							break;
		
		// advanced calculations allowing diagonal movement
		case 'diagonal':	this.calculationsFunc	=	this.DiagonalDistance;
							this.neighborsFunc		=	this.Diagonalneighbors;
							break;
				
	}
	
	// return object to allow chaining
	return this;
}

// assign a starting point
AStar.prototype.setStart	= function(point) {
	if(point === undefined || typeof(point) != 'object') {	return false;	}
	this.pointStart	=	point;
	// return object to allow chaining
	return this;
};

// assign a end point (destination)
AStar.prototype.setEnd	= function(point) {
	if(point === undefined || typeof(point) != 'object') {	return false;	}
	this.pointEnd	=	point;
	// return object to allow chaining
	return this;
};

// set map data
AStar.prototype.setMap = function(data) {
	if(data === undefined || typeof(data) != 'object') {	return false;	}
	this.mapData	=	data;
	// return object to allow chaining
	return this;
};

// allow user to define what key defines a walkbable map tile
AStar.prototype.setWalkableType = function(val) {
	if(val === undefined) { return false; }
	
	this.walkableType	=	val;
	
	// return object to allow chaining
	return this;
};

// the a* calculation algorithm
AStar.prototype.calculate = function() {
	// assign current time
	this.calculationStart	=	(new Date()).getTime();
	// assign base values like map width,height and total amount of tiles
	this.mapWidth		=	this.mapData[0].length;
	this.mapHeight		=	this.mapData.length;
	this.mapTiles		=	this.mapWidth*this.mapHeight;
		
	// create base variables
	var start		=	this.addNode(null,this.pointStart),
		end			=	this.addNode(null,this.pointEnd),
		astar 		=	new Array(this.mapTiles),
		open 		=	[start],
		closed 		=	[],
		result		=	[],
		neighbors	=	node 	=	path 	=	null,
		length 		=	max		=	min		=	i	=	j	=	0;
				
				
		// calculation loop
		// repeat as long as we have open nodes
		while(length = open.length) {		
			// set max to total amount of map tiles	
			max 	=	this.mapTiles;
			min 	=	-1;
			// loop through open nodes
			for(i=0;i<length;i++) {
				if(open[i].f < max) {
					max = open[i].f;
					min = i;
				}
			}
			// set to current node and cut it off the open nodes array
			node = open.splice(min,1)[0];
			
			// is the current node at the same position as destination node?
			if(node.value === end.value) {
				// get the last closed node and set it as current path
				path = closed[closed.push(node)-1];
				// loop until we have no closed nodes left
				do {
					// add the node coordinates to the result
					result.push({x:path.x,y:path.y});
				} while(path = path.parent)
			
				// reset data
				astar = closed = open = [];
				// reverse the result array, data started from endpoint
				// so we have the correct direction
				result.reverse();
			} else {
				// get all neighbors of current node point
				neighbors = this.Baseneighbors(node.x,node.y);
				
				// loop through all found neighbors
				for(i=0,j=neighbors.length;i<j;i++) {
					
					// create a node of the current neighbor
					path = this.addNode(node,neighbors[i]);
					
					// neighbor is not yet defined inside the one dimensional map array
					if(!astar[path.value]) {
						// calculate cost to destination node
						path.g = node.g + this.calculcationFunc(neighbors[i],node);
						// calculate cost to starting node
						path.f = path.g + this.calculcationFunc(neighbors[i],end);
										
						// add to open nodes array		
						open.push(path);
						
						// set value of fitting index inside the one dimensional map array to true
						astar[path.value] = true;
					}
				}
				// add current node to closed nodes array
				closed.push(node);
			}
			
		}
		// assign the path to our class property
		this.pathNodes	=	result;
	
	// calculation finished, assign current time and calculate difference
	this.calculationEnd	=	(new Date()).getTime();
	this.calculationDuration	=	(this.calculationEnd-this.calculationStart);	

	// return object to allow chaining
	return this;

};

// check for blocked items
AStar.prototype.isBlocked	=	function(x,y) {
	return ((this.mapData[y] == null) ||
			(this.mapData[y][x] == null) || 
			(this.mapData[y][x] > this.walkableType));
};

// create a new node object
AStar.prototype.addNode = function(_parent,point,info) {
	var node 	=	{	
				parent: _parent,							// parent node
				value: point.x+ (point.y*this.mapWidth),	// index of this node inside the one dimensional map tiles array
				x:point.x,									// x coordinate
				y:point.y,									// y coordinate
				f:0,										// distance function cost to the beginning node
				g:0											// distance function cost to the destination node
			};	
	// return the created node ellement
	return node;
};

/* calculation methods */
/* Base calculation */
// base distance calculation
AStar.prototype.baseDistance	=	function(start,end) {
	return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
};

// base neighbors function
AStar.prototype.Baseneighbors	=	function(x,y) {
	var n 		=	y-1,
		s 		=	y+1,
		e 		=	x+1,
		w 		=	x-1,
		mN		=	n > -1 && !this.isBlocked(x,n),
		mS		=	s < this.mapHeight && !this.isBlocked(x,s),
		mE 		=	e < this.mapWidth && !this.isBlocked(e,y),
		mW 		=	w > -1 && !this.isBlocked(w,y),
		result	=	[];
	
		
	if(mN) {	result.push({x:x, y:n});}
	if(mS) {	result.push({x:x,y:s});	}
	if(mE) {	result.push({x:e,y:y});	}
	if(mW) {	result.push({x:w,y:y});	}

	result =  this.neighborsFunc(mN,mS,mE,mW,n,s,e,w,result);

	return result;
};

/* Diagonal calculation */

// advanced diagonal distance calculation
AStar.prototype.DiagonalDistance	=	function(start,end) {
	return (Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y)));
};

// advanced diagonal neighbors function
AStar.prototype.Diagonalneighbors	=	function(mN,mS,mE,mW,n,s,e,w,result) {
	//if(mN) {
		if(!this.isBlocked(e,n)) {	result.push({x:e,y:n});	}
		if(!this.isBlocked(w,n)) {	result.push({x:w,y:n});	}
	//}
	
	//if(mS) {
		if(!this.isBlocked(e,s)) {	result.push({x:e,y:s});	}
		if(!this.isBlocked(w,s)) {	result.push({x:w,y:s});	}
	//}
	return result;
};

