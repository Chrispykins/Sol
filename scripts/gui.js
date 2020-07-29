//Graphical User Interface class
function run_gui(global) {

	var canvas= global.canvas;
	var context= global.context;

	function Gui(options) {

		//make sure options exists
		options= options || {};

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		
		this.sound= options.sound;
		this.image= options.image;

		this.animation; //animation must be defined after construction 

		this.tooltip = options.tooltip || undefined; 
		if (this.tooltip) this.tooltip.parent = this;

		this.bounds= options.bounds || new Rectangle(this.xy, this.size);

		this.canvas= canvas;
		this.context= context;

	}

	Gui.prototype.draw= function(dt) {

		var scale= this.canvas.scale;

		if (this.fade) this.context.globalAlpha= this.fade.value(global.Date.now());

		if (this.tooltip) this.tooltip.draw(dt);

		if (this.animation) {

			this.animation.X = this.xy[0];
			this.animation.Y = this.xy[1];

			this.animation.update(dt);
			this.animation.draw();
		}
		else if (this.image) {
			this.context.drawImage(this.image, this.xy[0] * scale, this.xy[1] * scale, this.size[0] * scale, this.size[1] * scale);
		}

		this.context.globalAlpha= 1;
	}	

	Gui.prototype.onClick= function() {
		//empty function to fill for specific gui objects
	}

	Gui.prototype.contains = function(point) {
		return this.bounds.contains(point);
	}

	//one type of boundary for gui objects        // ---others could be Circles, Triangles, or irregular polygons--- //
	///variadic arguments: Rectangle([x, y, width, height]) or (xy, size) or (x, y, width, height)
	function Rectangle() {

		if (arguments.length== 1) {
		    this.xy= [ arguments[0][0], arguments[0][1] ];
		    this.size= [ arguments[0][2], arguments[0][3] ];
		}
		else if (arguments.length== 2) {
			this.xy= arguments[0];
			this.size= arguments[1];
		}
		else if (arguments.length== 4) {
			this.xy= [arguments[0], arguments[1]];
			this.size= [arguments[2], arguments[3]];
		}
		else {
			console.error('Cannot construct Rectangle due to invalid number of arguments');
		}
	}

	Rectangle.prototype.contains= function(point) {
	
		var left= this.xy[0];
		var right= this.xy[0] + this.size[0];
		var top= this.xy[1];
		var bottom= this.xy[1] + this.size[1];

		if (point[0] >= left && point[0] <= right) {

			if (point[1] >= top && point[1] <= bottom) {
				return true;
			}
		}

		return false;
	}

	Rectangle.prototype.draw = function() {
		global.context.strokeRect(this.xy[0] * global.canvas.scale, this.xy[1] * global.canvas.scale, this.size[0] * global.canvas.scale, this.size[1] * global.canvas.scale);
	}

	//tooltip class for GUI objects
	function Tooltip(offset, dimensions, text, fontSize) {

		this.parent; //parent must be of type GUI, must be set after construction
		this.offset = offset.slice();
		this.dimensions = dimensions.slice();
		this.text = text;

		this.timer = 0;
		this.fadeTime  = 0.3;
		this.delay = 0.3;

		this.backgroundColor = global.levelNumberColor;//'#259'
		this.textColor = 'white';
		this.fontSize = fontSize || 50;
	}

	Tooltip.prototype.draw = function(dt) {

		if (this.parent) {

			var context = this.parent.context;
			var scale   = this.parent.canvas.scale;

			var direction = this.parent.contains(global.mouse) ? 1 : -1.5;

			//opacity
			this.timer += (dt/1000) * direction;
			this.timer = Math.clamp(-this.delay, this.fadeTime + this.delay, this.timer);
			var time = Math.clamp(0, this.fadeTime, this.timer);

			var oldOpacity = context.globalAlpha;
			var opacity = time / this.fadeTime;

			var x = (this.parent.xy[0] + this.offset[0]) * scale;
			var y = (this.parent.xy[1] + this.offset[1]) * scale;
			var width  = this.dimensions[0] * scale;
			var height = this.dimensions[1] * scale;

			//background
			context.globalAlpha = opacity;
			context.fillStyle = this.backgroundColor;
			context.roundedRect(x, y, width, height, (this.fontSize * .8) * scale);
			context.fill();

			//text
			context.globalAlpha = opacity * opacity;
			context.font = Math.floor(this.fontSize * scale) + 'px Arial';
			context.fillStyle = this.textColor;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(this.text,  x + width/2, y + height/2);

			context.globalAlpha = oldOpacity;
		}
		else console.error("Tooltip must have a valid parent!");

	}

	//a class that fades a value between 0 and 1
	function Fade(direction, length) { //length in milliseconds
	    
	    this.direction= direction;
	    this.length= length;
	    
	    this.start= Date.now();

	}
	
	Fade.prototype.value= function(now) {
	    
	    var progress= (now - this.start)/(this.length);
	    
	    if (this.direction == 'out') {
	        
	        if (progress < 1) {
	            return (1 - progress);
	        }
	        else {
	            this.onEnd();
	            return 0;
	        }
	    }
	    else if (this.direction == 'in') {
	        
	        if (progress < 1) {
	            return progress;
	        }
	        else {
	            this.onEnd();
	            return 1;
	        }
	    }
	}
	
	Fade.prototype.onEnd= function() {
	    
	    //Note: You should always overwrite this method to destroy the fade if you 
	    //      are not going to use it again.
	}

	//export classes to global
	global.Gui= Gui;
	global.Fade= Fade;
	global.Rectangle= Rectangle;
	global.Tooltip = Tooltip;
	
}