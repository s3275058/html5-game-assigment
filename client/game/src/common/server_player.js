/**************************************************
** GAME PLAYER CLASS
**************************************************/
var ServerPlayer = function(startX, startY, NAME, startHealth, COLOR, LEVEL) {
    var
        x       = startX, 
        y       = startY, 
        health  = startHealth;

    var update = function(newX, newY, newHealth) {
		x = newX;
		y = newY;
        health = newHealth;
    };

	// Define which variables and methods can be accessed
	return {
        NAME        : NAME, 
        COLOR       : COLOR, 
        LEVEL       : LEVEL, 
		x           : x, 
		y           : y, 
        health      : health, 
		update      : update
	}
};
