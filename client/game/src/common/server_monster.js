/**************************************************
** GAME MONSTER CLASS
**************************************************/
var ServerMonster = function(ID, startX, startY, startHealth, OWNER, COLOR, LEVEL) {
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
        ID          : ID, 
        COLOR       : COLOR, 
        LEVEL       : LEVEL, 
        OWNER       : OWNER, 
		x           : x, 
		y           : y, 
        health      : health, 
        update      : update
	}
};
