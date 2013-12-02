(function (window) {

    function Bullet(id, color, owner, damage) {
        this.initialize(id, color, owner, damage);
    }

    var g = Bullet.prototype = new createjs.Shape();

    BULLET_ENTROPY = 100;	//how much energy a bullet has before it runs out.
    BULLET_SPEED = 5;
    //properties
    g.ID;
    g.x;
    g.y;
    g.COLOR;
    g.entropy;
    g.OWNER;
    g.DAMAGE;


    g.Shape_initialize = g.initialize;	//unique to avoid overiding base class

    g.initialize = function (id, color, owner, damage) {
        this.Shape_initialize();
        this.entropy = BULLET_ENTROPY;
        this.active = true;
        this.ID = id;
        this.OWNER = owner;
        this.DAMAGE = damage;
        this.COLOR = color;
        //draw the bullet
        this.graphics.beginStroke(color).moveTo(-1, 10).lineTo(1, 0);

    }

    Bullet.prototype.tick = function (bullets, tiles, monsters, stage) {
        //handle bullet movement and looping
        //if(!this || !this.active) { continue; }

        this.x += Math.sin(this.rotation * (Math.PI / -180)) * BULLET_SPEED;
        this.y += Math.cos(this.rotation * (Math.PI / -180)) * BULLET_SPEED;

        if (this.entropy <= 0) {
            stage.removeChild(this);
            this.active = false;
        }

        if (this.active == false) {
            delete bullets[this.ID];
        }

        for (tile in tiles) {
            var t = tiles[tile];
            if (collide(this.x, this.y, 1, 1, t.x, t.y, 32, 32)) {
                stage.removeChild(this);
                this.active = false;
            }
        }

        for (monster in monsters) {
            var t = monsters[monster];
            //if( ndgmr.checkRectCollision(t,this)!=null){
            if (collide(this.x, this.y, 1, 1, t.x, t.y, 32, 32)) {
                stage.removeChild(this);

                t.health -= calculateDamage(this, t);
                this.active = false;
            }
        }

    };

    // for bullets of other players ONLY
    Bullet.prototype.update = function (newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    window.Bullet = Bullet;

}(window))
