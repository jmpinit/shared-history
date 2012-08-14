function Player(x, y) {
	this.x = x;
	this.y = y;

	this.dictionary = new Array();
}

Player.makeID = function(socket) {
	return socket.remoteAddress+":"+socket.remotePort;
}

Player.prototype = {
	move: function(x, y) {
		this.x = x;
		this.y = y;
	}
}

function World(collection, s) {
	this.db = collection;
	this.chunkSize = s;

	this.chunks = new Array();
}

World.prototype = {
	get: function(x, y) {
		var cx = Math.floor(x/this.chunkSize);
		var cy = Math.floor(y/this.chunkSize);

		var chunk = this.getChunk(cx, cy);
		if(chunk) {
			return chunk.get(x%this.chunkSize, y%this.chunkSize);
		} else {
			return this.createChunk(cx, cy).get(x%this.chunkSize, y%this.chunkSize);
		}
	},

	/*
	 * Returns the chunk at the given position (in chunk offsets)
	 * or returns undefined if the chunk doesn't exist in RAM
	 */
	getChunk: function(x, y) {
		return this.chunks[x+','+y];
	},

	createChunk: function(x, y) {
		var newChunk = new World.Chunk(this.chunkSize);
		this.chunks[x+','+y] = newChunk;

		//seed
		for(var yOff=0; yOff<this.chunkSize; yOff++) {
			for(var xOff=0; xOff<this.chunkSize; xOff++) {
				newChunk.set(xOff, yOff, String.fromCharCode(Math.floor(Math.random()*93+32)));
			}
		}

		return newChunk;
	}
}

World.Chunk = function(s) {
	this.size = s;
	this.data = new Array();

	//initialize empty
	for(var y=0; y<this.size; y++) {
		for(var x=0; x<this.size; x++) {
			this.set(x, y, " ");
		}
	}
}

World.Chunk.prototype = {
	get: function(x, y) {
		if(x>=0 && x<this.size && y>=0 && y<this.size) {
			return this.data[y*this.size+x];
		}
	},
	
	set: function(x, y, c) {
		if(c.length==1) {
			if(x>=0 && x<this.size && y>=0 && y<this.size) {
				this.data[y*this.size+x] = c;
			}
		}
	}
}

exports.Player = Player;
exports.World = World;
