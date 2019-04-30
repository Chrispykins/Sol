//////////////////////////////////////
// toolbar class
//////////////////////////////////////
function run_toolbar(global) {

	canvas= global.canvas;
	context= global.context;

	function Toolbar(options) {

		//make sure options exists
		options= options || {};

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.color= options.color || '#f0f0f0';

		////////////////////////////////////////////////
		// replay button to play solution for player
		////////////////////////////////////////////////

		//create sprite for animation
		var sheet= new global.SpriteSheet(global.images.replaySheet);
		sheet.createEvenFrames(320, 320);

		//define gui object
		this.replayButton= new global.Gui({
			xy: [this.xy[0] + 75, this.xy[1] + 25],
			size: [150, 150],
			//sound: global.sounds._do,
			image: global.images.replay
		});

		//define sprite animation for gui object
		this.replayButton.animation= new global.SpriteAnimation(sheet, {
			X: this.replayButton.xy[0],
			Y: this.replayButton.xy[1],
			width: this.replayButton.size[0],
			height: this.replayButton.size[1],
			canvas: canvas,
			context: context
		});

		//define action on click event
		this.replayButton.onClick= function() {
			
			if (global.currentLevel) {

				var level= global.currentLevel;
				
				if (level.musicBox) {
					clearInterval(level.musicBox);
				}

				if (level.playing) {
					
					level.perform("revert");

					level.balls.length= 0;
					level.playing= false;
					level.playerSolution.length= 0;
				}
				


				global.currentLevel.playSolution();
				this.replayButton.animation.start();
			}

		}.bind(this);


		///////////////////////////////////////////////////////////
		// cancel button to stop the balls and reset the solution
		///////////////////////////////////////////////////////////

		//create sprite sheet for animation
		sheet= new global.SpriteSheet(global.images.cancelSheet);
		sheet.createEvenFrames(320, 320);

		//define gui object for cancel button
		this.cancelButton= new global.Gui({
			xy: [this.xy[0] + this.size[0] - 200, this.xy[1] + this.size[1] - 175],
			size: [150, 150],
			//sound: global.sounds._do,
			image: global.images.cancel
		});

		//define animation of gui object
		this.cancelButton.animation= new global.SpriteAnimation(sheet, {
			X: this.cancelButton.xy[0],
			Y: this.cancelButton.xy[1],
			width: this.cancelButton.size[0],
			height: this.cancelButton.size[1],
			canvas: canvas,
			context: context
		})

		//define click behavior for button
		this.cancelButton.onClick= function() {

			var level= global.currentLevel;

			this.cancelButton.animation.start();
			
			if (level.musicBox) {
				clearInterval(level.musicBox);
			}

			if (level.playing) {
				
				level.perform("revert");

				level.balls.length= 0;
				level.playing= false;
				level.playerSolution.length= 0;
			}

		}.bind(this);
	}

	Toolbar.prototype.draw= function(dt) {

		this.replayButton.draw(dt);
		this.cancelButton.draw(dt);
	}

	Toolbar.prototype.onClick= function(click) {

		if (this.replayButton.bounds.contains(click)) {
			this.replayButton.onClick();
		}

		if (this.cancelButton.bounds.contains(click)) {
			this.cancelButton.onClick();
		}
	}

	global.Toolbar = Toolbar;

	//create toolbar instance
	//global.toolbar= new Toolbar({xy: [0, 880], size: [1920, height]});

}