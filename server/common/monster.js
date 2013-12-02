/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Monster = function(ID, startX, startY, startHealth, OWNER, COLOR, LEVEL) {

        this.x       = startX,
        this.y       = startY,
        this.health  = startHealth;

	var update = function(newX, newY, newHealth) {
        this.x = newX;
        this.y = newY;
        this.health = newHealth;
    };

	// Define which variables and methods can be accessed
	return {
        ID          : ID,
        COLOR       : COLOR,
        LEVEL       : LEVEL,
        OWNER       : OWNER,
		x           : this.x,
		y           : this.y,
        health      : this.health,
        update      : update
	}
};

// Export the Player class so you can use it in
// other files by using require("./monster").Monster
exports.Monster = Monster;
