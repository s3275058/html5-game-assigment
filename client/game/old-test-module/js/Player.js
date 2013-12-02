/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, bullets) {
	var x = startX,
		y = startY,
		id,
		bullets = bullets || false,
		moveAmount = 2;
	
	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};
	
	var getId = function() {
		return id;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};
	
	var setId = function(i) {
		id = i;
	};

	// Update player position
	var update = function(keys) {
		// Previous position
		var prevX = x,
			prevY = y;

		// Up key takes priority over down
		if (keys.up) {
			y -= moveAmount;
		} else if (keys.down) {
			y += moveAmount;
		};

		// Left key takes priority over right
		if (keys.left) {
			x -= moveAmount;
		} else if (keys.right) {
			x += moveAmount;
		};

		return (prevX != x || prevY != y) ? true : false;
	};
	
	var shoot = function(keys, bullets) {
		if (keys.space) {
			var dx = 1, dy = 1;
			
			var bullet = new Bullet(id, x, y, dx, dy, 1000);
			bullets.push(bullet);
			
			console.log("bullet id : " + id);
			
			return {id: bullet.getId(), x: bullet.getX(), y: bullet.getY(), dx: dx, dy: dy, lifespan: bullet.getLifespan()};
		} else {
			return false;
		}		
	};

	// Draw player
	var draw = function(ctx) {
		ctx.fillStyle = "black";
		ctx.fillRect(x-5, y-5, 10, 10);
	};

	// Define which variables and methods can be accessed
	return {
		getX	: getX,
		getY	: getY,
		getId	: getId,
		setX	: setX,
		setY	: setY,
		setId	: setId,
		shoot	: shoot,
		update	: update,
		draw	: draw
	}
};
