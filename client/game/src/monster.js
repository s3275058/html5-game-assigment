(function (window) {

    function Monster(imgMonster, id, owner, color, level) {
        console.log("create Monster");
        this.initialize(imgMonster, id, owner, color, level);
    }

    var p = Monster.prototype = new createjs.BitmapAnimation();
    var box;

// public properties:
    p.ID;
    p.vX;
    p.vY;
    p.COLOR;
    p.LEVEL;
    p.OWNER;
    p.maxhp;
    p.health;
    p.angle = 0;

    p.alive = true;
    var quaterFrameSize;
// constructor:
    Monster.prototype.BitmapAnimation_initialize = Monster.prototype.initialize; //unique to avoid overiding base class

    p.initialize = function (imgMonster, id, owner, color, level) {
        this.ID = id;
        this.COLOR = color;
        this.LEVEL = level;
        this.OWNER = owner;
        this.width = this.height = 32;
        this.health = this.maxhp = 25 + (this.LEVEL * 0.1);

        var data = new createjs.SpriteSheet({
            images: [imgMonster],
            frames: {
                "width": 32,
                "height": 32,
                "regX": 0,
                "regY": 0
            },
            animations: {
                down: [0, 9]
            }
        });

        createjs.SpriteSheetUtils.addFlippedFrames(data, true, false, false);
        this.BitmapAnimation_initialize(data);
        this.gotoAndPlay("down");

        this.shadow = new createjs.Shadow("#454", 0, 5, 4);

        this.vX = this.vY = 0;

        this.healthBar = {
            g: new createjs.Graphics()
        }
        this.healthBar.g.beginFill("red");
        this.healthBar.g.drawRect(0, 0, this.width, 5);
        this.healthBar.rect = new createjs.Shape(this.healthBar.g);
        this.healthBar.rect.x = this.x;
        this.healthBar.rect.y = this.y + this.height;
    }

    Monster.prototype.tick = function () {
        this.x += this.vX;
        this.y += this.vY;

        this.drawHealthBar();
    }

    // for monsters of other players ONLY
    Monster.prototype.update = function (newX, newY, hp) {
        this.x = newX;
        this.y = newY;
        this.health = hp;

        this.drawHealthBar();
    }

    p.drawHealthBar = function () {
        this.healthBar.g.clear();
        this.healthBar.g.beginFill("red");
        this.healthBar.g.drawRect(0, 0, (this.health / this.maxhp) * this.width, 5);
        this.healthBar.rect.x = this.x;
        this.healthBar.rect.y = this.y + this.height;
        this.rotation = this.angle;
    };

    window.Monster = Monster;

}(window));
