//A library for drawing ASCII art in telnet terminals

function TextView(w, h) {
	this.width = w;
	this.height = h;
	
	this.text = new Array();
	
	this.dirty = true;
	
	//initialize the text array
	for(var y=0; y<this.height; y++) {
		for(var x=0; x<this.width; x++) {
			this.putChar(x, y, " ");
		}
	}
}

TextView.prototype = {
	putChar: function(x, y, c) {
		if(x>=0&&x<this.width&&y>=0&&y<this.height) {
			if(c.length==1) {
				this.text[y*this.width+x] = c;
			}
		}
	},

	getChar: function(x, y) {
		if(x>=0&&x<this.width&&y>=0&&y<this.height) {
			return this.text[y*this.width+x];
		}
		return null;
	},
	
	putText: function(x, y, msg) {
		for(var i=0; i<msg.length; i++) {
			this.putChar(x+i, y, msg.charAt(i));
		}
	},

	clearText: function() {
		for(var i=0; i<this.text.length; i++) {
			this.text[i] = " ";
		}
	},

	render: function() {
		var art = "";

		for(var y=0; y<this.height; y++) {
			for(var x=0; x<this.width; x++) {
				var c = this.getChar(x, y);
				if(c!=null) { art += c; }
			}
			art += String.fromCharCode(10); //new line
			art += String.fromCharCode(13); //beginning of line
		}

		return art;
	}
}

exports.TextView = TextView;
