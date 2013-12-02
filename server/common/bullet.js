/**************************************************
 ** GAME BULLET CLASS
 **************************************************/
var Bullet = function (ID, startX, startY, OWNER, COLOR, DAMAGE) {

    this.x = startX;
    this.y = startY;

    var update = function (newX, newY) {
        this.x = newX;
        this.y = newY;
    };

    // Define which variables and methods can be accessed
    return {
        ID: ID,
        OWNER: OWNER,
        COLOR: COLOR,
        DAMAGE: DAMAGE,
        x: this.x,
        y: this.y,
        update: update
    }
};

// Export the Bullet class so you can use it in
// other files by using require("./bullet").Bullet
exports.Bullet = Bullet;
