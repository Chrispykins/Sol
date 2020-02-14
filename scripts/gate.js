//gate class
function run_gate(global) {
	
	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	var sprites= {
		vert: new global.SpriteSheet(global.images.vertGateSheet),
		hor: new global.SpriteSheet(global.images.horGateSheet),
		for: new global.SpriteSheet(global.images.forGateSheet),
		back: new global.SpriteSheet(global.images.backGateSheet)
	}

	for (var direction in sprites) {
		sprites[direction].createEvenFrames(400, 400);
		global.sprites[direction]= sprites[direction];

		sprites[direction].custom.openPos= [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
		sprites[direction].custom.closePos= [19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
		sprites[direction].custom.openNeg= [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
		sprites[direction].custom.closeNeg= [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	}

	var gateWidth = 30;

	function Gate(options) {

		//make sure options exists
		options= options || {};

		this.entityType = 'gate';

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];

		this.center= [this.xy[0] + this.size[0]/2, this.xy[1] + this.size[1]/2];

		this.direction= options.direction || 'vert';
		this.open= options.open || false;

		this.saveState= false;

		this.level= options.level || global.currentLevel;

		//animation code
		this.sprite= options.sprite || sprites[this.direction];

/*
		this.sprite.custom.openPos= [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
		this.sprite.custom.closePos= [19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
		this.sprite.custom.openNeg= [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
		this.sprite.custom.closeNeg= [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
*/

		this.animation= new global.SpriteAnimation(this.sprite, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			//frameRate: 45,
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		//set openness on load
		if (this.open) {
			this.animation.setFrame(19);
		}
		else {
			this.animation.setFrame(10)
		}

		this.sound= new global.AudioGroup('gate_0', 'gate_1', 'gate_2', 'gate_3', 'gate_4');

	}

	Gate.prototype.draw= function(dt) {

		this.animation.update(dt);
		this.animation.draw();

	}

	Gate.prototype.bounce= function(ball) {

		//center the ball on the obstacle
		ball.xy[0]= this.xy[0] + this.size[0] / 2;
		ball.xy[1]= this.xy[1] + this.size[1] / 2;

		if (!this.open) {
			
			if (this.direction == 'hor') {

				if (ball.v[1] > 0) {
					this.openGate(1)
				}
				else if (ball.v[1] < 0) {
					this.openGate(-1);
				}

				ball.v[1] = -ball.v[1];

			}
			else if (this.direction == 'vert') {

				if (ball.v[0] > 0) {
					this.openGate(1);
				}
				else if (ball.v[0] < 0) {
					this.openGate(-1);
				}

				ball.v[0]= -ball.v[0];
			}
			else if (this.direction == 'back') {

				if (ball.v[0] > 0 || ball.v[1] < 0) {
					this.openGate(1);
				}
				else if (ball.v[0] < 0 || ball.v[1] > 0) {
					this.openGate(-1);
				}

				ball.v= [ball.v[1], ball.v[0]];
			}
			else if (this.direction == 'for') {

				if (ball.v[0] > 0 || ball.v[1] > 0) {
					this.openGate(1);
				}
				else if (ball.v[0] < 0 || ball.v[1] < 0) {
					this.openGate(-1);
				}

				ball.v= [-ball.v[1], -ball.v[0]];
			}
		}
	}

	Gate.prototype.openGate= function(direction) {

		direction = direction || 1;

		//prevent event listener from piling up
		this.animation.removeFrameEvent(10, this.onGateClosed);

		this.animation.speed = direction;
		this.animation.unpause()

		this.open= direction;
		this.sound.play();
	}

	Gate.prototype.onGateClosed = function() { 
		this.animation.setFrame(10);
		this.animation.stop();
	}

	Gate.prototype.closeGate= function() {

		if (this.animation.frameIndex != 10) {

			//gate is closed on frame 10 of animation
			this.animation.addFrameEvent(10, this.onGateClosed, this);

			this.animation.speed = this.open * -2;
			this.animation.unpause();
		}
		//gate animation was already in closed state
		else this.animation.stop();
		

		this.open= false;
		this.sound.play();
	}

	Gate.prototype.save= function() {

		this.saveState= this.open;
	}

	Gate.prototype.revert= function() {

		if (!this.saveState != !this.open) {
			this.onClick(this.center);
		}
	}

	Gate.prototype.onClick= function(click) {

		if (!click) {
			click= this.center;
		}
		
		if ( this.contains(click) ) {

			this.activate();

			this.updateLevelData();

			//register action with undo buffer
			this.level.undoManager.registerAction(this.gridPos.slice(), this.entityType);
			
			return true;

		} else return false;

		
	}

	Gate.prototype.contains = function(point) {

		switch (this.direction) {

			case 'hor':
				return global.distanceToHorizontalLine(this.center[1], point) < gateWidth;
				break;

			case 'vert':
				return global.distanceToVerticalLine(this.center[0], point) < gateWidth;
				break;

			case 'back':
				return global.distanceToNegativeDiagonal(this.center, point) < gateWidth;
				break;

			case 'for':
				return global.distanceToPositiveDiagonal(this.center, point) < gateWidth;
				break;

		}
	}

	Gate.prototype.activate = function() {


		if (!this.open) {
			
			this.openGate();
		}

		else {
			
			this.closeGate();
		}
	}

	Gate.prototype.undo = function() {

		this.activate();

		this.updateLevelData();
	}

	Gate.prototype.updateLevelData = function() {
		
		this.level.updateLevelData(this, this.open);
	}

	global.Gate= Gate;

}