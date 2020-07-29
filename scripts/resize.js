function run_resize(global) {

	//gameDimensions variable should be changed to the original dimensions of the game in pixels before scaling
	var gameDimensions= [1920, 1080];
	global.gameDimensions= gameDimensions;


	//resize function occurs whenever the window is resized
	HTMLCanvasElement.prototype.resize= function() {
	
		var gameRatio= gameDimensions[0]/gameDimensions[1];

		var screenHeight= window.innerHeight;
		var screenWidth= window.innerWidth;

		var screenRatio= screenWidth/screenHeight;

		var wrapper= this.parentNode;

		if (screenRatio > gameRatio) {
		
			//screen is wider than game
			this.height = Math.floor(screenHeight * devicePixelRatio);
			this.width = Math.floor(screenHeight * devicePixelRatio * gameRatio);

			this.style.height = screenHeight;
			this.style.width = screenHeight * gameRatio;

			wrapper.style.paddingLeft= (screenWidth - this.width)/2 +"px";
			wrapper.style.paddingright= (screenWidth - this.width)/2 +"px";
					
			wrapper.style.paddingTop= "0px";
			wrapper.style.paddingBottom= "0px";

			this.scale= screenHeight * devicePixelRatio / gameDimensions[1];
		}
		else {
			//screen is taller than game
			this.width = Math.floor(screenWidth * devicePixelRatio);
			this.height = Math.floor(screenWidth * devicePixelRatio / gameRatio);

			this.style.width = screenWidth;
			this.style.height = screenWidth / gameRatio;

			wrapper.style.paddingTop= (screenHeight - this.height)/2 +"px";
			wrapper.style.paddingBottom= (screenHeight - this.height)/2 +"px";

			wrapper.style.paddingLeft= "0px";
			wrapper.style.paddingright= "0px";

			this.scale= screenWidth * devicePixelRatio / gameDimensions[0];
			
		}

	}

	addEventListener('resize', function() {global.canvas.resize()} );

}