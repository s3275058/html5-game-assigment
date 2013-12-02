/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, NAME, startHealth, COLOR, LEVEL) {

    this.x       = startX;
    this.y       = startY;
    this.health  = startHealth;

    var update = function(newX, newY, newHealth) {
        this.x = newX;
        this.y = newY;
        this.health = newHealth;

        console.log('in update');
        console.log(this.x + ' ' + this.y + ' ')
    };

	// Define which variables and methods can be accessed
	return {
        NAME        : NAME, 
        COLOR       : COLOR, 
        LEVEL       : LEVEL, 
		x           : this.x,
		y           : this.y,
        health      : this.health,
		update      : update
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;
