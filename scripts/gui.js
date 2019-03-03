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

		this.bounds= options.bounds || new Rectangle(this.xy, this.size);

		this.canvas= canvas;
		this.context= context;

	}


	Gui.prototype.draw= function(dt) {

		var scale= this.canvas.scale;

		if (this.fade) this.context.globalAlpha= this.fade.value(global.Date.now());

		if (this.animation) {

			this.animation.update(dt);
			this.animation.draw();
		}
		else {
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
	
}