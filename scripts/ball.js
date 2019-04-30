//ball class
function run_ball(global) {

	var sprite= new global.SpriteSheet(global.images.ballSheet);
	sprite.createEvenFrames(100, 100);


	function Ball(options) {

		//make sure options exists
		options= options || {};

		this.entityType = "ball";

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.v= options.v || [0, 0];

		this.distanceToWormhole = 9999; //used to control wormhole animation
		this.targetWormhole = null;

		this.destroyed= false; //flag for ball removal next tick

		this.level= options.level || global.currentLevel;

		this.sprite= options.sprite || sprite;

		this.animation= new global.SpriteAnimation(this.sprite, {
			X: this.xy[0] - this.size[0]/2,
			Y: this.xy[1] - this.size[1]/2,
			width: this.size[0],
			height: this.size[1],
			loop: true,
			canvas: global.canvas,
			context: global.context,
			viewport: global.viewport
		});

		this.animation.frameRate= 90;
		this.animation.start();

		this.opacity = 1;
		this.opacityDirection = 0;
	}

	Ball.prototype.update= function(dt) {

		this.xy[0]+= this.v[0] * dt;
		this.xy[1]+= this.v[1] * dt;

		//fade when passing through wormhole
		/*
		if (this.targetWormhole) {

			this.opacity += this.level.bps * dt * this.opacityDirection;

			if (this.opacity > 1) {
				this.targetWormhole = null;
				this.opacity = 1;
			}
		}
		*/

	}

	Ball.prototype.onBeat= function() {

		if (this.destroyed) return [];

		var notes= [];

		var x= global.Math.floor( (this.xy[0] - this.level.xy[0]) / this.level.cellSize);
		var y= global.Math.floor( (this.xy[1] - this.level.xy[1]) / this.level.cellSize);

		if (x < 0 || x >= this.level.gridSize[0]) {
			this.destroyed= true;
			return [];
		}

		if (y < 0 || y >= this.level.gridSize[1]) {
			this.destroyed= true
			return [];
		}

		var currentCell= this.level.grid[y][x];

		if (!currentCell) {
			return [];
		}

		for (var i= 0, l= currentCell.length; i < l; i++) {

			if (currentCell[i] instanceof global.Obstacle || currentCell[i] instanceof global.Gate) {
				currentCell[i].bounce(this);
			}

			if (currentCell[i] instanceof global.Note || currentCell[i] instanceof global.TwoTone) {
				notes = notes.concat( currentCell[i].activate() );
			}

			if (currentCell[i] instanceof global.Button) {
				notes = notes.concat( currentCell[i].activate() );
			}
		}

		//second pass for wormholes
		for (var i = 0, l = currentCell.length; i < l; i++) {

			if (currentCell[i] instanceof global.Wormhole) {
				currentCell[i].transfer(this);
			}
		}

		return notes;
	}

	Ball.prototype.save= function() {

		//empty function to prevent errors
	}

	Ball.prototype.revert= function() {

		//empty function to prevent errors
	}

	Ball.prototype.draw= function(dt) {

		//if (this.targetWormhole) context.globalAlpha = this.opacity;

		this.animation.X= this.xy[0] - this.size[0]/2;
		this.animation.Y= this.xy[1] - this.size[1]/2;

		this.animation.update(dt);
		this.animation.draw();
	}

	global.Ball= Ball;


}