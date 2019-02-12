//input handlers
(function (global) {
	
	var canvas= global.canvas;

	global.mouse = [0, 0];

	function onMouseMove(event) {

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

		var offset= canvas.getBoundingClientRect();

		x = x - offset.left;
		y = y - offset.top;

		x = x / canvas.scale;
		y = y / canvas.scale;

		global.mouse = [x, y];

		for (var i = global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (global.currentScreen.layers[i].onMouseMove) {
				if (global.currentScreen.layers[i].onMouseMove(global.mouse)) return;
			}
		}

		return global.mouse;

	}

	function onClick(event) {

		var click = onMouseMove(event);

		for (var i= global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (global.currentScreen.layers[i].onClick(click)) {
				return;
			}
		}

	}

	function onKey(event) {

		//alert(event.which);

		//space bar
		if (event.which == 32) {
			global.currentLevel.launch();
		}

		//backspace or delete or esc
		if (event.which == 8 || event.which == 46 || event.which == 27) {
			onBackButton(event);
		}

		//ctrl+z -- undo
		if (event.which == 90 && event.ctrlKey) {
			global.currentLevel.undoManager.undo();
		}
	}

	function onBackButton(event) {
		console.log('back')
		
		if (global.currentLevel) {
			
			global.currentLevel.onBackButton();
		}
		else {
			Cocoon.app.exit();
		}
	}

	canvas.addEventListener('mousedown', onClick);
	canvas.addEventListener('touchstart', onClick);
	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('keydown', onKey);
	window.addEventListener('backbutton', onBackButton);

})(Sol);