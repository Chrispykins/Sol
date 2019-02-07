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

	global.gameSpeed = 1;

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

		if (!localStorage.Sol_progress) {
			localStorage.Sol_progress= 0;
		}

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
			global.currentLevel= createLevel(global.newLevels[0]);

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

	global.startGame= startGame;

	
	function showCredits() {

		global.credits= new global.Credits({
			lines: [
				{scale: 1.5, text: 'Congratulations!'},
				{scale: 1, text: ''},
				{scale: 1, text: 'Created By:'},
				{scale: 1.5, text: 'Chris Gallegos'},
				{scale: 1, text: ''},
				{scale: 1, text: 'Special Thanks To:'},
				{scale: 1.5, text: 'Ludei, Inc.'},
				{scale: 1, text: ''},
				{scale: 1, text: 'Follow Me on Twitter:'},
				{scale: 1.5, text: '@Chrispykins'},
				{scale: 1, text: ''},
				{scale: 1, text: 'Thanks for Playing!'},

			]
		});

		global.currentScreen.layers.push(global.credits);
	}

	global.showCredits= showCredits;

	
	function createLevel(levelData, saveData) {

		levelData= JSON.parse(levelData);

		if (saveData) levelData.level = JSON.parse(saveData);

		var newLevel= new global.Level(levelData);

		global.currentScreen.layers.unshift(newLevel);

		return newLevel;
	}

	global.createLevel= createLevel;



	function importLevel(levelData) {

		global.currentScreen= new global.Screen('level_', [toolbar]);

		if (global.currentLevel) global.currentLevel.unload();

		global.currentLevel= createLevel(levelData);

		global.currentScreen.name+= global.currentLevel.number;
	}

	global.importLevel= importLevel;


	function loadLevel(number) {

		global.currentScreen = new global.Screen("level_"+number, [toolbar]);

		if (global.currentLevel) global.currentLevel.unload();

		if (global.newLevels[number])   var levelData = global.newLevels[number];
		else if (global.levels[number])	var levelData = global.levels[number];

		if (localStorage.getItem("Sol_level_"+ number)) var saveData = localStorage["Sol_level_"+ number];

		global.currentLevel = createLevel(levelData, saveData);

		if (global.currentLevel.number == 1 && localStorage.Sol_firstTime == 'true') {
			displayTutorial();
			localStorage.Sol_firstTime= 'false';
		}
	}

	global.loadLevel = loadLevel;
	

	//set up global update loop to control physics of game
	var now= global.Date.now();
	var dt;

	//set up frame counting variables
	/*var frameCount= 0;
	var frameTimer= 0;
	var fps= 0;*/

	global.update= function () {

		if (document.hidden) {
			return;
		}

		now= global.Date.now();
		dt= (now - global.lastTick)/1000.0;
		dt = Math.min(dt, .05);
		dt*= global.gameSpeed;

		//DEBUG: frame rate counter
		/*frameTimer+= dt;
		frameCount++;
		if (frameTimer > 0.5) {
			frameTimer+= -0.5;
			fps= frameCount * 2;
			frameCount= 0;
		}*/
		//END DEBUG

		if (global.gameActive) {
			if (global.playing) {
				global.currentLevel.update(dt);
			}

			if (global.credits) {
				global.credits.update(dt);
			}
		}

		global.lastTick= now;

		setTimeout(global.update, 0);
	}


	//set up global drawing loop to render graphics to screen
	global.draw= function () {

		now= global.Date.now();
		dt= now - global.lastDraw;

		if (global.gameActive) {

			//reset drawing context
			global.scale= global.canvas.scale * global.viewport.scale;
			context.clearRect(0, 0, global.gameDimensions[0], global.gameDimensions[1]);

			//draw game objects, passing dt variable to update their animations
			global.currentScreen.draw(dt);

			//DEBUG: frame rate display
			/*context.font= (30 * canvas.scale).toString() +'px Arial';
			context.fillStyle= 'black';
			context.textAlign= 'left';
			context.fillText(fps.toString(), 50 * canvas.scale, 50 * canvas.scale);*/
			//END DEBUG

		}

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

	global.gameActive = true;

	init();

})(Sol); //pass the global variable here. Passing 'window' will make global variables function normally

