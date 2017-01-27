//input handlers
(function (global) {
	
	var canvas= global.canvas;

	function onClick(event) {

		var click= [0, 0];
		var x, y;

		//test if event was sent from a touch screen
		if (event.touches) {
			x= event.touches[0].pageX || event.touches[0].clientX;
			y= event.touches[0].pageY || event.touches[0].clientY;
		}
		else {
			x= event.pageX || event.clientX;
			y= event.pageY || event.clientY;
		}

		var click= [x, y];
		var offset= canvas.getBoundingClientRect();


		click[0]= click[0] - offset.left;
		click[1]= click[1] - offset.top;

		click[0]= click[0] / canvas.scale;
		click[1]= click[1] / canvas.scale;

		for (var i= global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (global.currentScreen.layers[i].onClick(click)) {
				return;
			}
		}

	}

	function onKey(event) {

		if (event.which== 32) {
			global.currentLevel.launch();
		}
	}

	function onBackButton(event) {
		
		if (global.currentLevel) {
			global.currentLevel.onBackButton();
		}
		else {
			Cocoon.app.exit();
		}
	}

	canvas.addEventListener('mousedown', onClick);
	canvas.addEventListener('touchstart', onClick);
	window.addEventListener('keydown', onKey);
	window.addEventListener('backbutton', onBackButton);

})(Sol);