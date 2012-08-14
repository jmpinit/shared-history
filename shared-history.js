var net = require('net');

var db = require('mongojs').connect('mydb', ['players', 'world']);
var dbPlayers = db.collection('players');
var dbWorld = db.collection('world');

var gfx = require('./textgfx.js'); 
var game = require('./game.js');

var sockets = new Array();
var players = new Array();
var world = new game.World(dbWorld, 8);

//method executed when data is received from a socket
function receiveData(socket, data) {
	//identify the player
	var ply = players[game.Player.makeID(socket)];

	//respond to the player's request
	if(data=="w") {
		ply.y--;	
	} else if(data=="s") {
		ply.y++;
	} else if(data=="a") {
		ply.x--;
	} else if(data=="d") {
		ply.x++;
	} else if(data=="1") {
		socket.write(String.fromCharCode(12));
		for(var i in world.chunks) {
			socket.write("world.chunks["+i+"]="+world.chunks[i]+String.fromCharCode(10)+String.fromCharCode(13));
		}
		return;
	}

	//generate the new view
	for(var y=0; y<32; y++) {
		for(x=0; x<32; x++) {
			testbox.putChar(x, y, world.get(ply.x+x-16, ply.y+y-16));
		}
	}

	//reset the player's view
	socket.write(String.fromCharCode(12));
	//send the view to the player
	socket.write(testbox.render());
}

//method executed when a socket ends
function closeSocket(socket) {
	var i = sockets.indexOf(socket);
	if (i != -1) {
		sockets.splice(i, 1);
	}
}
 
//callback method executed when a new TCP socket is opened.
function newSocket(socket) {
	//set up the socket
	sockets.push(socket);
	socket.write(testbox.render());
	socket.on('data', function(data) {
		receiveData(socket, data);
	})
	socket.on('end', function() {
		closeSocket(socket);
	})

	//set up the player
	if(!players[game.Player.makeID(socket)]) {
		players[game.Player.makeID(socket)] = new game.Player(256, 256);
	}
}

//WORLD INIT
var testbox = new gfx.TextView(32, 32);
testbox.putText(10, 10, "HELLO world!");

//NETWORK INIT

var server = net.createServer(newSocket);
 
//listen on port 8888
server.listen(8888);
