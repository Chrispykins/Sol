//obstacle class
(function(global) {

	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	function Obstacle(options) {

		if (!options) {
			options= {};
		}

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];

		this.center= [this.xy[0] + this.size[0]/2, this.xy[1] + this.size[1]/2];

		this.enum= ['forward', 'hor', 'back', 'vert'];
		this.rotating= false;
		this.count= 0;

		this.direction= options.direction || 'forward';
		this.saveState= this.direction;

		this.sound= options.sound;
		this.level= options.level || global.currentLevel;

		this.sprite= options.sprite || new global.SpriteSheet(global.images.obstacleSheet);
		this.sprite.createEvenFrames(200, 200);

		this.sprite.custom.back= [0, 1, 2, 3, 4, 5, 6, 7];
		this.sprite.custom.vert= [8, 9, 10, 11, 12, 13, 14, 15];
		this.sprite.custom.forward= [16, 17, 18, 19, 20, 21, 22, 23];
		this.sprite.custom.hor= [24, 25, 26, 27, 28, 29, 30, 31]

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

		this.viewport= viewport;
	}

	Obstacle.prototype.draw= function(dt) {

		this.animation.update(dt);
		this.animation.draw();

		if (this.count > 0 && !this.rotating) {
			this.rotate();
		}
	}

	Obstacle.prototype.bounce= function(ball) {

		//center the ball on the obstacle
		ball.xy[0]= this.xy[0] + (this.size[0] - ball.size[0]) / 2;
		ball.xy[1]= this.xy[1] + (this.size[1] - ball.size[1]) / 2;

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
			}

		}.bind(this);


		this.animation.start();		
	}

	Obstacle.prototype.rotateBack= function() {

		//set flag to keep animation from starting over
		this.rotating= true;

		//function to change over to next animation in cycle
		this.animation.onEnd= function() {
		
			this.direction= this.enum[index];

			this.animation.changeAnimation(this.direction);

			this.count--;

			//check if multiple rotations must happen
			if (this.count > 0) {
				this.rotateBack();
			}
			else {
				this.rotating= false;
				this.count= 0;
				this.animation.speed= 1;
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
				
				this.count= 1
				this.rotateBack();
			}
			else if (distance < -2) {
				
				this.count= 1;
				this.rotate();
			}
			else {

				if (from < to) {
					
					this.count= distance;
					this.rotate();
				}
				else if (from > to) {
					
					this.count= -distance;
					this.rotateBack();
				}
			}
		}

		
	}

	Obstacle.prototype.onClick= function(click) {

		if (!click) {
			click= this.center;
		}

		if ( global.Math.distance(click, this.center) < this.size[0]/2.5 ) {

			//increment counter to track the number of clicks
			this.count++;
			return true;

		} else return false;


	}

	global.Obstacle= Obstacle;


})(Sol);