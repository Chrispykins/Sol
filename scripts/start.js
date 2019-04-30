//start class
function run_start(global) {

	var viewport= global.viewport;

	var ballSize = 65;

	function Start(options) {

		//make sure options exists
		options= options || {};

		this.entityType = 'start';

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];

		this.center= [this.xy[0] + this.size[0]/2, this.xy[1] + this.size[1]/2];

		
		this.direction= options.direction || 'right';

		switch (this.direction) {
			case 'left':
				this.vector= [-1, 0];
				break;
			case 'right':
				this.vector= [1, 0];
				break;
			case 'up':
				this.vector= [0, -1];
				break;
			case 'down':
				this.vector= [0, 1];
				break;
			default:
				this.vector= [1, 0];
		}

		this.sound= options.sound;
		this.level= options.level || global.currentLevel;

		this.image= options.image || global.images['start'+this.direction];

	}

	Start.prototype.draw= function(dt) {

		viewport.drawImage(this.image, this.xy[0], this.xy[1], this.size[0], this.size[1]);
	}

	Start.prototype.launch= function() {
		
		var velocity= this.level.bps * this.level.cellSize;

		this.level.balls.push(new global.Ball({
			xy: [this.xy[0] + this.size[0]/2, this.xy[1] + this.size[1]/2],
			size: [ballSize , ballSize],
			v: [velocity * this.vector[0], velocity * this.vector[1]],
			level: this.level,

		}));

		if (this.level.musicBox) {
			clearInterval(this.level.musicBox);
		}

	}

	Start.prototype.save= function() {
		//empty function to prevent errors
	}

	Start.prototype.revert= function() {
		//empty function to prevent errors
	}

	Start.prototype.onClick= function(click) {

		if (!click) {
			return;
		}

		if ( global.Math.distance(click, this.center) < this.size[0]/3 ) {

			this.level.launch();
			return true;

		} else return false;

	}

	global.Start= Start;


}