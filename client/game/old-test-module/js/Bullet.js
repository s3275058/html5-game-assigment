/**************************************************
** GAME BULLET CLASS
**************************************************/
var Bullet = function(ownerID, startX, startY, dx, dy, lifespan, colour) {
	var x = startX,
		y = startY,
		dx = dx,
		dy = dy,
		id = ownerID,
		colour = colour || "#FF0000",
		moveAmount = 2,
		life = lifespan,
		age = 0;
	
	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};
	
	var getDx = function() {
		return dx;
	};
	
	var getDy = function() {
		return dy;
	};
	
	var getId = function() {
		return id;
	};
	
	var getLifespan = function() {
		return lifespan;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};
	
	// Update bullet position
	var update = function() {		
		y += moveAmount * dx;
		x += moveAmount * dy;
		
		age += 1;
		
		return age < lifespan ? true : false;
	};

	// Draw bullet
	var draw = function(ctx) {
		ctx.fillStyle = colour;
		ctx.fillRect(x - 5, y - 5, 10, 10);
	};

	// Define which variables and methods can be accessed
	return {
		getX		: getX,
		getY		: getY,
		getId		: getId,
		getDx		: getDx,
		getDy		: getDy,
		getLifespan	: getLifespan,
		setX		: setX,
		setY		: setY,
		update		: update,
		draw		: draw
	}
};
