/**************************************************
 ** NODE.JS REQUIREMENTS
 **************************************************/
var
    Player = require("./common/player").Player,	// Player class
    Bullet = require("./common/bullet").Bullet,	// Bullet class
    Monster = require("./common/monster").Monster;	// Monster class


/**************************************************
 ** GAME CLASS
 **************************************************/
// Game states and types
var
    STATES = {JOINABLE: 0, PLAYING: 1, FINISHED: 2};


var Game = function (TYPE, MAX_PLAYER, MAP, spawnPoints) {
    var
        numPlayers = 0,
        spawn = spawnPoints,
        state = STATES.JOINABLE,
        players = {},       // Map of connected players: username -> {socket,player}
        monsters = {},       // Map of monsters: monster id -> {monster}
        bullets = {};       // Map of bullets: bullet id -> {bullet}

    /**************************************************
     ** EVENT HANDLER FUNCTIONS
     **************************************************/

    var join = function (clientSocket, name) {
        handleClient(clientSocket);

        players[name] = {'socket': clientSocket, 'player': null};

        numPlayers++;
        state = checkJoinableState();

        clientSocket.emit("join game", {'map': MAP, 'spawn': [spawn[0][0], spawn[1][0]]});

        spawn[0].splice(spawn[0].indexOf(spawn[0][0]), 1);
        spawn[1].splice(spawn[1].indexOf(spawn[1][1]), 1);
    };

    var handleClient = function (client) {
        // Listen for new player
        client.on("new player", onNewPlayer);

        // Listen for new monster
        client.on("new monster", onNewMonster);

        // Listen for new bullet
        client.on("new bullet", onNewBullet);

        // Listen for client disconnected
        client.on("disconnect", onClientDisconnect);

        // Listen for chat message
        client.on("chat", onChat);

        // Listen for update position of player, monsters and bullets
        client.on("update", onUpdate);

        // Listen for hit message
        client.on('kill player', onKillPlayer);

        // Listen for hit message
        client.on('kill monster', onKillMonster);
    };

    // Player sends his data and position
    var onNewPlayer = function (data) {
        // data: a Player object

        // Create a new player
        players[data.NAME]['player'] = new Player(data.x, data.y, data.NAME, data.health, data.COLOR, data.LEVEL);

        // Exchange info of all players in this game        
        broadcast("new player", data.NAME, players[data.NAME]['player']);
        receive('new player', data.NAME, players, 'player');

        // Exchange info of all monsters in this game
        receive('new monster', data.NAME, monsters, 'monster');

        // Exchange info of all monsters in this game
        receive('new bullet', data.NAME, bullets, 'bullet');
    };

    // Player sends his data, position and monsters data
    var onNewMonster = function (data) {
        // data: a Monster obj
        var id = data.ID;

        // Create a new monster
        monsters[id] = {'monster': null};
        var mon = new Monster(id, data.x, data.y, data.health, data.OWNER, data.COLOR, data.level);
        monsters[id]['monster'] = mon;

        // Broadcast monster info    
        broadcast("new monster", data.OWNER, mon);
    };

    // Player sends his data, position and monsters data
    var onNewBullet = function (data) {
        var id = data.ID;

        // Create a new bullet
        bullets[id] = {'bullet': null};
        var b = new Bullet(id, data.x, data.y, data.OWNER, data.COLOR, data.DAMAGE);
        bullets[id]['bullet'] = b;

        // Broadcast bullet info    
        broadcast("new bullet", data.OWNER, b);
    };

    // Socket client has disconnected
    // !!!
    var onClientDisconnect = function (data) {
        var name;

        for (var n in players) {
            if (players[n]['socket'] == this) {
                name = n;
                break;
            }
        }

        broadcast("player disconnect", name, {});

        delete players[name];
    };

    var onChat = function (data) {
        broadcast("chat", data.name, {'name': data.name, 'msg': data.message});
    };

    // Player has moved
    var onUpdate = function (data) {
        var
            p = data['player'],   // Player object
            mons = data['monsters'], // Map of id->monster
            bs = data['bullets'];  // Map of id->bullet

        // Update player position
        players[p.NAME]['player'].update(p.x, p.y, p.health);
        console.log('x: ' + players[p.NAME]['player'].x + ' y : ' + players[p.NAME]['player'].y);


        // Update bullet position
        for (id in bs) {
            bullets[id]['bullet'].update(bs[id].x, bs[id].y);
        }

        // Update monster position
        for (id in mons) {
            monsters[id]['monster'].update(mons[id].x, mons[id].y, mons[id].health);
        }

        // Broadcast updated position to connected socket clients
        broadcast("update player", p.NAME, players[p.NAME]['player']);
        broadcast("update bullets", p.NAME, bs);
        broadcast("update monsters", p.NAME, mons);
    };

    var onRemoveBullets = function (data) {
        for (id in data['ids']) {
            delete bullets[id];
        }

        broadcast("remove bullets", data['name'], data['ids']);
    };

    var onKillMonster = function (data) {
        delete monsters[data['id']];

        broadcast("kill monster", data['name'], data['id']);

        checkEnd();
    };

    var onKillPlayer = function (data) {
        delete players[data['name']];

        broadcast("kill player", '', {'name': data['name'], 'killer': data['killer'], 'level': data['level']});

        var removeMons = [];
        for (id in monsters) {
            if (monsters[id]['monster'].OWNER == data['name']) {
                removeMons.push(id);
            }
        }

        for (id in removeMons) {
            broadcast("kill monster", data['name'], monsters[id]);
            delete monsters[id];
        }

        checkEnd();
    };

    /**************************************************
     ** HELPER FUNCTIONS
     **************************************************/

    var checkJoinableState = function () {
        return state == STATES.PLAYING || numPlayers == MAX_PLAYER
            ? STATES.PLAYING
            : STATES.JOINABLE;
    };

    var broadcast = function (callback, current, data) {
        for (var other in players) {
            if (other != current) {
                // Broadcast data to other players
                players[other]['socket'].emit(callback, data);
            }
        }
    };

    var receive = function (callback, current, map, data) {
        for (var item in map) {
            if (item != current) {
                // Send data from others to current player
                players[current]['socket'].emit(callback, map[item][data]);
            }
        }
    };

    var checkEnd = function () {
        if (Object.keys(players).length == 0 || TYPE == 'COOP' && (Object.keys(monsters).length == 0)) {
            state = STATES.FINISHED;
            broadcast('end game', '', {});
        }
    };

    // Getters and setters
    var getState = function () {
        return state;
    };

    var getType = function () {
        return TYPE;
    };

    // Define which variables and methods can be accessed
    return {
        getState: getState,
        getType: getType,
        join: join
    }
};


// Export the Game class and its life cycle states so you can use it in
// other files by using require("./game").Game and require('./game').STATES
exports.Game = Game;
exports.STATES = STATES;
