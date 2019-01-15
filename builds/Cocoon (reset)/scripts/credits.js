//credits class
function globalcredits(global) {

	var canvas= global.canvas;
	var context= global.context;

	function Credits(options) {

		//make sure options exists
		options= options || {};

		this.baseFont= options.baseFont || 125;
		this.lineDistance= options.lineDistance || 200;

		this.xy= options.xy || [960, 1080 + this.lineDistance];
		this.v = options.v || [0, -175];

		this.lines= options.lines || []

		
	}

	Credits.prototype.update= function(dt) {

		this.xy[0]+= this.v[0] * dt;
		this.xy[1]+= this.v[1] * dt;

		if (this.xy[1] + ((this.lines.length - 1) * this.lineDistance) < -this.lineDistance * 4) {

			if (global.currentLevel && global.currentLevel.playerSolution.length % 12 == 9) {

				global.currentLevel.playing= false;
				global.currentLevel.balls= [];
				global.currentLevel.onWin();

				global.credits= null;
			}
		}
	}

	Credits.prototype.draw= function() {

		context.textAlign= 'center';
		context.fillStyle= '#335168';

		for (var i= 0, l= this.lines.length; i < l; i++) {

			var line= this.lines[i];
			line.xy= [this.xy[0], this.xy[1] + (this.lineDistance * i)];

			var fontSize= new String(parseInt(line.scale * this.baseFont * canvas.scale));
			context.font= fontSize + 'px Times';

			context.fillText(line.text, line.xy[0] * canvas.scale, line.xy[1] * canvas.scale);
		}

		context.fillSTyle= 'black';
	}

	Credits.prototype.onClick= function() {

	}

	global.Credits= Credits;

	
}