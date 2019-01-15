function globalSpriteAnimation(global) { //the global parameter acts as the global scope, passed into this function at the end of the file

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

		if (!border) {
			border= 0;
		}

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
		this.frameRate= 30;//default frameRate is 30 frames per second
		this.speed= 1;  //multiplier to change animation rate, negative numbers for reverse animations
		this.progress= 0; //progress limited to range 0 to 1
		this.animation= 'default'; //runs through the array of frames from start to finish
		this.loop= options.loop || false; //boolean to control whether or not the animation will loop

		this.startTime= 0;
		this.endTime= 0;

		this.canvas= options.canvas || global.canvas;
		this.context= options.context || global.context;
		this.viewport= options.viewport;

		this.X= options.X || 0;
		this.Y= options.Y || 0;
		this.width= options.width || this.currentFrame.width;
		this.height= options.height || this.currentFrame.height;
		this.alpha= 1;

	}

	SpriteAnimation.prototype.update= function(dt) {

		if (this.startTime!= 0) {

			var path= this.spriteSheet.custom[this.animation];
			var frameLength= 1000/this.frameRate
			var totalLength= frameLength * path.length;

			//update the progress tracker
			this.progress+= (dt * this.speed)/totalLength;

			//calculate which frame the animation has arrived in
			this.frameIndex= global.Math.floor( (this.progress * totalLength)/frameLength );
			
			//clamp frameIndex between 0 and length of animation path
			this.frameIndex= global.Math.max(0, global.Math.min(path.length - 1, this.frameIndex))

			//grab frame information based on frameIndex
			this.currentFrame= this.spriteSheet.frames[path[this.frameIndex]];


			if (this.progress >= 1) { //reached the end of animation
				
				this.startTime= 0;
				this.endTime= global.Date.now();

				if (this.loop) {
					this.startTime= global.Date.now();
					this.progress+= -1;
				}
				else {
					this.progress= 1;
					this.stop();
					this.onEnd();
				}
			}
			else if (this.progress <= 0) { //reached the beginning of animation
				
				this.startTime= 0;
				this.endTime= global.Date.now();

				if (this.loop) {
					this.startTime= global.Date.now();
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
		
		if (name) this.changeAnimation(name);

		this.frameIndex= 0;

		if (this.spriteSheet.custom[this.animation]) {
			this.progress= 0;
			this.startTime= global.Date.now();
		}
		else {
			this.animation= 'default';
			this.progress= 0;
			this.startTime= global.Date.now();
			console.log('Custom animation "' + this.animation + '" for '+ this.spriteSheet.image.id + ' does not exist');
		}

	}

	SpriteAnimation.prototype.stop= function() {
		this.startTime= 0;
	}

	SpriteAnimation.prototype.unpause= function () {
		this.startTime= global.Date.now();
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

		if (!name) {
			name= 'default';
		}

		if (this.spriteSheet.custom[name]) {
			
			this.animation= name;
			this.progress= 0;
			this.currentFrame= this.spriteSheet.frames[this.spriteSheet.custom[name][0]]; //initialize to first frame of animation
		}
		else {
			console.error("No custom animation of name", name);
		}

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


} //pass global scope here. Passing 'window' will make the global variables behave normally
