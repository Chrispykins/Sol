//////////////////////////////////////
// Viewport class
//////////////////////////////////////
function globalviewport(global) {

	function Viewport(options) {

		//make sure options exists
		options= options || {};

		this.xy= options.xy || [0, 0];
		this.canvasPos= options.canvasPos || [0, 0];
		this.size= options.size || [1920, 1080];
		this.scale= options.scale || 1;
		this.canvas= options.canvas || global.canvas;
		this.context= options.context || global.context;

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		// *Viewport.xy gives the xy-coordinates of the viewport according to the game world
		// *Viewport.size gives the relative size of the viewport to the canvas (similar to canvas.gameDimensions)
		// *Viewport.size / Viewport.scale gives the size of the viewport in the gameworld
		// *In general, dividing by the scale converts to game-space, multiplying by the scale converts to viewport-space
		///////////////////////////////////////////////////////////////////////////////////////////////////////////
	}

	/////////////////////////////////////////////////
	// Drawing functionality
	/////////////////////////////////////////////////

	Viewport.prototype.drawSingleImage= function(image, x, y, width, height) {

		var scale= this.scale * this.canvas.scale;

		var viewX= (x - this.xy[0]) * this.scale;
		var viewY= (y - this.xy[1]) * this.scale;

		var canvasX= (viewX + this.canvasPos[0]) * this.canvas.scale;
		var canvasY= (viewY + this.canvasPos[0]) * this.canvas.scale;

		this.context.drawImage(image, canvasX, canvasY, width * scale, height * scale);
	}

	Viewport.prototype.drawImageFromSheet= function(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight) {

		var scale= this.scale * this.canvas.scale;

		var viewX= (destX - this.xy[0]) * this.scale;
		var viewY= (destY - this.xy[1]) * this.scale;

		var canvasX= (viewX + this.canvasPos[0]) * this.canvas.scale;
		var canvasY= (viewY + this.canvasPos[0]) * this.canvas.scale;

		this.context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, canvasX, canvasY, destWidth * scale, destHeight * scale);
	}


	//control flow function
	Viewport.prototype.drawImage= function(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight) {

		if (arguments.length == 3) {
			this.drawSingleImage(image, sourceX, sourceY, image.width, image.height);
		}
		else if (arguments.length === 5) {
			this.drawSingleImage(image, sourceX, sourceY, sourceWidth, sourceHeight);
		}
		else if (arguments.length === 9) {
			this.drawImageFromSheet(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
		}
		else {
			console.error('Incorrect number of arguments given on viewport.drawImage')
		}
	}

	/////////////////////////////////////////////////////////

	Viewport.prototype.focus= function(gameObject) {

		var objectRatio= gameObject.size[0] / gameObject.size[1];
		var viewportRatio= this.size[0] / this.size[1];
		var padding= 0;

		//initialize the viewport corner to coincide with the objects corner
		this.xy= [ gameObject.xy[0], gameObject.xy[1] ];

		if (viewportRatio > objectRatio) { 	//viewport is wider than object

			this.scale= this.size[1] / gameObject.size[1];
			padding= (this.size[0] / this.scale) - gameObject.size[0];

			//console.log(padding)

			this.xy[0]= this.xy[0] - (padding/2);

		}
		else { //viewport is taller than object

			this.scale= this.size[0] / gameObject.size[0];
			padding= (this.size[1] / this.scale) - gameObject.size[1];

			//console.log(padding)

			this.xy[1]= this.xy[1] - (padding/2);

		}

		gameObject.scale= this.scale;
	}

	//////////////////////////////////////////////////////////////

	Viewport.prototype.zoom= function(factor) {

		var width= this.size[0] / this.scale;
		var height= this.size[1] / this.scale;

		var dx= width - (width / factor);
		var dy= height - (height /factor);

		//console.log('dx:', dx, 'dy:', dy);
		
		this.xy[0]+= dx/2;
		this.xy[1]+= dy/2;

		this.scale*= factor;


	}

	/////////////////////////////////////////////////////////////

	//create viewport instance
	global.viewport= new Viewport();


}