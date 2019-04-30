//Button class
function run_button(global) {
	
	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	var images= {
		on: global.images.button_on,
		off: global.images.button_off,
		0: global.images.button_0,
		1: global.images.button_1,
		2: global.images.button_2,
		3: global.images.button_3,
		5: global.images.button_5,
		6: global.images.button_6,
		7: global.images.button_7,
		8: global.images.button_8,
	}

	function Button(options) {

		//make sure options exists
		options= options || {};

		this.entityType = "button";

		this.xy= options.xy || [0, 0];
		this.size= options.size || [0, 0];
		this.gridPos= options.gridPos || [0, 0];

		this.center= [this.xy[0] + this.size[0]/2, this.xy[1] + this.size[1]/2];

		this.sound= options.sound;

		this.level= options.level || global.currentLevel;

		this.directions= options.directions || [];

		this.currentImage= images.off;

		this.sound= new global.AudioGroup('button_0', 'button_1');

		this.sound.volume= 0.3;
	}

	Button.prototype.draw= function() {

		for (var i= 0, l= this.directions.length; i < l; i++) {
			viewport.drawImage(images[ this.directions[i] ], this.xy[0], this.xy[1], this.size[0], this.size[1]);
		}

		viewport.drawImage(this.currentImage, this.xy[0], this.xy[1], this.size[0], this.size[1]);

		
	}

	Button.prototype.findAdjacent= function() {

		var grid= this.level.grid;

		if (this.gridPos[1] > 0) {

			//top-left
			if (this.gridPos[0] > 0) {
				this[0]= grid[ this.gridPos[1] - 1 ][ this.gridPos[0] - 1 ];
			}

			//top
			this[1]= grid[ this.gridPos[1] - 1 ][ this.gridPos[0] ];

			//top-right
			if (this.gridPos[0] < this.level.gridSize[0] - 1) {
				this[2]= grid[ this.gridPos[1] - 1 ][ this.gridPos[0] + 1 ];
			}

		}

		//right
		if (this.gridPos[0] > 0) {
			this[3]= grid[ this.gridPos[1] ][ this.gridPos[0] - 1 ];
		}

		//left
		if (this.gridPos[0] < this.level.gridSize[0] - 1) {
			this[5]= grid[ this.gridPos[1] ][ this.gridPos[0] + 1 ];
		} 

		if (this.gridPos[1] < this.level.gridSize[1] - 1) {

			//bottom-left
			if (this.gridPos[0] > 0) {
				this[6]= grid[ this.gridPos[1] + 1 ][ this.gridPos[0] - 1 ];
			}

			//bottom
			this[7]= grid[ this.gridPos[1] + 1 ][ this.gridPos[0] ];

			//bottom-right
			if (this.gridPos[0] < this.level.gridSize[0] - 1) {
				this[8]= grid[ this.gridPos[1] + 1 ][ this.gridPos[0] + 1 ];
			}
		}
	}

	Button.prototype.activate= function() {
	
		var notes= [];
		
		for (var i= 0, l= this.directions.length; i < l; i++) {

			var currentCell= this[ this.directions[i] ];

			if (currentCell) {

				for (var j= 0, k= currentCell.length; j < k; j++) {

					if (currentCell[j] instanceof global.Note || currentCell[j] instanceof global.TwoTone) {
						notes = notes.concat( currentCell[j].activate() );
					}
					else if (currentCell[j] instanceof global.Button) {
						notes = notes.concat( currentCell[j].activate() );
					}
					else {
						currentCell[j].activate();
					}
				}
			}
		}

		//play sound
		this.sound.play();

		//change image to pressed button
		this.currentImage= images.on;

		//change image back to normal
		setTimeout(function() { this.currentImage= images.off }.bind(this), 1000/this.level.bps);

		return notes;
	}

	Button.prototype.undo = function() {

		for (var i= 0, l= this.directions.length; i < l; i++) {

			var currentCell= this[ this.directions[i] ];

			if (currentCell) {

				for (var j= 0, k= currentCell.length; j < k; j++) {

					currentCell[j].undo();
				}
			}
		}
	}

	Button.prototype.revert= function() {
		//empty function
	}

	Button.prototype.save= function() {
		//empty function
	}


	Button.prototype.onClick= function(click) {

		if (!click) {
			click = this.center;
		}

		if ( this.contains(click) ) {

			var notes = this.activate();

			for (let i= 0, l= notes.length; i < l; i++) {
					
				//adjust volume for multiple notes
				var volume= Math.min( 1, 0.25 + 1/l);
				global.audioManager.play(notes[i], volume);
			}

			//register action with undo buffer
			this.level.undoManager.registerAction(this.gridPos.slice(), this.entityType);
			
		} else return false;

		return true;
	}

	Button.prototype.contains = function(point) {

		if (point[0] < this.center[0] - this.size[0]/4) return false;
		if (point[0] > this.center[0] + this.size[0]/4) return false;
		if (point[1] < this.center[1] - this.size[1]/4) return false;
		if (point[1] > this.center[1] + this.size[1]/4) return false;

		return true;
	}

	global.Button= Button;

}