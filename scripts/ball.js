//ball class
(function(global) {

	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	var sprite= new global.SpriteSheet(global.images.ballSheet);
	sprite.createEvenFrames(100, 100);


	function Ball(options) {

		//make sure options exists
		options= options || {};

		this.entityType = "ball";

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.v= options.v || [0, 0];

		this.destroyed= false; //flag for ball removal next tick

		this.level= options.level || global.currentLevel;

		this.sprite= options.sprite || sprite;

		this.animation= new global.SpriteAnimation(this.sprite, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			loop: true,
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		this.animation.frameRate= 60;
		this.animation.start();

		this.canvas= canvas;
		this.context= context;
		this.viewport= viewport;
	}

	Ball.prototype.update= function(dt) {

		//this.checkCollisions();

		this.xy[0]+= this.v[0] * dt;
		this.xy[1]+= this.v[1] * dt;

		this.animation.X= this.xy[0];
		this.animation.Y= this.xy[1];

	}

	Ball.prototype.onBeat= function() {

		var notes= [];

		var x= global.Math.floor( (this.xy[0] - this.level.xy[0]) / this.level.cellSize);
		var y= global.Math.floor( (this.xy[1] - this.level.xy[1]) / this.level.cellSize);

		if (x < 0 || x >= this.level.gridSize[0]) {
			this.destroyed= true;
			return;
		}

		if (y < 0 || y >= this.level.gridSize[1]) {
			this.destroyed= true
			return;
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

		this.animation.update(dt);
		this.animation.draw();
	}

	global.Ball= Ball;


})(Sol);