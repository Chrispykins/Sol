function run_SpriteAnimation(global) { //the global parameter acts as the global scope, passed into this function at the end of the file

	//Sprite Sheet class
	function SpriteSheet(image) {
		//var sprite= this;

		this.image= image;
		
		this.frames= [];
		this.custom= {}; //an empty object for custom animation paths
	}

	SpriteSheet.prototype.getFrameByTime= function(timestamp) {
		var frameIndex= Math.floor(timestamp * this.frameRate/1000);
		if (frameIndex > this.frames.length - 1) {
			frameIndex= this.frames.length - 1;
		}
		return this.frames[frameIndex];
	}

	SpriteSheet.prototype.createEvenFrames= function(width, height, border) {

		border = border || 0;

		this.custom.default= [];

		var gridWidth= this.image.width / (width + border);
		var gridHeight= this.image.height / (height + border);
		gridWidth= Math.ceil(gridWidth);
		gridHeight= Math.ceil(gridHeight);

		for (var y= 0; y < gridHeight; y++) {

			for (var x= 0; x < gridWidth; x++) {

				this.frames.push(new Frame(x * (width + border), y * (height + border), width, height) );
				this.custom.default.push(y * gridWidth + x);
			}
		}

		this.createReverseAnimation();
	}

	SpriteSheet.prototype.createReverseAnimation= function() {

			this.custom.reverse= [];
			for (var i= this.frames.length-1; i >= 0; i--) {
				this.custom.reverse.push(i);
			}
	}

	global.SpriteSheet= SpriteSheet;


	//Frame class for SpriteSheet
	function Frame(X, Y, width, height) {
		this.X= X;
		this.Y= Y;
		this.width= width;
		this.height= height;
	}

	//Sprite Animation class
	function SpriteAnimation(spriteSheet, options) {

		//make sure options exists
		options= options || {};

		this.spriteSheet= spriteSheet;
		this.frameIndex= 0; //default frame is the first frame on the sprite sheet
		this.currentFrame= this.spriteSheet.frames[0];
		this.frameRate= options.frameRate || 30;//default frameRate is 30 frames per second
		this.speed= 1;  //multiplier to change animation rate, negative numbers for reverse animations
		this.progress= 0; //progress limited to range 0 to 1
		this.animation= 'default'; //runs through the array of frames from start to finish
		this.loop= options.loop || false; //boolean to control whether or not the animation will loop

		this.playing = false;

		this.canvas= options.canvas || global.canvas;
		this.context= options.context || global.context;
		this.viewport= options.viewport;

		this.X= options.X || 0;
		this.Y= options.Y || 0;
		this.width= options.width || this.currentFrame.width;
		this.height= options.height || this.currentFrame.height;
		this.alpha= 1;

		this.frameEvents = [];

	}

	SpriteAnimation.prototype.update= function(dt) {

		if (this.playing) {

			var path= this.spriteSheet.custom[this.animation];
			var frameLength= 1000/this.frameRate
			var totalLength= frameLength * path.length;

			var previousIndex = this.frameIndex;

			//update the progress tracker
			this.progress+= (dt * this.speed)/totalLength;

			//calculate which frame the animation has arrived in
			this.frameIndex= global.Math.floor( (this.progress * totalLength)/frameLength );
			
			//clamp frameIndex between 0 and length of animation path
			this.frameIndex= global.Math.max(0, global.Math.min(path.length - 1, this.frameIndex))

			//grab frame information based on frameIndex
			this.currentFrame= this.spriteSheet.frames[path[this.frameIndex]];

			//check for frame events to call on this frame
			if (previousIndex != this.frameIndex) {

				for (var i = 0; i < this.frameEvents.length; i++) {

					var event = this.frameEvents[i];

					if ((this.frameIndex <= event.frame && previousIndex > event.frame) ||
						(this.frameIndex >= event.frame && previousIndex < event.frame)) {

						event.callback.call(event.target);
					}
				}
			}

			if (this.progress >= 1) { //reached the end of animation

				if (this.loop) {
					this.progress+= -1;
				}
				else {
					this.progress= 1;
					this.stop();
					this.onEnd();
				}
			}
			else if (this.progress <= 0) { //reached the beginning of animation
				
				if (this.loop) {
					this.progress+= 1;
				}
				else {
					this.progress= 0;
					this.stop();
					this.onEnd();
				}
			}
		}
	}

	SpriteAnimation.prototype.start= function(name) {
		
		this.changeAnimation(name);

		this.frameIndex= 0;
		this.playing = true;
	}

	SpriteAnimation.prototype.stop= function() {
		this.playing = false;
	}

	SpriteAnimation.prototype.unpause= function () {
		this.playing = true;
	}


	SpriteAnimation.prototype.addFrameEvent = function(frame, callback, target) {

		target = target || this;

		this.frameEvents.push( { frame: frame, callback: callback, target: target} );
	}

	SpriteAnimation.prototype.removeFrameEvent = function(frame, callback) {

		if (!this.frameEvents.length) return;

		for (var i = this.frameEvents.length - 1; i >= 0; i--) {
			var event = this.frameEvents[i];
			if (frame == event.frame && callback == event.callback) { this.frameEvents.splice(i, 1); }
		}
	}

	SpriteAnimation.prototype.draw= function() {

		if (this.viewport) {
			this.viewport.drawImage(this.spriteSheet.image, this.currentFrame.X, this.currentFrame.Y, this.currentFrame.width, this.currentFrame.height, this.X, this.Y, this.width, this.height);
		}

		else if (this.context) {
			
			if (this.canvas.scale) {
				var scale= this.canvas.scale;
			}
			else {
				var scale= 1;
			}

			if (this.currentFrame) {

				this.context.drawImage(this.spriteSheet.image, this.currentFrame.X, this.currentFrame.Y, this.currentFrame.width, this.currentFrame.height, this.X * scale, this.Y * scale, this.width * scale, this.height * scale);
			}
		}
		else {
			console.error('No context for current animation');
		}
	}

	SpriteAnimation.prototype.changeAnimation= function (name) {

		name = name || "default";

		if (this.spriteSheet.custom[name]) {
			
			this.animation= name;
			this.progress= 0;
			this.currentFrame= this.spriteSheet.frames[this.spriteSheet.custom[name][0]]; //initialize to first frame of animation
		}
		else {
			console.error("No custom animation of name", name);
		}

		return name;

	}

	SpriteAnimation.prototype.setFrame= function(index) {

		//set frame index for reference (probably useless)
		this.frameIndex= this.spriteSheet.custom[this.animation][index];

		//set progress slider to calculate frame index during update
		this.progress= index / this.spriteSheet.custom[this.animation].length;
		
		//set current frame for immediate drawing
		this.currentFrame= this.spriteSheet.frames[this.frameIndex];
	}

	SpriteAnimation.prototype.onEnd= function() {
		//empty function to hold event code
	}

	global.SpriteAnimation= SpriteAnimation;


}