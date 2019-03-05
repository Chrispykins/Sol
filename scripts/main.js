////////////////////////////////////////////
// game starts here
////////////////////////////////////////////

function run_main(global) { //whatever is passed to the global parameter will be treated as the global scope of the game, no search will be required beyond this 'global' scope

	var canvas= global.canvas;
	var context= global.context;
	var gameDimensions = global.gameDimensions;

	var images= global.images;
	var sounds= global.sounds;

	var toolbar, noteBar, optionsBar, levelSelect;
	var viewport= global.viewport;

	var sideBarWidth = global.sidebarWidth = 300;
	var sideBarHeight = global.sidebarHeight = 900;
	var toolbarHeight = global.toolbarHeight = 200;
	var levelSelectWidth = global.levelSelectWidth = 1200;
	var levelSelectHeight = global.levelSelectHeight = 200;

	viewport.size= [gameDimensions[0] - sideBarWidth, gameDimensions[1] - toolbarHeight];
	viewport.canvasPos = [sideBarWidth / 2, 0];

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

		var splash= new global.Gui( {size: gameDimensions, image: images.splashScreen} );

		splash.fade= new global.Fade('in', 1000);

		//begin fading the splash screen out after 3 seconds
		/*
		setTimeout(function() {
			
			if (splash) {
				
				splash.fade= new global.Fade('out', 2000);

				splash.fade.onEnd= function() {
					startGame();
					splash= null;
				}

			}
		}, 3000);
		*/

		//fade splash screen when player clicks
		splash.onClick = function() {

			splash.fade= new global.Fade('out', 1000);

			splash.onClick = function() {};

			var loadComplete = global.loadAssets(global.assetPackages.title);

			splash.fade.onEnd = async function() {

				await loadComplete;

				startGame();
				splash= null;
			}

			return true;
		}

		global.currentScreen = new global.Screen('splash', [splash]);

		//begin drawing loop
		global.draw();
	}

	async function displayTutorial() {

		if (!global.assetPackages.tutorial.loaded) await global.loadAssets(global.assetPackages.tutorial);

		//define tutorial image
		var tutorial= new global.Gui({
			size: gameDimensions,
			image: global.images.tutorial_1
		});

		//define click listener for tutorial gui
		tutorial.onClick= function() {
			
			global.currentScreen.layers.pop(); //remove image from screen

			//display next step in tutorial after 2 seconds				
			setTimeout(function() {
				
				var tutorial= new global.Gui({
					size: gameDimensions,
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

			return false;
		}

		//push first tutorial gui onto the current screen
		global.currentScreen.layers.push(tutorial);
	}

	global.displayTutorial = displayTutorial;

	
	async function startGame() {

		if (!localStorage.Sol_progress) {
			localStorage.Sol_progress= 0;
		}

		var title= new global.Gui( {size: gameDimensions, image: images.title} );

		//define fade in for title screen
		title.fade= new global.Fade('in', 1500);

		//skip fade if player clicks on screen
		title.onClick= function() {

			//load "level 0"
			createLevel(global.newLevels[0])
			.then(function(level) {

				global.currentLevel = level;

				global.playing= true;

				//set last tick right before beginning update loop
				global.lastTick= global.Date.now();

				//begin update loop
				global.update();
			});

			if (title.fade) {
				title.fade= null;
			}

			//destroy this click listener
			title.onClick= function() {};

			return true;
		}

		title.fade.onEnd= title.onClick;

		global.currentScreen= new global.Screen('title', [title]);	

		//play title sound
		sounds.titleSound.play();

	}

	global.startGame= startGame;

	async function createSidebars() {

		//create gui elements
		var promises = [];
		for (var i in global.unlockedNotes) {
			var asset = global.assetPackages[global.unlockedNotes[i]];
			promises.push(global.loadAssets(asset));
		}

		promises.push(global.loadAssets(global.assetPackages.sidebars));

		await Promise.all(promises);

		toolbar    = global.toolbar     = new global.Toolbar({xy: [0, 880], size: [1920, toolbarHeight]});
		noteBar    = global.noteBar     = new global.NoteBar({xy: [0, 0], size: [sideBarWidth, sideBarHeight]});
		optionsBar = global.optionsBar  = new global.OptionsBar({xy: [gameDimensions[0] - sideBarWidth, 0], size: [sideBarWidth, sideBarHeight]});
		levelSelect= global.levelSelect = new global.LevelSelect({xy: [(gameDimensions[0] - levelSelectWidth)/2, gameDimensions[1] - levelSelectHeight], size: [levelSelectWidth, levelSelectHeight]})
	}


	global.createSidebars = createSidebars;

	
	async function showCredits() {

		if (!global.assetPackages.credits.loaded) await global.loadAssets(global.assetPackages.credits);

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

	
	async function createLevel(levelData, saveData) {

		levelData= JSON.parse(levelData);

		if (saveData) levelData.level = JSON.parse(saveData);

		if (!levelData.assets) levelData.assets = global.createAssetList(levelData);

		var promises = [];
		for (var i in levelData.assets) {
			var asset = global.assetPackages[levelData.assets[i]];
			if (asset && !asset.loaded) promises[i] = global.loadAssets(asset);
		}

		await Promise.all(promises);

		var newLevel = new global.Level(levelData);

		global.currentScreen.layers.unshift(newLevel);

		return newLevel;
	}

	global.createLevel= createLevel;



	async function importLevel(levelData) {

		global.currentScreen= new global.Screen('level_', [toolbar, noteBar, optionsBar, levelSelect]);

		if (global.currentLevel) global.currentLevel.unload();

		global.currentLevel= await createLevel(levelData);

		global.currentScreen.name+= global.currentLevel.number;
	}

	global.importLevel= importLevel;


	async function loadLevel(number) {

		if (global.currentLevel) await global.currentLevel.unload();

		global.currentScreen = new global.Screen("level_"+number, [toolbar, noteBar, optionsBar, levelSelect]);

		if (global.newLevels[number])   var levelData = global.newLevels[number];
		else if (global.levels[number])	var levelData = global.levels[number];

		if (localStorage.getItem("Sol_level_"+ number)) var saveData = localStorage["Sol_level_"+ number];

		global.currentLevel = await createLevel(levelData, saveData);

		if (global.currentLevel.number == 1 && localStorage.Sol_firstTime) {
			global.loadAssets(global.assetPackages.tutorial);
		}
	}

	global.loadLevel = loadLevel;
	

	//set up global update loop to control physics of game
	var now= global.Date.now();
	var dt;

	//set up frame counting variables
	/*
	var frameCount= 0;
	var frameTimer= 0;
	var fps= 0;
	*/

	global.update= function () {

		if (document.hidden) {
			return;
		}

		now= global.Date.now();
		dt= (now - global.lastTick)/1000.0;
		dt = Math.min(dt, .05);
		dt*= global.gameSpeed;

		//DEBUG: frame rate counter
		/*
		frameTimer+= dt;
		frameCount++;
		if (frameTimer > 0.5) {
			frameTimer+= -0.5;
			fps= frameCount * 2;
			frameCount= 0;
		}
		*/
		//END DEBUG

		if (global.gameActive) {

			if (global.playing) global.currentLevel.update(dt);

			if (global.credits) global.credits.update(dt);
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
			/*
			context.font= (30 * canvas.scale).toString() +'px Arial';
			context.fillStyle= 'black';
			context.textAlign= 'left';
			context.fillText(fps.toString(), 50 * canvas.scale, 50 * canvas.scale);
			*/
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

}