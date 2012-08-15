var gfx = require('./textgfx.js');

function World(/*collection,*/ s) {
	//this.db = collection;
	this.chunkSize = s;

	this.chunks = new Array();
	this.objects = new Array();
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

	set: function(x, y, c) {
		var chunk = this.getChunk(Math.floor(x/this.chunkSize), Math.floor(y/this.chunkSize));
		if(chunk) {
			chunk.set(x%this.chunkSize, y%this.chunkSize, c);
		} else {
			var cx = Math.floor(x/this.chunkSize);
			var cy = Math.floor(y/this.chunkSize);

			this.createChunk(cx, cy).set(x%this.chunkSize, y%this.chunkSize, c);
		}
	},

	isOccupied: function(x, y) {
		if(this.get(x, y)==' ') {
			return false;
		} else {
			return true;
		}
	},

	birth: function(obj) {
		objects.push(obj);
	},

	kill: function(obj) {
		
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
				if(Math.random()*1000>950) {
					newChunk.set(xOff, yOff, String.fromCharCode(Math.floor(Math.random()*93+32)));
				}
			}
		}

		return newChunk;
	},
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

/*
 * A sentient being
 */
function Actor(world, x, y) {
	this.world = world;
	this.x = x;
	this.y = y;
}

Actor.prototype.moveUp = function() {
	//check for collision
	if(this.world.isOccupied(this.x, this.y-1)) {
		return false;
	} else {
		this.y--;	//move
		return true;	//report success
	}	
}

Actor.prototype.moveDown = function() {
	//check for collision
	if(this.world.isOccupied(this.x, this.y+1)) {
		return false;
	} else {
		this.y++;	//move
		return true;	//report success
	}	
}

Actor.prototype.moveLeft = function() {
	//check for collision
	if(this.world.isOccupied(this.x-1, this.y)) {
		return false;
	} else {
		this.x--;	//move
		return true;	//report success
	}	
}

Actor.prototype.moveRight = function() {
	//check for collision
	if(this.world.isOccupied(this.x+1, this.y)) {
		return false;
	} else {
		this.x++;	//move
		return true;	//report success
	}	
}

exports.World = World;
exports.Actor = Actor;
