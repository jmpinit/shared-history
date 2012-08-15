var utils = require('./utils.js');
var game = require('./game.js');
var gfx = require('./textgfx.js');

function Client(socket) {
	this.socket = socket;
	this.player = null;
	this.buffer = "";

	this.promptInfo = {
		callback: null,
		message: null
	};
}

Client.prototype = {
	/*
	 * Processes new input
	 */
	process: function(data) {
		//echo
		this.write(data);

		this.buffer += data.toString();
		
		//check for backspace
		var dels = this.buffer.split(String.fromCharCode(127));
		for(var i=0; i<dels.length-1; i++) {
			dels[i] = dels[i].substring(0, dels[i].length-1);
		}
		this.buffer = dels.join("");

		//process current buffer
		var parts = this.buffer.split("\r\n");

		if(parts.length>1) {
			for(var i=0; i<parts.length-1; i++) {
				parts[i] = utils.trim(parts[i]);

				//check for outstanding prompts
				if(this.promptInfo.callback!=null) {
					var result = this.promptInfo.callback(parts[i]);

					//only stop trying if input verified
					if(result===true || typeof result == 'undefined') {
						this.promptInfo.callback = null;
					} else {
						this.write(this.promptInfo.message);
					}
				} else {
					//consume data we didn't ask for
				}
			}

			this.buffer = parts[parts.length-1];
		}
	},

	/*
	 * Sends a message directly to the client
	 */
	write: function(data) {
		this.socket.write(data);
	},
	
	println: function(data) {
		if(data) {
			this.write(data+"\r\n");
		} else {
			this.write("\r\n");
		}
	},

	/*
	 * Asks the client for data
	 * calls the callback when data received
	 * if callback returns false prompt is tried again
	 */
	prompt: function(msg, callback) {
		this.socket.write(msg);
		this.promptInfo.callback = callback;
		this.promptInfo.message = msg;
	}
}

function Admin(socket) {
	Client.call(this, socket);
}

Admin.prototype = new Client();
Admin.prototype.constructor = Admin;

function Player(socket, world, width, height) {
	Client.call(this, socket);

	this.playing = false;
	this.world = world;
	this.view = new gfx.TextView(width, height);
	this.dictionary = new Array();
	
	this.buffer = "";
	this.prompt("Where do you want to start? (x, y): ", function(data) {
		var parts = data.replace("[\(\)]", '').split(",");
		if(parts.length==2) {
			var x = parts[0];
			var y = parts[1];

			if(x==0 || y==0) {
				client.println('Error: x and y must be nonzero');
				return false;
			} else {
				//create the player's physical presence
				this.actor = new game.Actor(this.world, x, y);
				this.playing = true;

				this.println("Move around with 7, 8, 9, and 0");
				
				setTimeout(function() { this.draw(); }, 1000);

				console.log(makeID(socket)+' is now in the world.');
			}
		} else {
			client.println('Error: "'+data+'" is bad input.');
			return false;
		}

		return true;
	});
}

Player.prototype = new Client(); 
Player.prototype.constructor = Player;

Player.prototype.teleport = function(x, y) {
	this.x = x;
	this.y = y;
}

Player.prototype.see = function() {
	//generate the new view
	for(var y=0; y<this.view.height; y++) {
		for(var x=0; x<this.view.width; x++) {
			var offX = this.actor.x+x-Math.floor(this.view.width/2);
			var offY = this.actor.y+y-Math.floor(this.view.height/2);

			this.view.putChar(x, y, this.world.get(offX, offY));
		}
	}
}

Player.prototype.draw = function() {
	this.see();
	this.view.putChar(Math.floor(this.view.width/2), Math.floor(this.view.height/2), String.fromCharCode(182));

	this.write(String.fromCharCode(12));
	this.write(this.view.render());
}

Player.prototype.build = function(c) {
	if(c.length==1) {
		this.world.set(this.x, this.y, c);
	}
}

Player.prototype.process = function(data) {
	Client.prototype.process.call(this, data);

	if(this.playing==true) {
		data = data.toString();

		switch(utils.trim(data)) {
			case '7': this.moveLeft(); break;
			case '8': this.moveDown(); break;
			case '9': this.moveUp(); break;
			case '0': this.moveRight(); break;

			default:
				if(data.charCodeAt(0)>=32 && data.charCodeAt(0)<=126) { this.build(data); }
		}

		if(this.view.dirty) {
			this.draw();
		}
	}
}

exports.Client = Client;
exports.Player = Player;
exports.Admin = Admin;
