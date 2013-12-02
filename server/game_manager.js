/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var
    game_manager    = module.exports,
    map             = require('./map_generator'),
    Game            = require('./game').Game,     // Game class
    STATES          = require('./game').STATES,   // Game states
    util;                                         // Utility resources (logging, object inspection, etc)


/**************************************************
** GAME VARIABLES AND CONSTANTS
**************************************************/
var
    games = []; // List of current games

var
    MAX_PLAYER  = 3;


/**************************************************
** GAME MANAGER SERVICES
**************************************************/
game_manager.init = function(u) {
    util = u;
};

game_manager.handleClient = function(client) {
	// Listen for join game message
	client.on("join game", onJoinGame);
};

// New player has joined
function onJoinGame(data) {
    // Clean all empty rooms first
    removeFinishedGames();

	// Find a game room
    var g = findGame(data.type);

    if (!g) {
        g = createGame(data.type);
    }

    g.join(this, data.name);
};


/**************************************************
** HELPER FUNCTIONS
**************************************************/
function findGame(type) {
    for (var i in games) {
        if (games[i].getState() == STATES.JOINABLE && games[i].getType() == type) {
            return games[i];
        }
    }
    return null;
};

function createGame(type) {
    var m = map.generateMaps(MAX_PLAYER);

    var g = new Game(type, MAX_PLAYER, m.map, m.spawn);

    games.push(g);

    return g;
};

function removeFinishedGames() {
    var remove = [];

    for (var i in games) {
        if (games[i].getState() == STATES.FINISHED) {
            remove.push(i);
        }
    }

    for (var i in remove) {
        games.splice(i, 1);
    }
};
