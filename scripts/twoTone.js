//note class
function run_twoTone(global) {

	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	//the spriteSheets for TwoTones are defined in note.js

	function TwoTone(options) {

		//make sure options exists
		options= options || {};

		this.entityType = 'twoTone';

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
		this.base_0= options.base_0 || global.images[this.solfege_0+'Base'];

		this.sprite_0= options.sprite_0 || global.sprites[this.solfege_0];

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
		this.base_1= options.base_1 || global.images[this.solfege_1+'Base'];

		this.sprite_1= options.sprite_1 || global.sprites[this.solfege_1]

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
	}

	TwoTone.prototype.draw= function(dt) {

		viewport.drawImage(this["base_"+this.outer], this.xy[0], this.xy[1], this.size[0], this.size[1]);

		//update and draw current tone
		this["animation_"+this.outer].update(dt);
		this["animation_"+this.outer].draw();

		//update and draw the other tone
		this["animation_"+this.inner].update(dt);
		this["animation_"+this.inner].draw();
	}

	TwoTone.prototype.activate= function() {

		//swaps the inner and outer notes
		this.swap();

		//return inner instead of outer because of swap
		return this["solfege_" + this.inner];
	}

	TwoTone.prototype.undo = function() {
		this.swap();
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

		//the audio for clicking has been separated from the audio from the ball
		var solfege = this['solfege_'+this.outer];
		global.audioManager.play(solfege);

		this.activate();

		this.updateLevelData();

		//register action with undo buffer
		this.level.undoManager.registerAction(this.gridPos.slice(), this.entityType);
	}

	TwoTone.prototype.updateLevelData = function() {

		var inner = this["solfege_"+this.inner];
		var outer = this["solfege_"+this.outer];

		this.level.updateLevelData(this, [outer, inner])
	}

	global.TwoTone= TwoTone;


}