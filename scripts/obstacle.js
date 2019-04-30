//obstacle class
function run_obstacle(global) {

	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	var sprite= new global.SpriteSheet(global.images.obstacleSheet);

	sprite.createEvenFrames(200, 200);

	sprite.custom.back= [0, 1, 2, 3, 4, 5, 6, 7];
	sprite.custom.vert= [8, 9, 10, 11, 12, 13, 14, 15];
	sprite.custom.forward= [16, 17, 18, 19, 20, 21, 22, 23];
	sprite.custom.hor= [24, 25, 26, 27, 28, 29, 30, 31]

	global.sprites.obstacle= sprite;

	var obstacleWidth = 30;

	function Obstacle(options) {

		//make sure options exists
		options= options || {};

		this.entityType = 'obstacle';

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];

		this.center= [this.xy[0] + this.size[0]/2, this.xy[1] + this.size[1]/2];

		this.enum= ['forward', 'hor', 'back', 'vert'];
		this.rotating= false;
		this.count= 0;

		this.direction= options.direction || 'forward';
		this.saveState= this.direction;

		this.level= options.level || global.currentLevel;

		this.sprite= options.sprite || sprite;

		this.animation= new global.SpriteAnimation(this.sprite, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		this.animation.changeAnimation(this.direction);

		this.sounds= {
			latch: new global.AudioGroup('latch_0', 'latch_1'),
			turn: null
		}

		this.sounds.latch.volume = 0.5;
	}

	Obstacle.prototype.draw= function(dt) {

		var scale = canvas.scale * viewport.scale;

		this.animation.update(dt);
		this.animation.draw();

		/*
		context.beginPath();
		context.arc((this.center[0] - viewport.xy[0]) * scale + viewport.canvasPos[0] * canvas.scale, (this.center[1] - viewport.xy[1]) * scale + viewport.canvasPos[1] * canvas.scale, this.size[0]/5.5 * scale, 0, 2 * Math.PI);
		context.stroke();
		*/

		if (this.count > 0 && !this.rotating) {
			this.rotate();
		}
		else if (this.count < 0 && !this.rotating) {
			this.rotateBack();
		}
	}

	Obstacle.prototype.bounce= function(ball) {

		//center the ball on the obstacle
		ball.xy[0]= this.xy[0] + this.size[0] / 2;
		ball.xy[1]= this.xy[1] + this.size[1] / 2;

		switch (this.direction) {

			case 'hor':
				ball.v= [ball.v[0], -ball.v[1]];
				break;

			case 'vert':
				ball.v= [-ball.v[0], ball.v[1]];
				break;

			case 'forward':
				ball.v= [-ball.v[1], -ball.v[0]];
				break;

			case 'back':
				ball.v= [ball.v[1], ball.v[0]];
				break;
		}
	}

	Obstacle.prototype.rotate= function() {

		//fade in turning sound if not already turning
		if (!this.rotating) {
			this.sounds.turn = global.audioManager.play('turn', 0);
			this.sounds.turn.fadeIn(100);
		}

		//set flag to keep animation from starting over
		this.rotating= true;

		var index= this.enum.indexOf(this.direction);

		index= (index + 1)%this.enum.length;

		this.direction= this.enum[index];

		//function to change over to next animation in cycle
		this.animation.onEnd= function() {

			this.animation.changeAnimation(this.direction);

			this.count--;

			//check if player has clicked on the obstacle multiple times
			if (this.count > 0) {
				this.rotate();
			}
			else {
				this.rotating= false;
				this.count= 0;
				this.animation.speed= 1;

				this.sounds.latch.play();

				if (this.sounds.turn) {
					this.sounds.turn.pause();
					this.sounds.turn = null;
				}

				if (!this.level.playing) this.updateLevelData();
			}

		}.bind(this);


		this.animation.unpause();
	}

	Obstacle.prototype.rotateBack= function() {

		//fade in turning sound if not already turning
		if (!this.rotating) {
			this.sounds.turn = global.audioManager.play('turn', 0);
			this.sounds.turn.fadeIn(100);
		}

		//set flag to keep animation from starting over
		this.rotating= true;

		//function to change over to next animation in cycle
		this.animation.onEnd= function() {
		
			this.direction= this.enum[index];

			this.animation.changeAnimation(this.direction);

			this.count++;

			//check if multiple rotations must happen
			if (this.count < 0) {
				this.rotateBack();
			}
			else {
				this.rotating= false;
				this.count= 0;
				this.animation.speed= 1;

				this.sounds.latch.play();

				if (this.sounds.turn) {
					this.sounds.turn.pause();
					this.sounds.turn = null;
				}

				if (!this.level.playing) this.updateLevelData();
			}

		}.bind(this);

		//index of current direction
		var index= this.enum.indexOf(this.direction);

		//calculate index of direction we are headed
		index= ((index - 1) + this.enum.length)%this.enum.length;

		//change animation to direction we are headed
		this.animation.changeAnimation(this.enum[index]);

		//set animation to play backward, starting at the last frame
		if (this.animation.speed > 0) {
			this.animation.speed*= -1;
		}
		this.animation.setFrame(this.sprite.custom[this.direction].length - 1); 

		this.animation.unpause();		
	}

	Obstacle.prototype.save= function() {

		this.saveState= this.direction;
	}

	Obstacle.prototype.revert= function() {

		var from= this.enum.indexOf(this.direction);
		var to= this.enum.indexOf(this.saveState);
		var distance= to - from;

		if (distance != 0) {

			this.animation.speed= 4;

			if (distance > 2) {
				
				distance %= this.enum.length;
				distance -= this.enum.length;

			}
			else if (distance < -2) {
				
				distance %= this.enum.length;
				distance += this.enum.length;
			}
					
			this.count= distance;
		}

		if (this.sounds.turn) {
			this.sounds.turn.pause();
			this.sounds.turn = null;
		}

	}

	Obstacle.prototype.onClick= function(click) {

		if (!click) {
			click= this.center;
		}

		if ( this.contains(click) ) {

			this.activate();

			//register action with undo buffer
			this.level.undoManager.registerAction(this.gridPos.slice(), this.entityType);

			return true;

		} else return false;


	}

	Obstacle.prototype.contains = function(point) {

		if (Math.distance(point, this.center) < this.size[0] / 5.5) return true;

		switch (this.direction) {

			case 'hor':
				return global.distanceToHorizontalLine(this.center[1], point) < obstacleWidth;
				break;

			case 'vert':
				return global.distanceToVerticalLine(this.center[0], point) < obstacleWidth;
				break;

			case 'back':
				return global.distanceToNegativeDiagonal(this.center, point) < obstacleWidth;
				break;

			case 'forward':
				return global.distanceToPositiveDiagonal(this.center, point) < obstacleWidth;
				break;

		}
	}

	Obstacle.prototype.activate = function() {
		
		//increment counter to track the number of clicks
		this.count++;
	}

	Obstacle.prototype.undo = function() {

		this.count--;
	}

	Obstacle.prototype.updateLevelData = function() {

/*
		var index = this.enum.indexOf(this.direction) + this.count;
		index = (index + this.enum.length) % this.enum.length;

		this.level.updateLevelData(this, this.enum[index]);
*/
		this.level.updateLevelData(this, this.direction);
	}

	global.Obstacle= Obstacle;


}