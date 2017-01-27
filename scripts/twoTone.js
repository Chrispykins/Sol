//note class
(function(global) {

	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	function TwoTone(options) {

		if (!options) {
			options= {};
		}

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];
		this.level= options.level || global.currentLevel;

		//properties to control the current tone
		this.outer= 0;
		this.inner= 1;

		this.saveState= 0;
		
	 	//defining first tone sound and animation
		this.solfege_0= options.solfege[0] || '_do';
		this.sound_0= options.sound_0 || new global.AudioGroup(global.sounds[this.solfege_0]);
		this.base_0= options.base_0 || global.images[this.solfege_0+'Base'];

		this.sprite_0= options.sprite_0 || new global.SpriteSheet(global.images[this.solfege_0]);
		this.sprite_0.createEvenFrames(320, 320);

		this.animation_0= new global.SpriteAnimation(this.sprite_0, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		this.animation_0.speed= 0;
		this.animation_0.start();
		this.animation_0.frameRate= 120;

		
		//defining second tone sound and animation
		this.solfege_1= options.solfege[1] || '_do';
		this.sound_1= options.sound_1 || new global.AudioGroup(global.sounds[this.solfege_1]);
		this.base_1= options.base_1 || global.images[this.solfege_1+'Base'];

		this.sprite_1= options.sprite_1 || new global.SpriteSheet(global.images[this.solfege_1]);
		this.sprite_1.createEvenFrames(320, 320);

		this.animation_1= new global.SpriteAnimation(this.sprite_1, {
			X: this.xy[0],
			Y: this.xy[1],
			width: this.size[0],
			height: this.size[1],
			canvas: canvas,
			context: context,
			viewport: viewport
		});

		this.animation_1.frameRate= 120;

		this.animation_1.onEnd= function () {
			this.animation_1.speed= 0;
		}.bind(this);

		this.animation_1.start();

		this.viewport= viewport;
	}

	TwoTone.prototype.draw= function(dt) {

		this.viewport.drawImage(this["base_"+this.outer], this.xy[0], this.xy[1], this.size[0], this.size[1]);

		//update and draw current tone
		this["animation_"+this.outer].update(dt);
		this["animation_"+this.outer].draw();

		//update and draw the other tone
		this["animation_"+this.inner].update(dt);
		this["animation_"+this.inner].draw();
	}

	TwoTone.prototype.play= function() {

		this["sound_"+this.outer].play();

		//swaps the inner and outer notes
		this.swap();

		//return inner instead of outer because of swap
		return this["solfege_" + this.inner];
	}

	//swaps the inner and outer notes, and starts the animations
	TwoTone.prototype.swap= function() {

		var outer= this[ "animation_"+this.outer ];
		var inner= this[ "animation_"+this.inner ];

		outer.onEnd= function() {

			//when outer animation ends, unpause the inner animation
			inner.speed= -1;
			inner.unpause();

			//stop the outer animation when it becomes the inner
			outer.speed= 0;

			inner.onEnd= function() {

				//stop the inner animation when it becomes the outer
				inner.speed= 0;

			}.bind(this);

		}.bind(this);

		//animation is always "playing", so unpause it
		outer.speed= 1;
		outer.unpause();

		this.outer= this.inner;
		this.inner++
		this.inner= this.inner%2;
	}

	TwoTone.prototype.save= function() {

		this.saveState= this.outer;
	}

	TwoTone.prototype.revert= function() {

		if (this.saveState != this.outer) {
			this.swap();
		}
	}

	TwoTone.prototype.onClick= function() {

		this.play();
	}

	global.TwoTone= TwoTone;


})(Sol);