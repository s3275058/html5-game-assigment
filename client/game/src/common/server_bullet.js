/**************************************************
** GAME BULLET CLASS
**************************************************/
var ServerBullet = function(ID, startX, startY, OWNER, COLOR, DAMAGE) {
    var
        x       = startX, 
        y       = startY;

	var update = function(newX, newY) {
		x = newX;
		y = newY;
	};

	// Define which variables and methods can be accessed
	return {
        ID          : ID, 
        OWNER       : OWNER, 
        COLOR       : COLOR, 
        DAMAGE      : DAMAGE, 
		x           : x, 
        y           : y, 
        update      : update
	}
};

