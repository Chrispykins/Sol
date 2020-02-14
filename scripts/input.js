//input handlers
function run_input(global) {
	
	var canvas= global.canvas;

	global.mouse = [0, 0];
	global.mouseDown = false;

	function onMouseMove(event) {

		var x, y;

		//test if event was sent from a touch screen
		if (event.touches && event.touches.length) {
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

		if (!global.mouseDown && isLeftClick(event)) global.mouseDown = true;
		else if (global.mouseDown && !isLeftClick(event)) global.mouseDown = false;

		for (var i = global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (global.currentScreen.layers[i].onMouseMove) {
				if (global.currentScreen.layers[i].onMouseMove(global.mouse)) return;
			}
		}

		return global.mouse;

	}

	function onClick(event) {

		var click = onMouseMove(event);

		//console.log('mouse down')

		for (var i= global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (global.currentScreen.layers[i].onClick(click)) {
				return;
			}
		}

	}

	function onRelease(event) {

		var click = onMouseMove(event);

		//console.log('mouse up')

		for (var i = global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (!global.currentScreen.layers[i].onRelease) continue;

			if (global.currentScreen.layers[i].onRelease(click)) {
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

	function isLeftClick(event) {

		var button = event.which || event.button;

		return button == 1;
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

	function enableMouseEvents() {
		canvas.addEventListener('mousedown', onClick);
		canvas.addEventListener('mouseup', onRelease);

		console.log('disabling touch');

		canvas.removeEventListener('touchstart', onClick);
		canvas.removeEventListener('touchend', onRelease);
		removeEventListener('mousemove', enableMouseEvents);
	}

	//we're going to assume the user has no mouse, but if they do, force them to use it
	canvas.addEventListener('touchstart', onClick);
	canvas.addEventListener('touchend', onRelease);
	addEventListener('mousemove', onMouseMove);
	addEventListener('mousemove', enableMouseEvents);
	addEventListener('keydown', onKey);
	addEventListener('backbutton', onBackButton);

}