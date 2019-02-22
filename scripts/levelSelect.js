(function(global) {
	
	var context = global.context;
	var canvas  = global.canvas;
	var gameDimensions = global.gameDimensions;

	var width   = 1500;
	var height  = 300;

	//delay before a simple click turns into a drag, in milliseconds
	var clickDelay = 120;

	var scrollFriction = .1;
	var decay = .8;

	//Level select bar at bottom of screen
	function LevelSelect(options) {

		options = options || {};

		this.unlocked = options.unlocked || 50;

		//not sure, but scrollPosition needs to be the negation of selection, probably because it's an offset from 0
		this.scrollPosition = 0;
		this.scrollVelocity = 0;

		this.selection = 0;

		this.beingDragged = false;

		this.clickPoint = null;
		this.clickTime  = null;

		this.xy = options.xy || [0, 0];

		this.size = options.size || [0, 0];

		this.bounds = new global.Rectangle(this.xy.slice(), this.size);

		this.positions = [global.gameDimensions[1] - this.size[1], global.gameDimensions[1]];

		this.slideProgress = 1;
		this.slideDirection = 0;
		this.visible = false;

		this.fontSize = options.fontSize || 100;
		this.spaceBetween = this.fontSize + 50;

	}


	LevelSelect.prototype.update = function(dt) {

		var slideSpeed = 2;
		var scrollSpeed = 3;

		this.slideProgress += this.slideDirection * slideSpeed * dt;

		if (this.slideDirection && (this.slideProgress >= 1 || this.slideProgress <= 0)) {

			//reset when it goes out of view
			if (this.slideProgress >= 1) this.scrollPosition = -this.selection;

			this.slideDirection = 0;
			this.slideProgress = Math.clamp(0, 1, this.slideProgress);

		}

		this.xy[1] = Math.smoothStep(this.positions[0], this.positions[1], this.slideProgress);

		if (this.beingDragged) {

			//drag selection towards mouse
			var dx = global.mouse[0] - this.clickPoint;

			this.scrollVelocity = dx * scrollSpeed / this.spaceBetween;
			this.clickPoint+= dx * dt;
		}
		else {

			//pull selection back towards the center
			var dx = this.selection + this.scrollPosition;

			this.scrollVelocity += (dx * dt * scrollSpeed) / this.spaceBetween; 
			this.scrollVelocity *= Math.pow(scrollFriction, dt);
		}

		this.scrollPosition+= this.scrollVelocity * dt;

		this.scrollPosition = Math.clamp(-0.49 - this.unlocked, 0.5,  this.scrollPosition);

		this.selection = Math.round(-this.scrollPosition);

	}

	LevelSelect.prototype.draw = function(dt) {

		this.update(dt/1000);

		context.fillStyle = global.levelNumberColor;
		context.textAlign = 'center';

		var dx = this.scrollPosition + this.selection;
		var mid = this.xy[0] + this.size[0]/2;
		var scale = canvas.scale;

		//draw selection number with 3 numbers on each side
		for (var i = -3; i <= 3; i++) {

			var distance = Math.abs(i + dx);

			var fade = 1;
			var fontSize = this.fontSize;

			if (i) {

				//modify properties of all but the middle number
				var fade = Math.clamp(0, 1, 1 - (distance / 3));
				var fontSize = this.fontSize * Math.pow(decay, distance);
			}

			context.globalAlpha = fade;
			context.font = Math.floor(fontSize * scale) + 'px Times';

			var x = mid + (i + dx) * this.spaceBetween;
			var y = this.xy[1] + this.size[1]/2;

			context.fillText(this.selection + i, x * scale, y * scale);
		}

		context.globalAlpha = 1;

	}

	LevelSelect.prototype.selectLevel = function(selection) {

		global.loadLevel(selection);
	}

	LevelSelect.prototype.onClick = function(point) {

		if (this.bounds.contains(point)) {

			this.clickPoint = point[0];
			this.clickTime = Date.now();

			this.beingDragged = true;

			return true;
		}

		return false;
	}

	LevelSelect.prototype.onRelease = function() {

		if (this.beingDragged) {

			this.beingDragged = false;

			this.clickPoint = null;

			if (Date.now() - this.clickTime <= clickDelay) this.selectLevel(this.selection);

			this.clickTime = null;

			return true;
		}

		return false;
	}

	LevelSelect.prototype.onMouseMove = function(point) {

		if (this.beingDragged && !global.mouseDown) this.onRelease();

		if (!this.visible && point[1] < this.bounds.xy[1]) {
			this.slideDirection = 1;
			this.visible = true;
		}

		if (this.visible && point[1] > this.bounds.xy[1]) {
			this.slideDirection = -1;
			this.visible = false;
		}
	}

	global.levelSelect = new LevelSelect({xy: [(gameDimensions[0] - width)/2, gameDimensions[1] - height], size: [width, height]})


})(Sol);