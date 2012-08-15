var net = require('net');

/*var db = require('mongojs').connect('mydb', ['players', 'world']);
var dbPlayers = db.collection('players');
var dbWorld = db.collection('world');*/

var utils = require('./utils.js');
var users = require('./users.js');
var game = require('./game.js');
var gfx = require('./textgfx.js'); 

var sockets = new Array();
var clients = new Array();

var players = new Array();
var world = new game.World(/*dbWorld,*/ 8);

//method executed when data is received from a socket
function receiveData(socket, data) {
	var client = clients[makeID(socket)];
	
	if(typeof client == 'undefined') {
		//new connection
		//print the welcome message and make a new client

		clients[makeID(socket)] = new users.Client(socket);
		client = clients[makeID(socket)];

		client.println("WELCOME TO SHARED HISTORY");
		client.prompt("Are you going to crash my server? (lie and type 'no'): ", function(data) {
			if(utils.trim(data.toString()=="no")) {
				client.prompt("Please enter your desired viewport size (w, h): ", function(data) {
					var parts = data.replace("[\(\)]", '').split(",");
					if(parts.length==2) {
						var w = parts[0];
						var h = parts[1];

						if(w==0 || h==0) {
							client.println('Error: x and y must be nonzero');
							return false;
						} else {
							//create a new player
							client = new users.Player(socket, world, 256, 256, w, h);
							clients[makeID(socket)] = client;

							client.println("You are now a player!");
							client.println("Move around with 7, 8, 9, and 0");
							
							setTimeout(function() { client.draw(); }, 1000);

							console.log(makeID(socket)+' is now a player.');
						}
					} else {
						client.println('Error: "'+data+'" is bad input.');
						return false;
					}

					return true;
				});
			} else {
				//assume they are a browser
				socket.write("HTTP/1.0 404 Not Found");
			}
		});

		console.log('Welcomed new client '+makeID(socket));
	} else {
		client.process(data);
	}
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
	socket.on('data', function(data) {
		receiveData(socket, data);
	})
	socket.on('end', function() {
		closeSocket(socket);
	})
	socket.on('close', function() {
		closeSocket(socket);
	})
}

function makeID(socket) {
	return socket.remoteAddress+":"+socket.remotePort;
}

//WORLD INIT

//NETWORK INIT

var server = net.createServer(newSocket);
 
//listen on port 8888
server.listen(8888);
