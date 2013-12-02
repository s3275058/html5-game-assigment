(function (window) {

    function Player(imgPlayer, NAME, LEVEL, exp, COLOR) {
        console.log("create player");
        this.initialize(imgPlayer, NAME, LEVEL, exp, COLOR);
    }

    var p = Player.prototype = new createjs.BitmapAnimation();
    var box;

// public properties:

    p.timeout;
    p.thrust;
    p.vX;
    p.vY;
    p.COLOR;
    p.LEVEL;
    p.exp;
    p.NAME;
    p.maxhp;
    p.health;
    p.angle = 0;
    p.alive = true;
    p.colliding = false;

    Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize; //unique to avoid overiding base class

    p.initialize = function (imgPlayer, NAME, LEVEL, exp, COLOR) {
        this.LEVEL = LEVEL;
        this.exp = exp;
        this.COLOR = COLOR;
        this.NAME = NAME;
        this.health = this.maxhp = 100 + (this.LEVEL * 0.1);
        this.width = this.height = 32;

        var data = new createjs.SpriteSheet({
            images: [imgPlayer],
            frames: {
                "width": 32,
                "height": 32,
                "regX": 0,
                "regY": 0
            },
            animations: {
                down: [0, 2, 'down', 4],
                left: [3, 5, 'left', 4],
                right: [6, 8, 'right', 4],
                up: [9, 11, 'up', 4],
                idle: [1, 1]
            }
        });

        createjs.SpriteSheetUtils.addFlippedFrames(data, true, false, false);
        this.BitmapAnimation_initialize(data);

        this.gotoAndPlay("idle");
        this.isInIdleMode = true;

        this.shadow = new createjs.Shadow("#454", 0, 5, 4);
        this.vX = this.vY = 0;

        this.healthBar = {
            g: new createjs.Graphics()
        }
        this.healthBar.g.beginFill("green");
        this.healthBar.g.drawRect(0, 0, this.width, 5);
        this.healthBar.rect = new createjs.Shape(this.healthBar.g);
        this.healthBar.rect.x = this.x;
        this.healthBar.rect.y = this.y + this.height;
    }

    p.testCollide = function (collection, hit_box, reverse) {
        var testVX = this.x + Math.sin(this.angle * (Math.PI / -180)) * (this.vX + this.vX * 0.01);
        var testVY = this.y + Math.cos(this.angle * (Math.PI / -180)) * (this.vY + this.vY * 0.01);

        for (idx in collection) {
            var t = collection[idx];
            //if (player.alive && ndgmr.checkRectCollision(player,t)!=null) {
            if (collide(testVX, testVY, hit_box, hit_box, t.x, t.y, hit_box, hit_box)) {
                // player.colliding = true;
                if (reverse) {
                    this.vX = this.vX > 0 ? -3 : 3;
                    this.vY = this.vY > 0 ? -3 : 3;
                }
                this.health -= Math.abs(this.vX) * 2;
                break;
            }
        }
    };

    Player.prototype.tick = function (tiles, monsters, others) {
        this.testCollide(tiles, 25, true);
        this.testCollide(monsters, 32, false);
        this.testCollide(others, 32, true);

        //this.x += this.vX;
        //this.y += this.vY;
        this.vX += this.vX * 0.01;
        this.vY += this.vY * 0.01;

        this.x += Math.sin(this.angle * (Math.PI / -180)) * this.vX;
        this.y += Math.cos(this.angle * (Math.PI / -180)) * this.vY;

        //healthbar update
        this.drawHealthBar();
    }

    // for other player ONLY
    Player.prototype.update = function (newX, newY, hp) {
        this.x = newX;
        this.y = newY;
        this.health = hp;

        this.drawHealthBar();
    }

    p.drawHealthBar = function () {
        this.healthBar.g.clear();
        this.healthBar.g.beginFill("green");
        this.healthBar.g.drawRect(0, 0, (this.health / this.maxhp) * this.width, 5);
        this.healthBar.rect.x = this.x;
        this.healthBar.rect.y = this.y + this.height;
    };

    window.Player = Player;

}(window));
