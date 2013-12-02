/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util 	        = require("util"),				      // Utility resources (logging, object inspection, etc)
	io 		        = require("socket.io"),			      // Socket.IO	
    db              = require("./db"),                      // database server functions
    game_manager    = require("./game_manager");            // manage all game functions


/**************************************************
** SERVER VARIABLES
**************************************************/
var socket;		// Socket controller


/**************************************************
** SERVER INITIALISATION
**************************************************/
function init() {
	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

	// Configure Socket.IO
	socket.configure(function() {
		// Only use WebSockets
		socket.set("transports", ["websocket"]);

		// Restrict log output
		socket.set("log level", 2);
	});

    db.init();
    game_manager.init(util);
    
	socket.sockets.on("connection", onSocketConnection);
    
    util.log("Server started!");
};


/**************************************************
** SET EVENT HANDLERS FOR EACH CLIENT
**************************************************/

// New socket connection
function onSocketConnection(client) {
	util.log("New player has connected: " + client.id);
    
    db.handleClient(client);

	game_manager.handleClient(client);
};


/**************************************************
** RUN THE SERVER
**************************************************/
init();
