//gate class
(function(global) {
	
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

		this.sound= options.sound;
		this.level= options.level || global.currentLevel;

		
		//animation code
		this.sprite= options.sprite || sprites[this.direction];

		this.sprite.custom.openPos= [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
		this.sprite.custom.closePos= [19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
		this.sprite.custom.openNeg= [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
		this.sprite.custom.closeNeg= [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		this.animation= new global.SpriteAnimation(this.sprite, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		this.animation.frameIndex= 10;
		this.animation.currentFrame= this.animation.spriteSheet.frames[10];

		if (this.open) this.animation.start("open"+ this.open);

		this.sound= new global.AudioGroup(global.sounds.gate_0, global.sounds.gate_1, global.sounds.gate_2, global.sounds.gate_3);

	}

	Gate.prototype.draw= function(dt) {

		this.animation.update(dt);
		this.animation.draw();

	}

	Gate.prototype.bounce= function(ball) {

		//center the ball on the obstacle
		ball.xy[0]= this.xy[0] + (this.size[0] - ball.size[0]) / 2;
		ball.xy[1]= this.xy[1] + (this.size[1] - ball.size[1]) / 2;

		if (!this.open) {
			
			if (this.direction == 'hor') {

				if (ball.v[1] > 0) {
					this.openGate('Pos')
				}
				else if (ball.v[1] < 0) {
					this.openGate('Neg');
				}

				ball.v[1] = -ball.v[1];

			}
			else if (this.direction == 'vert') {

				if (ball.v[0] > 0) {
					this.openGate('Pos');
				}
				else if (ball.v[0] < 0) {
					this.openGate('Neg');
				}

				ball.v[0]= -ball.v[0];
			}
			else if (this.direction == 'back') {

				if (ball.v[0] > 0 || ball.v[1] < 0) {
					this.openGate('Pos');
				}
				else if (ball.v[0] < 0 || ball.v[1] > 0) {
					this.openGate('Neg');
				}

				ball.v= [ball.v[1], ball.v[0]];
			}
			else if (this.direction == 'for') {

				if (ball.v[0] > 0 || ball.v[1] > 0) {
					this.openGate('Pos');
				}
				else if (ball.v[0] < 0 || ball.v[1] < 0) {
					this.openGate('Neg');
				}

				ball.v= [-ball.v[1], -ball.v[0]];
			}
		}
	}

	Gate.prototype.openGate= function(direction) {

		this.animation.start('open' + direction);
		this.open= direction;

		this.sound.play();
	}

	Gate.prototype.closeGate= function() {

		this.animation.start('close' + this.open);
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
		
		if ( global.Math.distance(click, this.center) < this.size[0]/3 ) {

			this.activate();

			this.updateLevelData();

			//register action with undo buffer
			this.level.undoManager.registerAction(this.gridPos.slice(), this.entityType);
			
			return true;

		} else return false;

		
	}

	Gate.prototype.activate = function() {

		if (!this.open) {
			
			this.openGate("Pos");
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

})(Sol);