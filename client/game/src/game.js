(function (window) {
    function Game() {
        console.log("create Game");
        init();
    }

    var socket;
    var dataFromDB;

    var map;
    var spawn;

    var player;
    var currID = 0;

    var tiles = [];

    var players = {};		// Map of p.NAME -> player object
    var monsters = {};		// Map of m.ID -> monster object
    var numMonsters = 0;
    var MAX_MONSTER = 1;

    var otherBullets = {};

    var canvas;			//Main canvas
    var stage;			//Main display stage

    var nextBullet;			//ticks left until the next shot is fired
    var contentManager;

    var tileWidth = 32;
    var tileHeight = 32;


    var vX = vY = 4;

    var shootHeld;			    // is the user holding a shoot command
    var bullets = {};


    var LEFT_CLICK = 0;
    var RIGHT_CLICK = 2;

    var angle;
    var count = 1;
    var astar = new AStar();

    function init() {
        console.log('init');

        dataFromDB = decryptUrlGame(location.search);

        socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

        canvas = document.getElementById("gameCanvas");
        stage = new createjs.Stage(canvas);

        contentManager = new ContentManager();
        contentManager.StartDownload();

        setEventHandlers();

        joinGame(dataFromDB.username, dataFromDB.gameType);
    }

    function start() {
        // construct THE player
        player = new Player(contentManager.imgPlayer, dataFromDB.username, dataFromDB.level, dataFromDB.exper, dataFromDB.mainColor);
        player.x = spawn[0][1] * tileWidth;
        player.y = spawn[0][0] * tileHeight;

        newPlayer(new ServerPlayer(player.x, player.y, player.NAME, player.health, player.COLOR, player.LEVEL));

        // create bullets
        bullets = new Array();//
        nextBullet = 0;

        // reset key presses
        shootHeld = false;

        // ensure stage is blank and add the
        stage.clear();
        drawFixedMap(map);
        stage.addChild(player);
        stage.addChild(player.healthBar.rect);

        createjs.Ticker.addListener(window);

        // Best Framerate targeted (45 FPS)
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(45);
        canvas.addEventListener('mousedown', handleMouseDown, false);
        canvas.addEventListener('mouseup', handleMouseUp, false);

        //start game timer   
        if (!createjs.Ticker.hasEventListener("tick")) {
            createjs.Ticker.addEventListener("tick", tick);
        }
    }

    function drawFixedMap(map) {
        var i = 0;

        for (var height = 0; height < map.length; height++) {
            for (var width = 0; width < map[0].length; width++) {
                var ti = new createjs.Bitmap(contentManager.imgFireRoad);
                ti.y = height * tileHeight;
                ti.x = width * tileWidth;
                stage.addChild(ti);

            }
        }

        for (var height = 0; height < map.length; height++) {
            for (var width = 0; width < map[0].length; width++) {

                if (map[height][width] == 1) {
                    var tile = new createjs.Bitmap(contentManager.imgTree);
                    tile.x = width * tileWidth;
                    tile.y = height * tileHeight;
                    stage.addChild(tile);
                    tiles.push(tile);
                }

            }
        }
    }

    function tick(event) {
        var removableBs = [];


        //handle firing
        if (count % 10 == 0 && shootHeld) {
            fireBullet();
        }

        //handle bullet movement and looping
        for (bullet in bullets) {
            var o = bullets[bullet];
            o.tick(bullets, tiles, monsters, stage);

            if (!o.active) {
                removableBs.push(o.ID);
            }
        }
        removeBullets(removableBs, player.NAME);

        // spawn monsters
        if (count % 20 == 0 && numMonsters++ < MAX_MONSTER) {
            var mon = new Monster(contentManager.imgMonsterA, currID++ + player.NAME, player.NAME, player.COLOR, player.LEVEL);

            mon.x = spawn[1][1] * tileWidth;
            mon.y = spawn[1][0] * tileHeight;

            monsters[mon.ID] = mon;

            stage.addChild(mon);
            stage.addChild(mon.healthBar.rect);

            newMonster(new ServerMonster(mon.ID, mon.x, mon.y, mon.health, player.NAME, player.COLOR, player.LEVEL));
        }

        //handle monster collide and looping
        for (monID in monsters) {
            m = monsters[monID];

            if (m.health <= 0) {
                stage.removeChild(m);
                stage.removeChild(m.healthBar.rect);
                m.active = false;
                delete monsters[m.ID];
                killMonster(player.NAME, m.ID);
            }

            if (m.OWNER == player.NAME) {
                m.tick();

                // monster find path
                if (count % 2 == 0) {
                    var start = {
                        x: Math.floor(m.x / 32),
                        y: Math.floor(m.y / 32)
                    };
                     var end = {
                        x: Math.floor(player.x / 32),
                        y: Math.floor(player.y / 32)
                    };

                    astar.setStart(start)
                        .setEnd(end)
                        .setMap(map)
                        .setWalkableType('0')
                        .calculate();

                    var path = getPath(astar.pathNodes);
                    var speed = getSpeed(path);

                    if (speed.length > 1) {
                        m.vX = speed[1][0] * 3;
                        m.vY = speed[1][1] * 3;
                    }
                }
            }
        }


        //remove player if health <= 0
        if (player.health <= 0) {
            stage.removeChild(player);
            stage.removeChild(player.healthBar.rect);
            player.active = false;
        }

        //player loop
        player.tick(tiles, monsters, players);
        stage.update(event);

        // send updates to server
        var
            currMons = {},
            currBuls = {};

        for (var m in monsters) {
            if (m.OWNER == player.NAME) {
                var currM = monsters[m];
                currMons[m.ID] =
                    new ServerMonster(currM.ID, currM.x, currM.y, currM.health, currM.NAME, currM.COLOR, currM.LEVEL);
            }
        }

        for (var b in bullets) {
            if (b.OWNER == player.NAME) {
                var currB = bullets[b];
                currBuls[b.ID] =
                    new ServerBullet(currB.ID, currB.x, currB.y, currB.OWNER, currB.COLOR, currB.DAMAGE);
            }
        }

        update(new ServerPlayer(player.x, player.y, player.NAME, player.health, player.COLOR, player.LEVEL),
            currMons, currBuls);

        count++;
    }

    function fireBullet() {
        //create the bullet
        var o = new Bullet(currID++ + player.NAME, player.COLOR, player.NAME, 50);
        o.x = player.x;
        o.y = player.y;
        o.rotation = angle;

        bullets[o.ID] = o;

        stage.addChild(o);
        contentManager.shotSound.play();

        newBullet(new ServerBullet(o.ID, o.x, o.y, o.OWNER, o.COLOR, o.DAMAGE));
    }

    function handleMouseDown(evt) {
        var mousePos = getMousePos(canvas, evt);
        var p = {'x': player.x, 'y': player.y};
        var m = {'x': mousePos.x, 'y': mousePos.y};
        if (evt.button == RIGHT_CLICK) {
            angle = getAngle(player, m);
            shootHeld = true;
        }
        if (evt.button == LEFT_CLICK) {
            ;

            player.angle = getAngle(player, m);
            player.vX = player.vY = 3;

            if (player.angle <= 45 || player.angle > 295) {
                player.gotoAndPlay('down');
            } else if (player.angle > 45 && player.angle <= 135) {
                player.gotoAndPlay('left');
            } else if (player.angle > 135 && player.angle < 215) {
                player.gotoAndPlay('up');
            } else {
                player.gotoAndPlay('right');
            }
        }
    }

    function handleMouseUp(evt) {
        var mousePos = getMousePos(canvas, evt);

        if (evt.button == RIGHT_CLICK) {
            shootHeld = false;
        }
        if (evt.button == LEFT_CLICK) {

        }
    }

    window.Game = Game;

    function setEventHandlers() {
        // Receive map and spawn points
        socket.on("join game", onJoinGame);

        // New player join the game
        socket.on("new player", onNewPlayer);

        // New monster created
        socket.on("new monster", onNewMonster);

        // New bullets shot
        socket.on("new bullet", onNewBullet);

        // Monster killed
        socket.on("kill monster", onKillMonster);

        // Update another player
        socket.on("update player", onUpdatePlayer);

        // Update other monsters
        socket.on("update monsters", onUpdateMonsters);

        // Update other bullets
        socket.on("update bullets", onUpdateBullets);

        // Remove other bullets
        socket.on("remove bullets", onRemoveBullets);

        // Update your exp if you kill someone
        socket.on("kill player", onKillPlayer);

        // Chatting	
        $("#send").click(function () {
            var msg = $("#msg").val();
            socket.emit("chat", {name: player.NAME, message: msg});
            $("#msg").val("");
            $("#msgs").append("<li><strong><span class='text-success'>I say : </span></strong>" + msg + "</li>");
        });

        $("#msg").keypress(function (e) {
            if (e.which == 13) {
                var msg = $("#msg").val();
                socket.emit("chat", {name: player.NAME, message: msg});
                $("#msg").val("");
                $("#msgs").append("<li><strong><span class='text-success'>I say : </span></strong>" + msg + "</li>");
            }
        });

        // Listen for chat messages
        socket.on("chat", function (data) {
            $("#msgs").append("<li><strong><span class='text-success'>" + data['name'] + " says : </span></strong>" + data['msg'] + "</li>");
        });

        //~ // Update other bullets
    };

    /**************************************************
     ** EMIT FUNCTIONS - SEND DATA TO SERVER
     **************************************************/

    function joinGame(n, t) {
        emit("join game", {name: n, type: t});
    };

    function newPlayer(p) {
        emit("new player", p);
    };

    function newMonster(m) {
        emit("new monster", m);
    };

    function newBullet(b) {
        emit("new bullet", b);
    };

    function removeBullets(ids, name) {
        emit("remove bullets", {'ids': ids, 'name': name});
    };

    function killMonster(name, monID) {
        emit('kill monster', {'id': monID, 'name': name});
    };

    function die(name, killer, level) {
        emit('kill player', {'name': name, 'killer': killer, 'level': level});
    };

    function update(p, mons, bs) {
        emit('update', {'player': p, 'monsters': mons, 'bullets': bs});
    };

    function emit(event, data) {
        socket.emit(event, data);
    };

    /**************************************************
     ** LISTEN FUNCTIONS - RECEIVE DATA FROM SERVER
     **************************************************/
    function onJoinGame(data) {
        map = data['map'];
        spawn = data['spawn'];

        start();
    };

    function onNewPlayer(data) {
        var p = new Player(contentManager.imgPlayer, data.NAME, data.LEVEL, 9999, data.COLOR);
        p.update(data.x, data.y, data.health);
        stage.addChild(p);
        players[data.NAME] = p;
    };

    function onUpdatePlayer(otherP) {
        players[otherP.NAME].update(otherP.x, otherP.y, otherP.health);
    };

    function onNewMonster(data) {
        var mon = new Monster(contentManager.imgMonsterA, data.ID, data.OWNER, data.COLOR, player.LEVEL);
        mon.update(data.x, data.y, data.health);
        monsters[data.ID] = mon;
        stage.addChild(mon);
    };

    function onUpdateMonsters(mons) {
        for (m in mons) {
            monsters[m].update(mons[m].x, mons[m].y, mons[m].health);
        }
    };

    function onKillMonster(data) {
        delete monsters[data];
    };

    function onNewBullet(data) {
        var o = new Bullet(data.ID, data.COLOR, data.NAME, data.DAMAGE);
        stage.addChild(o);
        o.x = data.x;
        o.y = data.y;
        bullets[data.ID] = o;
    };

    function onUpdateBullets(bs) {
        for (b in bs) {
            bullets[b].update(bs[b].x, bs[b].y);
        }
    };

    function onRemoveBullets(data) {
        for (id in data) {
            delete bullets[id];
        }
    };

    function onKillPlayer(data) {
        if (player.NAME == data['killer']) {
            // killed player's level
            var level = data['level'];

            player.exp += level * 1000;
        }
        stage.removeChild(players[data['name']]);
        delete players[data['name']];

    };
}(window));
 
