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

		x = x * devicePixelRatio / canvas.scale;
		y = y * devicePixelRatio / canvas.scale;

		global.mouse = [x, y];
		if (isLeftClick(event))	global.mouseDown = true;

/*
		if (!global.mouseDown && isLeftClick(event)) global.mouseDown = true;
		else if (global.mouseDown && !isLeftClick(event)) global.mouseDown = false;
*/
		//console.log(event.type + ": " + global.mouseDown, global.mouse.toString());

		if (global.currentScreen) {

			for (var i = global.currentScreen.layers.length - 1; i >= 0; i--) {

				if (global.currentScreen.layers[i].onMouseMove) {
					if (global.currentScreen.layers[i].onMouseMove(global.mouse)) return;
				}
			}
		}

		return global.mouse;

	}

	function onClick(event) {

		//hack for web audio
		if (global.audioContext) global.audioContext.resume();

		//console.log("--------------------\n" + event.type + "\n---------------------");
		if (isLeftClick(event)) global.mouseDown = true;
		var click = onMouseMove(event);

		for (var i= global.currentScreen.layers.length - 1; i >= 0; i--) {

			if (global.currentScreen.layers[i].onClick(click)) {
				return;
			}
		}

	}

	function onRelease(event) {

		//console.log("---------------------\n" + event.type + "\n---------------------");
		if (isLeftClick(event) || event.type == 'touchend') global.mouseDown = false;
		var click = global.mouse//onMouseMove(event);


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

		//ctrl+y -- redo
		if (event.which == 89 && event.ctrlKey) {
			global.currentLevel.undoManager.redo();
		}
	}

	function isLeftClick(event) {

		var button = event.which || event.button;

		return button == 1 || event.type == 'touchstart';
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

	function enableMouseEvents() {/*
		canvas.addEventListener('mousedown', onClick);
		canvas.addEventListener('mouseup', onRelease);

		console.log('disabling touch');

		canvas.removeEventListener('touchstart', onClick);
		canvas.removeEventListener('touchend', onRelease);

		removeEventListener('mousemove', enableMouseEvents);
	*/}

	canvas.addEventListener('mousedown', onClick);
	canvas.addEventListener('mouseup', onRelease);

	canvas.addEventListener('touchstart', function(event) { event.preventDefault(); onClick(event); });
	canvas.addEventListener('touchend',   function(event) { event.preventDefault(); onRelease(event); });

	addEventListener('touchmove', onMouseMove);
	addEventListener('mousemove', onMouseMove);

	//addEventListener('mousemove', enableMouseEvents);
	addEventListener('keydown', onKey);
	addEventListener('backbutton', onBackButton);

}