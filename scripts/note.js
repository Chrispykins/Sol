//note class
(function(global) {

	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	function Note(options) {

		if (!options) {
			options= {};
		}

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];

		this.solfege= options.solfege || '_do';
		this.sound= options.sound || global.sounds[this.solfege];
		this.level= options.level || global.currentLevel;

		this.base= options.base || global.images[this.solfege+'Base'];

		this.sprite= options.sprite || new global.SpriteSheet(global.images[this.solfege]);
		this.sprite.createEvenFrames(320, 320);

		this.animation= new global.SpriteAnimation(this.sprite, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		this.animation.frameRate= 120;
		this.animation.name= this.solfege;

		this.viewport= viewport;
	}

	Note.prototype.draw= function(dt) {

		this.viewport.drawImage(this.base, this.xy[0], this.xy[1], this.size[0], this.size[1]);

		this.animation.update(dt);
		this.animation.draw();
	}

	Note.prototype.play= function() {

		this.sound.cloneNode().play();

		//play reverse animation when this animation ends
		this.animation.onEnd= function() {

			this.animation.speed= -1;
			this.animation.startTime= global.Date.now();

			//return to normal after the reverse animation
			this.animation.onEnd= function() {

				this.animation.speed= 1;

			}.bind(this);

		}.bind(this);

		if (this.animation.speed < 1) {
			this.animation.speed= 1;
		}
		else {
			this.animation.start();
		}

		return this.solfege;

	}

	Note.prototype.save= function() {
		//empty function to prevent crashing
	}

	Note.prototype.revert= function() {
		//empty function to prevent crashing
	}

	Note.prototype.onClick= function() {

		this.play();
	}

	global.Note= Note;

})(Sol);