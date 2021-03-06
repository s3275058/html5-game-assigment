/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	bullets,		// All bullets
	socket;			// Socket connection


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	//~ canvas.width = window.innerWidth;
	//~ canvas.height = window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random() * (canvas.width - 5)),
		startY = Math.round(Math.random() * (canvas.height - 5));

	// Initialise the local player
	localPlayer = new Player(startX, startY);

	// Initialise socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	// Initialise remote players array
	remotePlayers = [];
	
	// Initialise bullets array
	bullets = [];

	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);
	
	// Get his own id
	socket.on("id", function(i) {
		console.log("receive id: " + i);
		localPlayer.setId(i);
		console.log("after set id: " + localPlayer.getId());
	});

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);
	
	// Bullet shot message received
	socket.on("shoot", onShoot);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
	
	// Chatting	
	$("#send").click(function(){
		var msg = $("#msg").val();
		socket.emit("chat", msg);
		$("#msg").val("");
		$("#msgs").append("<li><strong><span class='text-success'>I say : </span></strong>" + msg + "</li>");
	});

	$("#msg").keypress(function(e){
		if(e.which == 13) {
			var msg = $("#msg").val();
			socket.emit("chat", msg);
			$("#msg").val("");
			$("#msgs").append("<li><strong><span class='text-success'>I say : </span></strong>" + msg + "</li>");
		}
	});
	
    // Listen for chat messages
	socket.on("chat", function(data) {
		$("#msgs").append("<li><strong><span class='text-success'>" + data.id + " says : </span></strong>" + data.msg + "</li>");		
	});
};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: " + data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: " + data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
};

// Add bullet to the current game world
function onShoot(bullet) {
	if (!playerById(bullet.id)) {
		console.log("Player not found: " + bullet.id);
		return;
	}
	
	bullets.push(new Bullet(bullet.id, bullet.x, bullet.y, bullet.dx, bullet.dy, bullet.lifespan));
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
	if (localPlayer.update(keys)) {
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
	};
	
	// Check if the player shoots and emits to server
	var data = localPlayer.shoot(keys, bullets);
	if (data) {
		socket.emit("shoot", data);
	};
	
	// If a bullet has exceeded its lifespan, it should be removed
	removedBullets = [];
	
	var i = 0;
	for (i = 0; i < bullets.length; i++) {		
		if (!bullets[i].update()) {
			removedBullets.push(bullets[i]);
		}
	}
	
	for (i = 0; i < removedBullets.length; i++) {
		bullets.splice(bullets.indexOf(removedBullets[i]), 1);		
	}
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the local player
	localPlayer.draw(ctx);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
	
	// Draw bullets
	for (i = 0; i < bullets.length; i++) {
		bullets[i].draw(ctx);
	}
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};
