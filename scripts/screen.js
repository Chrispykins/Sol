//Screen class to control graphics rendering
function run_screen(global) {
	
	var canvas= global.canvas;
	var context= global.context;

	function Screen(name, layers, background) {

		this.name= name || '';
		this.layers= layers || [];

		this.background= background || '#f6f6e7';

	}

	Screen.prototype.draw= function(dt) {

		context.fillStyle= this.background;
		context.fillRect(0, 0, global.gameDimensions[0] * global.canvas.scale, global.gameDimensions[1] * global.canvas.scale);

		for (var i= 0, l= this.layers.length; i < l; i++) {

			this.layers[i].draw(dt);
			
		}
	}

	global.Screen= Screen;


}
