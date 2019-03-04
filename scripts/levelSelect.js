function run_levelSelect(global) {
	
	var context = global.context;
	var canvas  = global.canvas;
	var gameDimensions = global.gameDimensions;

	var width   = 1200;
	var height  = 200;

	//delay before a simple click turns into a drag, in milliseconds
	var clickDelay = 150;

	var scrollFriction = .01;
	var decay = .7;

	//Level select bar at bottom of screen
	function LevelSelect(options) {

		options = options || {};

		this.unlocked = localStorage.Sol_progress ? parseInt(localStorage.Sol_progress) : 0;

		//not sure, but scrollPosition needs to be the negative of selection, probably because it's an offset from 0
		this.scrollPosition = 0;
		this.scrollVelocity = 0;

		this.selection = 0;
		this.highlight = -1;

		this.beingDragged = false;
		this.animatingToSelection = false;

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

		//animation helper values
		this.dt = 0;
		this.lastMousePosition = 0;

		this.oldSelection = 0;
		this.newSelection = 0;
		this.selectionTime = 0;

	}


	LevelSelect.prototype.update = function(dt) {

		this.updateVisibility(dt);
		this.updateScroll(dt);

		this.dt = dt;

	}

	LevelSelect.prototype.updateScroll = function(dt) {

		var scrollSpeed = 5;
		var centeringSpeed = 10;

		if (this.animatingToSelection) {

			var dx = this.oldSelection - this.newSelection;

			this.scrollPosition+= dx * dt * scrollSpeed;

			if (dx >= 0 && (this.scrollPosition + this.newSelection) >= 0) this.animatingToSelection = false;
			if (dx < 0 && (this.scrollPosition + this.newSelection) < 0) this.animatingToSelection = false;
		}
		else if (this.beingDragged) {

			//drag selection towards mouse
			var dx = global.mouse[0] - this.lastMousePosition;

			this.scrollPosition+= dx / this.spaceBetween;

			this.lastMousePosition = global.mouse[0];
		}
		else {

			//pull selection back towards the center
			var dx = this.selection + this.scrollPosition;
			this.scrollVelocity -= dx * dt * centeringSpeed;

			//apply friction
			this.scrollVelocity *= Math.pow(scrollFriction, dt);

			this.scrollPosition+= this.scrollVelocity * dt;

		}

		//don't allow the bar to scroll past 1 or the last level the player unlocked
		if (this.scrollPosition < -0.49 - this.unlocked) {

			//player is at max level
			this.scrollPosition = -0.49 - this.unlocked;
			this.scrollVelocity = 0;
			this.animatingToSelection = false;
		}
		else if (this.scrollPosition > -0.5) {

			//player is at one
			this.scrollPosition =  -0.5;
			this.scrollVelocity = 0;
			this.animatingToSelection = false;
		}
		
		this.selection = Math.round(-this.scrollPosition);
	}

	LevelSelect.prototype.updateVisibility = function(dt) {

		var slideSpeed = 2;

		this.slideProgress += this.slideDirection * slideSpeed * dt;

		if (this.slideDirection && (this.slideProgress >= 1 || this.slideProgress <= 0)) {

			//reset when it goes out of view
			if (this.slideProgress >= 1) {
				this.selection = global.currentLevel.number;
				this.scrollPosition = -global.currentLevel.number;
				this.scrollVelocity = 0;
				this.animatingToSelection = false;
				this.beingDragged = false;
			}

			this.slideDirection = 0;
			this.slideProgress = Math.clamp(0, 1, this.slideProgress);

		}

		this.xy[1] = Math.smoothStep(this.positions[0], this.positions[1], this.slideProgress);
	}

	LevelSelect.prototype.draw = function(dt) {

		this.update(dt/1000);

		context.fillStyle = global.backgroundColor;

		context.fillRect(this.xy[0] * canvas.scale, this.xy[1] * canvas.scale, this.size[0] * canvas.scale, this.size[1] * canvas.scale);

		context.fillStyle = global.levelNumberColor;
		context.textBaseline = 'middle';

		var dx = this.scrollPosition + this.selection;
		var mid = this.xy[0] + this.size[0]/2;
		var scale = canvas.scale;

		//draw selection number with 3 numbers on each side
		for (var i = -3; i <= 3; i++) {

			if (this.selection + i < 1 || this.selection + i > this.unlocked) continue;

			var distance = Math.abs(i + dx);

			var fade = 1;
			var fontSize = this.fontSize;

			if (i) {

				//modify properties of all but the middle number
				fade = Math.clamp(0, 1, 1 - (distance / 3));
				fontSize = this.fontSize * Math.pow(decay, distance);
			}

			context.globalAlpha = fade;
			context.font = Math.floor(fontSize * scale) + 'px Times';

			var x = mid + (i + dx) * this.spaceBetween;
			var y = this.xy[1] + this.size[1]/2;

			context.fillText(this.selection + i, x * scale, y * scale);
		}

		context.globalAlpha = 1;

	}

	LevelSelect.prototype.updateUnlocked = function(unlocked) {

		if (unlocked > this.unlocked) {
			this.unlocked = unlocked;
			this.animateToSelection(unlocked);
		}
	}

	LevelSelect.prototype.selectLevel = function(selection) {

		global.loadLevel(selection);

	}

	LevelSelect.prototype.onClick = function(point) {

		if (this.bounds.contains(point)) {

			this.clickPoint = point[0];
			this.lastMousePosition = point[0];
			this.clickTime = Date.now();

			this.beingDragged = true;

			return true;
		}

		return false;
	}

	LevelSelect.prototype.onRelease = function() {

		if (this.beingDragged) {

			this.beingDragged = false;

			this.scrollVelocity = (global.mouse[0] - this.lastMousePosition) / (this.spaceBetween * this.dt);

			if (Date.now() - this.clickTime <= clickDelay && Math.abs(this.scrollVelocity) < 1) {

				//this is a mouse click if the mouse didn't move that much, otherwise it's a drag
				if (Math.abs(global.mouse[0] - this.clickPoint) < this.fontSize) {

					var index = this.findNumberAtPosition(global.mouse[0]);

					if (this.selection + index != global.currentLevel.number) {

						if (this.selection + index <= this.unlocked && this.selection + index > 0) {

							//player has clicked on number
							this.animateToSelection(this.selection + index);

							this.selectLevel(this.selection + index);
						}
					}
				}

			}


			this.clickTime = null;
			this.clickPoint = null;
			this.lastMousePosition = null;

			return true;
		}

		return false;
	}

	LevelSelect.prototype.onMouseMove = function(point) {

		if (this.beingDragged && !global.mouseDown) this.onRelease();

		//don't go out of frame if we are being dragged or still moving
		if (this.beingDragged || Math.abs(this.scrollVelocity) > 0.5) return;

		if (point[1] < this.bounds.xy[1] || point[0] < this.bounds.xy[0] || point[0] > this.bounds.xy[0] + this.size[0]) {
			
			if (this.visible) {
				this.slideDirection = 1;
				this.visible = false;
			}
		}
		else if (!this.visible) {
			this.slideDirection = -1;
			this.visible = true;
		}
	}

	LevelSelect.prototype.findNumberAtPosition= function(x) {

		var mid = this.xy[0] + this.size[0]/2;
		var dx  = this.selection + this.scrollPosition;

		// measure x from the mid point of selection being 0
		x -= mid;

		//divide by width of range that x could occupy
		x /= this.spaceBetween;

		//remove slight offset that is allowed in selection
		x -= dx;

		return Math.clamp(-3, 3, Math.round(x));
	}

	LevelSelect.prototype.animateToSelection = function(selection) {

		this.oldSelection = this.selection;
		this.newSelection = selection;
		this.selectionTime = Date.now();
		this.animatingToSelection = true;
	}

	global.LevelSelect = LevelSelect;

	global.levelSelectWidth = width;
	global.levelSelectHeight = height;

	//global.levelSelect = new LevelSelect({xy: [(gameDimensions[0] - width)/2, gameDimensions[1] - height], size: [width, height]})
}