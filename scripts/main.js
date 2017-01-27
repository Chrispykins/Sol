////////////////////////////////////////////
// game starts here
////////////////////////////////////////////

(function (global) { //whatever is passed to the global parameter will be treated as the global scope of the game, no search will be required beyond this 'global' scope

	var canvas= global.canvas;
	var context= global.context;

	var images= global.images;
	var sounds= global.sounds;

	var toolbar= global.toolbar;
	var viewport= global.viewport;
	viewport.size= [1920, toolbar.xy[1]];

	function init() {

		//resize the canvas just in case
		canvas.resize();

		//remove loading images
		document.body.removeChild(document.getElementById('loading'));

		//lastTick and lastDraw will hold the time of the previous loop to calculate dt
		global.lastTick= global.Date.now();
		global.lastDraw= global.Date.now();

		splashScreen();
	}


	function splashScreen() {

		var splash= new global.Gui( {size: [1920, 1080], image: images.splashScreen} );

		splash.fade= new global.Fade('in', 1000);

		//begin fading the splash screen out after 3 seconds
		setTimeout(function() {
			
			if (splash) {
				
				splash.fade= new global.Fade('out', 2000);

				splash.fade.onEnd= function() {
					startGame();
					splash= null;
				}

			}

			

		}, 3000);

		//skip splash screen altogether if player clicks
		splash.onClick= function() {
			startGame();
			splash= null;
		}

		global.currentScreen= new global.Screen('splash', [splash]);

		//begin drawing loop
		global.draw();
	}

	function displayTutorial() {

		//define tutorial image
		var tutorial= new global.Gui({
			size: [1920, 1080],
			image: global.images.tutorial_1
		});

		//define click listener for tutorial gui
		tutorial.onClick= function() {
			
			global.currentScreen.layers.pop(); //remove image from screen

			//display next step in tutorial after 2 seconds				
			setTimeout(function() {
				
				var tutorial= new global.Gui({
					size: [1920, 1080],
					image: global.images.tutorial_2
				});

				tutorial.onClick= function(click) {
					
					if (global.toolbar.replayButton.bounds.contains(click)) {
						global.currentScreen.layers.pop();
					}

					return false;
				}

				global.currentScreen.layers.push(tutorial);

				return false;

			}, 2000);
		}

		//push first tutorial gui onto the current screen
		global.currentScreen.layers.push(tutorial);
	}

	
	function startGame() {

		var title= new global.Gui( {size: [1920, 1080], image: images.title} );

		
		//define fade in for title screen
		title.fade= new global.Fade('in', 1500);

		title.fade.onEnd= function () {

			title.onClick();

		}

		//skip fade if player clicks on screen
		title.onClick= function() {

			global.playing= true;

			//load "level 0"
			global.currentLevel= createLevel(global.levels[0]);

			//set last tick right before beginning update loop
			global.lastTick= global.Date.now();

			//begin update loop
			global.update();

			if (title.fade) {
				title.fade= null;
			}

			//destroy this click listener
			title.onClick= function() {};
		}

		global.currentScreen= new global.Screen('title', [title]);	

		//play title sound
		sounds.titleSound.play();

	}

	function createLevel(levelData) {

		levelData= JSON.parse(levelData);

		var newLevel= new global.Level(levelData);

		global.currentScreen.layers.unshift(newLevel);

		return newLevel;
	}

	global.createLevel= createLevel;



	function importLevel(levelData) {

		global.currentScreen= new global.Screen('level_', [toolbar]);

		global.currentLevel= createLevel(levelData);

		global.currentScreen.name+= global.currentLevel.number;

		if (global.currentLevel.number == 1) {
			displayTutorial();
		}
	}

	global.importLevel= importLevel;
	

	//set up global update loop to control physics of game
	var now= global.Date.now();
	var dt;

	global.update= function () {

		if (document.hidden) {
			return;
		}

		now= global.Date.now();
		dt= (now - global.lastTick)/1000.0;

		if (global.playing) {
			global.currentLevel.update(dt);
		}

		global.lastTick= now;

		setTimeout(global.update, 0);
	}


	//set up global drawing loop to render graphics to screen
	global.draw= function () {

		now= global.Date.now();
		dt= now - global.lastDraw;

		//reset drawing context
		global.scale= global.canvas.scale * global.viewport.scale;
		context.clearRect(0, 0, global.gameDimensions[0], global.gameDimensions[1]);
		
		//draw game objects, passing dt variable to update their animations
		global.currentScreen.draw(dt);

		global.lastDraw= now;

		requestAnimationFrame(global.draw);
	}

	//add event listener to unpause game when page is visible
	window.addEventListener('visibilitychange', function() {
		
		if (!document.hidden && global.playing) {
			
			global.lastDraw= global.Date.now();
			global.lastTick= global.Date.now();
			global.update();

		}
	});

	init();

})(Sol); //pass the global variable here. Passing 'window' will make global variables function normally

